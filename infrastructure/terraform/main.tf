# ─────────────────────────────────────────────────────────────────────────────
# Property Settlement OS — AWS Infrastructure (Terraform)
# Region: ap-southeast-2 (Sydney)
# ─────────────────────────────────────────────────────────────────────────────

terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    bucket = "psos-terraform-state"
    key    = "production/terraform.tfstate"
    region = "ap-southeast-2"
  }
}

provider "aws" {
  region = var.aws_region
}

# ── Variables ─────────────────────────────────────────────────────────────────

variable "aws_region"     { default = "ap-southeast-2" }
variable "environment"    { default = "production" }
variable "app_name"       { default = "settlement-os" }
variable "db_password"    { sensitive = true }
variable "jwt_secret"     { sensitive = true }

locals {
  name_prefix = "${var.app_name}-${var.environment}"
  tags = {
    Project     = "SettlementOS"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# ── VPC ───────────────────────────────────────────────────────────────────────

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "${local.name_prefix}-vpc"
  cidr = "10.0.0.0/16"

  azs              = ["${var.aws_region}a", "${var.aws_region}b"]
  private_subnets  = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets   = ["10.0.101.0/24", "10.0.102.0/24"]

  enable_nat_gateway   = true
  single_nat_gateway   = false  # HA in production
  enable_dns_hostnames = true

  tags = local.tags
}

# ── RDS PostgreSQL ────────────────────────────────────────────────────────────

resource "aws_db_subnet_group" "main" {
  name       = "${local.name_prefix}-db-subnet"
  subnet_ids = module.vpc.private_subnets
  tags       = local.tags
}

resource "aws_db_instance" "postgres" {
  identifier        = "${local.name_prefix}-postgres"
  engine            = "postgres"
  engine_version    = "15.4"
  instance_class    = "db.t3.medium"
  allocated_storage = 50
  storage_encrypted = true

  db_name  = "settlement_os"
  username = "postgres"
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  multi_az               = true
  deletion_protection    = true
  skip_final_snapshot    = false
  final_snapshot_identifier = "${local.name_prefix}-final"

  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "Sun:04:00-Sun:05:00"

  tags = local.tags
}

# ── ElastiCache Redis ─────────────────────────────────────────────────────────

resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "${local.name_prefix}-redis"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.main.name
  security_group_ids   = [aws_security_group.redis.id]
  tags                 = local.tags
}

resource "aws_elasticache_subnet_group" "main" {
  name       = "${local.name_prefix}-redis-subnet"
  subnet_ids = module.vpc.private_subnets
}

# ── S3 Document Storage ───────────────────────────────────────────────────────

resource "aws_s3_bucket" "documents" {
  bucket = "${local.name_prefix}-documents"
  tags   = local.tags
}

resource "aws_s3_bucket_server_side_encryption_configuration" "documents" {
  bucket = aws_s3_bucket.documents.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "documents" {
  bucket                  = aws_s3_bucket.documents.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ── ECS Cluster ──────────────────────────────────────────────────────────────

resource "aws_ecs_cluster" "main" {
  name = "${local.name_prefix}-cluster"
  tags = local.tags

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# ── Security Groups ───────────────────────────────────────────────────────────

resource "aws_security_group" "rds" {
  name   = "${local.name_prefix}-rds-sg"
  vpc_id = module.vpc.vpc_id
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [module.vpc.vpc_cidr_block]
  }
  egress { from_port = 0; to_port = 0; protocol = "-1"; cidr_blocks = ["0.0.0.0/0"] }
  tags = local.tags
}

resource "aws_security_group" "redis" {
  name   = "${local.name_prefix}-redis-sg"
  vpc_id = module.vpc.vpc_id
  ingress {
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    cidr_blocks = [module.vpc.vpc_cidr_block]
  }
  egress { from_port = 0; to_port = 0; protocol = "-1"; cidr_blocks = ["0.0.0.0/0"] }
  tags = local.tags
}

# ── Outputs ───────────────────────────────────────────────────────────────────

output "rds_endpoint"   { value = aws_db_instance.postgres.endpoint }
output "redis_endpoint" { value = aws_elasticache_cluster.redis.cache_nodes[0].address }
output "s3_bucket_name" { value = aws_s3_bucket.documents.bucket }
output "ecs_cluster_arn" { value = aws_ecs_cluster.main.arn }
