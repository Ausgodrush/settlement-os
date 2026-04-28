# Database Schema — Property Settlement OS

## Tables

### users
```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name    VARCHAR(100) NOT NULL,
  last_name     VARCHAR(100) NOT NULL,
  phone         VARCHAR(20),
  role          VARCHAR(30) NOT NULL CHECK (role IN ('BUYER','SELLER','BUYER_CONVEYANCER','SELLER_CONVEYANCER','AGENT','ADMIN')),
  firm_name     VARCHAR(255),           -- for conveyancers/agents
  license_no    VARCHAR(100),           -- for conveyancers/agents
  mfa_secret    VARCHAR(255),           -- TOTP secret (Phase 2)
  mfa_enabled   BOOLEAN DEFAULT FALSE,
  is_active     BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role  ON users(role);
```

### deals
```sql
CREATE TABLE deals (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_no      VARCHAR(20) UNIQUE NOT NULL,  -- e.g. PSOS-2024-0042
  status            VARCHAR(20) NOT NULL DEFAULT 'INIT'
                    CHECK (status IN ('INIT','ACTIVE','READY','SETTLED','CANCELLED')),
  -- Property
  property_address  TEXT NOT NULL,
  property_suburb   VARCHAR(100) NOT NULL,
  property_state    VARCHAR(10) NOT NULL DEFAULT 'SA',
  property_postcode VARCHAR(10) NOT NULL,
  title_reference   VARCHAR(50),                  -- CT volume/folio
  land_services_ref VARCHAR(50),                  -- Land Services SA reference
  -- Financials
  purchase_price    NUMERIC(14,2) NOT NULL,
  deposit_amount    NUMERIC(14,2),
  deposit_paid      BOOLEAN DEFAULT FALSE,
  deposit_paid_at   TIMESTAMPTZ,
  -- Dates
  contract_date     DATE,
  settlement_date   DATE,
  actual_settled_at TIMESTAMPTZ,
  -- PEXA
  pexa_workspace_id VARCHAR(100),
  pexa_status       VARCHAR(50),
  -- Metadata
  notes             TEXT,
  created_by        UUID REFERENCES users(id),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_deals_status         ON deals(status);
CREATE INDEX idx_deals_settlement_date ON deals(settlement_date);
CREATE INDEX idx_deals_reference_no   ON deals(reference_no);
```

### deal_parties
```sql
CREATE TABLE deal_parties (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id    UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id),
  party_role VARCHAR(30) NOT NULL
             CHECK (party_role IN ('BUYER','SELLER','BUYER_CONVEYANCER','SELLER_CONVEYANCER','AGENT')),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  is_active   BOOLEAN DEFAULT TRUE,
  UNIQUE(deal_id, party_role)   -- one person per role per deal
);
CREATE INDEX idx_deal_parties_deal_id ON deal_parties(deal_id);
CREATE INDEX idx_deal_parties_user_id ON deal_parties(user_id);
```

### conditions
```sql
CREATE TABLE conditions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id         UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  name            VARCHAR(200) NOT NULL,
  description     TEXT,
  condition_type  VARCHAR(50) NOT NULL
                  CHECK (condition_type IN ('BOOLEAN_FLAG','DATE_DEADLINE','DOCUMENT_UPLOAD','EXTERNAL_CONFIRMATION','APPROVAL')),
  rule_json       JSONB NOT NULL,           -- structured rule definition
  status          VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                  CHECK (status IN ('PENDING','MET','WAIVED','FAILED')),
  assigned_to_role VARCHAR(30),             -- which party is responsible
  evidence_doc_id  UUID,                   -- optional supporting document
  waived_by       UUID REFERENCES users(id),
  waived_reason   TEXT,
  met_at          TIMESTAMPTZ,
  evaluated_at    TIMESTAMPTZ,
  due_date        DATE,
  display_order   INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_conditions_deal_id ON conditions(deal_id);
CREATE INDEX idx_conditions_status  ON conditions(status);
```

### milestones
```sql
CREATE TABLE milestones (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id         UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  name            VARCHAR(200) NOT NULL,
  milestone_type  VARCHAR(50) NOT NULL
                  CHECK (milestone_type IN (
                    'CONTRACT_SIGNED','DEPOSIT_PAID','FINANCE_APPROVED',
                    'INSPECTION_COMPLETE','TITLE_CHECKED','DOCUMENTS_VERIFIED',
                    'SETTLEMENT_BOOKED','KEYS_RELEASED','SETTLED','CUSTOM'
                  )),
  status          VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                  CHECK (status IN ('PENDING','IN_PROGRESS','COMPLETE','BLOCKED')),
  due_date        DATE,
  completed_at    TIMESTAMPTZ,
  completed_by    UUID REFERENCES users(id),
  assigned_to_role VARCHAR(30),
  notes           TEXT,
  display_order   INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_milestones_deal_id ON milestones(deal_id);
```

### documents
```sql
CREATE TABLE documents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id         UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  uploaded_by     UUID NOT NULL REFERENCES users(id),
  name            VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  doc_type        VARCHAR(50) NOT NULL
                  CHECK (doc_type IN (
                    'CONTRACT','ID_VERIFICATION','FINANCE_APPROVAL',
                    'BUILDING_INSPECTION','PEST_INSPECTION','TITLE_SEARCH',
                    'DISCHARGE_MORTGAGE','TRANSFER','SETTLEMENT_STATEMENT',
                    'DISCLOSURE','OTHER'
                  )),
  s3_bucket       VARCHAR(255) NOT NULL,
  s3_key          VARCHAR(500) NOT NULL,
  file_size_bytes BIGINT,
  mime_type       VARCHAR(100),
  checksum_sha256 VARCHAR(64),
  is_signed       BOOLEAN DEFAULT FALSE,
  docusign_envelope_id VARCHAR(100),
  verified        BOOLEAN DEFAULT FALSE,
  verified_by     UUID REFERENCES users(id),
  verified_at     TIMESTAMPTZ,
  deleted_at      TIMESTAMPTZ,              -- soft delete
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_documents_deal_id  ON documents(deal_id);
CREATE INDEX idx_documents_doc_type ON documents(doc_type);
```

### audit_logs
```sql
CREATE TABLE audit_logs (
  id            BIGSERIAL PRIMARY KEY,           -- sequential, not UUID (for ordering)
  deal_id       UUID REFERENCES deals(id),       -- nullable (some actions are global)
  user_id       UUID REFERENCES users(id),
  action        VARCHAR(100) NOT NULL,           -- e.g. DEAL_STATUS_CHANGED, CONDITION_MET
  entity_type   VARCHAR(50),                     -- e.g. deal, condition, document
  entity_id     UUID,
  old_value     JSONB,
  new_value     JSONB,
  metadata      JSONB,                           -- extra context
  ip_address    INET,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
  -- NO updated_at, NO delete — this table is append-only
);
CREATE INDEX idx_audit_logs_deal_id    ON audit_logs(deal_id);
CREATE INDEX idx_audit_logs_user_id    ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action     ON audit_logs(action);
-- Prevent updates and deletes via trigger
CREATE RULE no_update_audit AS ON UPDATE TO audit_logs DO INSTEAD NOTHING;
CREATE RULE no_delete_audit AS ON DELETE TO audit_logs DO INSTEAD NOTHING;
```

### activities (deal activity feed)
```sql
CREATE TABLE activities (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id     UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id),         -- NULL for system events
  actor_role  VARCHAR(30),
  event_type  VARCHAR(50) NOT NULL,              -- e.g. COMMENT, STATUS_CHANGED, DOCUMENT_UPLOADED
  message     TEXT NOT NULL,
  metadata    JSONB,
  is_system   BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_activities_deal_id    ON activities(deal_id);
CREATE INDEX idx_activities_created_at ON activities(created_at DESC);
```

### notifications
```sql
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id),
  deal_id     UUID REFERENCES deals(id),
  title       VARCHAR(255) NOT NULL,
  message     TEXT NOT NULL,
  channel     VARCHAR(10) NOT NULL CHECK (channel IN ('EMAIL','SMS','IN_APP')),
  status      VARCHAR(20) NOT NULL DEFAULT 'PENDING'
              CHECK (status IN ('PENDING','SENT','FAILED','READ')),
  read_at     TIMESTAMPTZ,
  sent_at     TIMESTAMPTZ,
  error_msg   TEXT,
  provider_id VARCHAR(255),                     -- SendGrid/Twilio message ID
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status  ON notifications(status);
```

### settlement_executions
```sql
CREATE TABLE settlement_executions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id             UUID NOT NULL UNIQUE REFERENCES deals(id),
  status              VARCHAR(30) NOT NULL DEFAULT 'PENDING'
                      CHECK (status IN ('PENDING','VALIDATING','APPROVED','EXECUTING','COMPLETED','FAILED')),
  initiated_by        UUID REFERENCES users(id),
  validated_at        TIMESTAMPTZ,
  validation_result   JSONB,                    -- which conditions passed/failed
  pexa_workspace_id   VARCHAR(100),
  pexa_lodgement_ref  VARCHAR(100),
  pexa_triggered_at   TIMESTAMPTZ,
  escrow_released     BOOLEAN DEFAULT FALSE,
  escrow_released_at  TIMESTAMPTZ,
  escrow_tx_hash      VARCHAR(100),             -- Phase 2: blockchain tx hash
  completed_at        TIMESTAMPTZ,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);
```

### refresh_tokens
```sql
CREATE TABLE refresh_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  VARCHAR(255) NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  revoked     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
```

---

## Entity Relationships

```
users
  ├──< deal_parties >── deals
  ├──< documents
  ├──< notifications
  └──< audit_logs

deals
  ├──< deal_parties
  ├──< conditions
  ├──< milestones
  ├──< documents
  ├──< activities
  ├──< audit_logs
  └── settlement_executions
```

---

## Standard Seed Data

```sql
-- Default milestone templates (applied when deal goes ACTIVE)
-- Inserted by application logic, not hardcoded in DB

-- Example condition rule JSON structures:
-- BOOLEAN_FLAG:
{
  "type": "BOOLEAN_FLAG",
  "field": "finance_approved",
  "required_approver_role": "BUYER_CONVEYANCER"
}

-- DATE_DEADLINE:
{
  "type": "DATE_DEADLINE",
  "deadline_field": "finance_deadline",
  "action_on_miss": "FLAG"
}

-- DOCUMENT_UPLOAD:
{
  "type": "DOCUMENT_UPLOAD",
  "required_doc_type": "FINANCE_APPROVAL",
  "verified_required": true
}

-- APPROVAL (multi-party):
{
  "type": "APPROVAL",
  "approvers": ["BUYER_CONVEYANCER", "SELLER_CONVEYANCER"],
  "require_all": true
}
```
