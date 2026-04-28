# Property Settlement OS — System Architecture

## Overview

Property Settlement OS (PSOS) is a workflow coordination platform for residential property transactions in South Australia. It does **not** replace legal conveyancing — it automates coordination, tracks conditions, and orchestrates settlement readiness across all parties.

---

## System Context Diagram

```
                        ┌─────────────────────────────────────┐
                        │         PROPERTY SETTLEMENT OS       │
                        │                                       │
  ┌──────────┐          │  ┌──────────┐    ┌────────────────┐  │
  │  Buyer   │◄────────►│  │ Next.js  │    │   NestJS API   │  │
  └──────────┘          │  │ Frontend │◄──►│   (REST + WS)  │  │
  ┌──────────┐          │  └──────────┘    └───────┬────────┘  │
  │  Seller  │◄────────►│                          │           │
  └──────────┘          │                  ┌───────▼────────┐  │
  ┌──────────┐          │                  │   PostgreSQL   │  │
  │Conveyanc.│◄────────►│                  └────────────────┘  │
  └──────────┘          │                  ┌────────────────┐  │
  ┌──────────┐          │                  │   AWS S3       │  │
  │  Agent   │◄────────►│                  │  (Documents)   │  │
  └──────────┘          │                  └────────────────┘  │
                        │                  ┌────────────────┐  │
                        │                  │  Redis + Bull  │  │
                        │                  │  (Job Queues)  │  │
                        │                  └────────────────┘  │
                        └─────────────────────────────────────┘
                                      │            │
                        ┌─────────────▼──┐  ┌──────▼──────────┐
                        │  PEXA (mock)   │  │ DocuSign (mock) │
                        └────────────────┘  └─────────────────┘
                        ┌────────────────┐  ┌─────────────────┐
                        │ SendGrid Email │  │  Twilio SMS     │
                        └────────────────┘  └─────────────────┘
```

---

## Domain Model

```
Deal (central aggregate)
  ├── Parties (buyer, seller, buyer_conveyancer, seller_conveyancer, agent)
  ├── Conditions (finance_approved, inspection_complete, title_checked, ...)
  ├── Milestones (contract_signed, deposit_paid, settlement_ready, ...)
  ├── Documents (contracts, IDs, certificates, disclosures)
  ├── Activity Feed (replaces email thread)
  ├── Audit Logs (immutable action trail)
  └── Settlement Execution (final validation + PEXA trigger)
```

---

## Deal Lifecycle

```
INIT ──► ACTIVE ──► READY ──► SETTLED
  │         │          │
  │    conditions   all conditions
  │    pending      met + conveyancer
  │                 approved
  │
  └── CANCELLED (at any stage)
```

### State Transitions

| From     | To       | Trigger                                              |
|----------|----------|------------------------------------------------------|
| INIT     | ACTIVE   | Contract signed + all parties assigned               |
| ACTIVE   | READY    | All conditions met + conveyancer marks ready         |
| READY    | SETTLED  | Funds confirmed + backend validates + PEXA triggered |
| Any      | CANCELLED| Any party or conveyancer cancels                     |

---

## Backend Architecture (NestJS)

```
src/
├── main.ts                        # Bootstrap, Swagger, global pipes
├── app.module.ts                  # Root module
├── database/
│   ├── database.module.ts
│   └── entities/                  # TypeORM entities
├── common/
│   ├── guards/                    # JwtAuthGuard, RolesGuard
│   ├── decorators/                # @Roles(), @CurrentUser()
│   ├── filters/                   # HttpExceptionFilter
│   └── interceptors/              # AuditInterceptor
└── modules/
    ├── auth/                      # JWT login, refresh, MFA design
    ├── users/                     # User CRUD + profile
    ├── deals/                     # Deal lifecycle + party management
    ├── conditions/                # Condition engine + rule evaluation
    ├── documents/                 # S3 upload/download + DocuSign mock
    ├── notifications/             # Email (SendGrid) + SMS (Twilio)
    ├── audit/                     # Immutable audit log service
    ├── settlement/                # Settlement validation + execution
    ├── websockets/                # Socket.io gateway (real-time)
    └── integrations/              # PEXA mock, DocuSign mock
```

---

## Frontend Architecture (Next.js 14)

```
src/
├── app/
│   ├── layout.tsx                 # Root layout with sidebar
│   ├── page.tsx                   # Login redirect
│   ├── dashboard/                 # Role-based dashboard
│   ├── deals/
│   │   ├── page.tsx               # Deal list
│   │   ├── new/page.tsx           # Create deal
│   │   └── [id]/page.tsx          # Deal workspace
│   ├── conveyancer/               # Conveyancer pipeline
│   └── documents/                 # Document management
├── components/
│   ├── layout/                    # Sidebar, Header
│   ├── deals/                     # DealCard, Timeline, Conditions, Activity
│   ├── conveyancer/               # PipelineView, ActionQueue
│   └── ui/                        # Button, Badge, Modal, etc.
├── lib/
│   ├── api.ts                     # Typed API client (fetch wrapper)
│   ├── websocket.ts               # Socket.io client wrapper
│   └── auth.ts                    # JWT storage + refresh
├── hooks/
│   ├── useDeals.ts
│   ├── useWebSocket.ts
│   └── useAuth.ts
└── types/index.ts                 # Shared TypeScript types
```

---

## Condition Engine

The core differentiator. Conditions are stored as structured JSON and evaluated server-side.

### Rule Structure

```json
{
  "id": "uuid",
  "name": "Finance Approval",
  "type": "BOOLEAN_FLAG",
  "rule": {
    "operator": "AND",
    "conditions": [
      { "field": "finance_approved", "op": "eq", "value": true },
      { "field": "finance_approved_by", "op": "role", "value": "BUYER_CONVEYANCER" }
    ]
  },
  "status": "PENDING"
}
```

### Settlement Gate

```typescript
IF finance_approved
AND inspection_complete
AND title_checked
AND deposit_confirmed
AND conveyancer_approved
THEN allow_settlement()
```

---

## Security Architecture

| Layer          | Mechanism                                              |
|----------------|--------------------------------------------------------|
| Authentication | JWT (access 15min + refresh 7d), bcrypt passwords      |
| Authorization  | Role-based guards (BUYER, SELLER, CONVEYANCER, AGENT, ADMIN) |
| MFA            | TOTP (Google Authenticator compatible) — Phase 2      |
| Documents      | S3 presigned URLs (time-limited, role-scoped)          |
| Transport      | HTTPS + WSS only in production                         |
| Data           | Column-level encryption for sensitive PII (Phase 2)    |
| Audit          | Append-only audit_logs table, no UPDATE/DELETE         |

---

## Infrastructure

```
AWS Region: ap-southeast-2 (Sydney)

├── VPC
│   ├── Public Subnets  → ALB, NAT Gateway
│   └── Private Subnets → ECS tasks, RDS, ElastiCache
├── ECS Fargate
│   ├── backend service  (NestJS, 2 tasks min)
│   └── frontend service (Next.js, 2 tasks min)
├── RDS PostgreSQL 15   (Multi-AZ for production)
├── ElastiCache Redis   (Bull queues + sessions)
├── S3                  (Document storage, encrypted)
├── CloudFront          (Frontend CDN)
├── ALB                 (Load balancing + SSL termination)
├── Route 53            (DNS)
├── ACM                 (SSL certificates)
├── SES / SendGrid      (Email)
└── CloudWatch          (Logs, metrics, alarms)
```

---

## Integration Points

| System       | Phase | Method                                    |
|--------------|-------|-------------------------------------------|
| PEXA         | MVP   | Mock service simulating webhook callbacks |
| PEXA         | v2    | Real PEXA workspace API (OAuth2)          |
| Land Srv SA  | MVP   | Conveyancer manually confirms title        |
| DocuSign     | MVP   | Mock signing flow with status simulation  |
| DocuSign     | v2    | DocuSign Connect webhooks                 |
| Identity     | MVP   | Manual upload + conveyancer verification  |
| Identity     | v2    | GreenID or similar AML/KYC provider       |
| Smart Contract| Phase 2| Polygon/Ethereum escrow contract        |

---

## Scalability Notes

- All deal state changes emit WebSocket events — no polling required
- Bull queues decouple notification delivery from request path
- Condition evaluation is stateless and cacheable per deal
- Audit logs are write-only — no reads in hot path
- Document metadata in PostgreSQL; binary in S3 only
