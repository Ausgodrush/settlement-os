# Property Settlement OS

**A workflow coordination platform for residential property settlements in South Australia.**

Replaces email, spreadsheets, and manual coordination with a structured, real-time operating system for buyers, sellers, conveyancers, and agents — while working *within* the existing PEXA / Land Services SA legal framework.

---

## Quick Start (Development)

```bash
# 1. Clone and navigate
cd settlement-os

# 2. Start infrastructure (PostgreSQL + Redis)
cd infrastructure
docker compose up postgres redis -d

# 3. Start backend
cd ../backend
cp .env.example .env    # edit with your values
npm install
npm run start:dev

# 4. Start frontend
cd ../frontend
cp .env.example .env.local
npm install
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/v1
- Swagger Docs: http://localhost:3001/docs

---

## Tech Stack

| Layer         | Technology                                              |
|---------------|---------------------------------------------------------|
| Frontend      | Next.js 14 (App Router), Tailwind CSS, Socket.io client |
| Backend       | NestJS 10, TypeORM, Passport JWT                        |
| Database      | PostgreSQL 15                                           |
| Queues        | Redis + Bull                                            |
| Real-time     | Socket.io (WebSockets)                                  |
| Documents     | AWS S3 (presigned URLs)                                 |
| Email         | SendGrid                                                |
| SMS           | Twilio                                                  |
| Infrastructure| AWS (ECS Fargate, RDS, ElastiCache, S3, ALB, CloudFront)|
| IaC           | Terraform                                               |
| Smart Contract| Solidity (Phase 2, Polygon)                             |

---

## Project Structure

```
settlement-os/
├── backend/               NestJS API (REST + WebSocket)
│   └── src/
│       ├── modules/
│       │   ├── auth/          JWT authentication
│       │   ├── users/         User management
│       │   ├── deals/         Deal lifecycle (INIT→SETTLED)
│       │   ├── conditions/    Condition engine (core differentiator)
│       │   ├── documents/     S3 document management
│       │   ├── notifications/ Email + SMS via queues
│       │   ├── audit/         Immutable audit logs + activity feed
│       │   ├── settlement/    Settlement validation + execution
│       │   ├── websockets/    Real-time Socket.io gateway
│       │   └── integrations/  PEXA mock + DocuSign mock
│       └── database/entities/ TypeORM entities
├── frontend/              Next.js app
│   └── src/
│       ├── app/           Pages (dashboard, deals, conveyancer)
│       ├── components/    UI components
│       ├── hooks/         useDeals, useWebSocket, useAuth
│       ├── lib/           API client, WebSocket, auth utils
│       └── types/         Shared TypeScript types
├── infrastructure/        Docker Compose, Dockerfiles, Terraform, Nginx
├── contracts/             Smart contract skeleton (Phase 2)
└── docs/                  Architecture, DB schema, API design
```

---

## Deal Lifecycle

```
INIT → ACTIVE → READY → SETTLED
                 ↑
         Conveyancer approves
         after all conditions met
```

### Roles

| Role                 | Can Do                                              |
|----------------------|-----------------------------------------------------|
| BUYER                | View deal, upload documents, see activity           |
| SELLER               | View deal, upload documents, see activity           |
| BUYER_CONVEYANCER    | Mark conditions met/waived, verify docs, approve settlement |
| SELLER_CONVEYANCER   | Mark conditions met/waived, verify docs, execute settlement |
| AGENT                | View deal, add parties                             |
| ADMIN                | Full access                                         |

---

## Condition Engine

The core differentiator. Conditions are stored as structured JSON and evaluated server-side:

```
POST /v1/deals/:id/conditions/evaluate

Response:
{
  "settlementAllowed": false,
  "blockers": [
    "Finance Approval has not been confirmed yet",
    "Pest Inspection: verified document not found"
  ],
  "conditions": [
    { "name": "Finance Approval", "passed": false },
    { "name": "Title Check",      "passed": true  },
    ...
  ]
}
```

**Settlement gate:**
```
IF finance_approved
AND inspection_complete
AND title_checked
AND deposit_confirmed
AND conveyancer_approved
THEN allow_settlement()
```

---

## Settlement Flow

```
1. POST /deals/:id/settlement/validate      → Check all conditions
2. POST /deals/:id/settlement/approve       → Conveyancer approves (ACTIVE→READY)
3. POST /deals/:id/settlement/execute       → Execute settlement:
   a. Validate conditions (final gate)
   b. Release escrow (simulated in MVP)
   c. Trigger PEXA (mocked in MVP)
   d. Update deal status → SETTLED
   e. Notify all parties via email/SMS
   f. Emit settlement:status WebSocket event
```

---

## API

Full API documentation: `http://localhost:3001/docs` (Swagger UI)

See [docs/API_DESIGN.md](docs/API_DESIGN.md) for detailed endpoint reference.

---

## Database Schema

See [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)

Key tables: `users`, `deals`, `deal_parties`, `conditions`, `milestones`, `documents`, `audit_logs`, `activities`, `notifications`, `settlement_executions`

---

## Phase 2 Roadmap

| Feature                    | Notes                                              |
|----------------------------|----------------------------------------------------|
| Real PEXA integration      | OAuth2 + NECS API                                  |
| DocuSign e-signatures      | DocuSign Connect webhooks                          |
| MFA (TOTP)                 | Google Authenticator compatible                    |
| Identity verification      | GreenID or similar AML/KYC                         |
| Smart contract escrow      | Polygon, see `contracts/EscrowSettlement.sol`      |
| Column-level PII encryption| For sensitive personal data                        |
| Mobile app                 | React Native                                       |
| SA-specific stamp duty calculator | Land Services SA integration              |

---

## Security

- JWT (access 15min + refresh 7 days)
- Role-based access control on every endpoint
- S3 presigned URLs (time-limited, 1hr)
- Audit logs: append-only, no UPDATE/DELETE
- Document encryption at rest (AES-256 on S3)
- Helmet + CORS + rate limiting on API
- MFA: designed, Phase 2 implementation

---

## Integrations (MVP Mocks)

| Integration | Status | How to enable real |
|-------------|--------|--------------------|
| PEXA        | Mocked | Set `PEXA_MOCK_MODE=false`, configure OAuth2 |
| DocuSign    | Mocked | Set `DOCUSIGN_MOCK_MODE=false`, configure JWT grant |
| SendGrid    | Real   | Set `SENDGRID_API_KEY` |
| Twilio      | Real   | Set `TWILIO_*` env vars |

---

*Built for the Australian property market. Not a legal service. PEXA and Land Services SA handle the legal transfer — this platform coordinates the workflow.*
