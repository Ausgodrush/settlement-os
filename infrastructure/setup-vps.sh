#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Settlement OS — Hostinger VPS Setup Script
# Ubuntu 22.04 LTS
# Run as root: bash setup-vps.sh
# ─────────────────────────────────────────────────────────────────────────────

set -e  # exit immediately on any error

DOMAIN="settlementos.com.au"
WWW_DOMAIN="www.settlementos.com.au"
REPO="https://github.com/Ausgodrush/settlement-os.git"
APP_DIR="/opt/settlement-os"
EMAIL="wewhothem@gmail.com"

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║        Settlement OS — VPS Setup                        ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# ── 1. System update ─────────────────────────────────────────────────────────
echo "▶ Updating system packages..."
apt update -y && apt upgrade -y
apt install -y curl git ufw

# ── 2. Firewall ───────────────────────────────────────────────────────────────
echo "▶ Configuring firewall..."
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 9443/tcp   # Portainer
ufw --force enable

# ── 3. Docker ────────────────────────────────────────────────────────────────
echo "▶ Installing Docker..."
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# Docker Compose plugin
apt install -y docker-compose-plugin
echo "   Docker $(docker --version) installed"
echo "   Docker Compose $(docker compose version) installed"

# ── 4. Nginx ─────────────────────────────────────────────────────────────────
echo "▶ Installing Nginx..."
apt install -y nginx
systemctl enable nginx
systemctl start nginx

# ── 5. Certbot + SSL ─────────────────────────────────────────────────────────
echo "▶ Installing Certbot..."
apt install -y certbot python3-certbot-nginx

echo "▶ Obtaining SSL certificate for $DOMAIN and $WWW_DOMAIN..."
certbot --nginx \
  --non-interactive \
  --agree-tos \
  --email "$EMAIL" \
  -d "$DOMAIN" \
  -d "$WWW_DOMAIN"

# Auto-renewal cron
(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet") | crontab -
echo "   SSL certificate issued and auto-renewal scheduled"

# ── 6. Portainer ─────────────────────────────────────────────────────────────
echo "▶ Installing Portainer..."
docker volume create portainer_data
docker run -d \
  --name portainer \
  --restart=always \
  -p 9443:9443 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:latest
echo "   Portainer running at https://$(curl -s ifconfig.me):9443"

# ── 7. Clone repo ────────────────────────────────────────────────────────────
echo "▶ Cloning Settlement OS repository..."
mkdir -p "$APP_DIR"
git clone "$REPO" "$APP_DIR"
cd "$APP_DIR"

# ── 8. Environment file ──────────────────────────────────────────────────────
echo "▶ Creating backend .env from example..."
cp backend/.env.example backend/.env
echo ""
echo "  ⚠️  IMPORTANT: Edit backend/.env before starting the app."
echo "     Run: nano $APP_DIR/backend/.env"
echo "     Fill in: DB_PASSWORD, JWT_SECRET, AWS keys, Stripe keys, etc."
echo ""

# ── 9. Build and start ───────────────────────────────────────────────────────
echo "▶ Building and starting containers (this takes a few minutes)..."
cd "$APP_DIR/infrastructure"
docker compose build --no-cache
docker compose up -d

# ── 10. Done ─────────────────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  ✅  Setup complete!                                     ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║  🌐  Website:   https://$WWW_DOMAIN"
echo "║  🔧  Portainer: https://$(curl -s ifconfig.me):9443"
echo "║  📋  API docs:  (disabled in production)"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║  Next steps:                                             ║"
echo "║  1. Edit backend/.env with real credentials             ║"
echo "║     nano $APP_DIR/backend/.env"
echo "║  2. Restart containers after editing .env:              ║"
echo "║     cd $APP_DIR/infrastructure && docker compose restart ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
