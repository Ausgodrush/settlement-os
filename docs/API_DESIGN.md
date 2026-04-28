# API Design — Property Settlement OS

Base URL: `https://api.settlement-os.com.au/v1`
Auth: Bearer JWT in `Authorization` header

---

## Authentication

### POST /auth/login
```json
// Request
{ "email": "john@firm.com.au", "password": "secret123" }

// Response 200
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "expires_in": 900,
  "user": {
    "id": "uuid",
    "email": "john@firm.com.au",
    "firstName": "John",
    "lastName": "Smith",
    "role": "BUYER_CONVEYANCER",
    "firmName": "Smith & Associates"
  }
}
```

### POST /auth/refresh
```json
// Request
{ "refresh_token": "eyJhbGc..." }
// Response 200: { "access_token": "eyJhbGc...", "expires_in": 900 }
```

### POST /auth/logout
```json
// Request: { "refresh_token": "eyJhbGc..." }
// Response 204: No Content
```

---

## Users

### GET /users/me
```json
// Response 200
{
  "id": "uuid",
  "email": "jane@realty.com.au",
  "firstName": "Jane",
  "lastName": "Cooper",
  "phone": "+61412345678",
  "role": "AGENT",
  "firmName": "Cooper Realty",
  "licenseNo": "RLA12345"
}
```

### PATCH /users/me
```json
// Request: { "phone": "+61498765432", "firmName": "Cooper Realty Group" }
// Response 200: updated user object
```

### GET /users?role=BUYER_CONVEYANCER (ADMIN only)
```json
// Response 200: { "data": [...users], "total": 45, "page": 1, "limit": 20 }
```

---

## Deals

### POST /deals
Creates a new deal in INIT status.
```json
// Request
{
  "propertyAddress": "14 Glenelg Street",
  "propertySuburb": "Norwood",
  "propertyState": "SA",
  "propertyPostcode": "5067",
  "titleReference": "CT 6142/456",
  "purchasePrice": 850000,
  "depositAmount": 85000,
  "contractDate": "2024-03-15",
  "settlementDate": "2024-05-15"
}

// Response 201
{
  "id": "uuid",
  "referenceNo": "PSOS-2024-0042",
  "status": "INIT",
  "propertyAddress": "14 Glenelg Street, Norwood SA 5067",
  "purchasePrice": 850000,
  "settlementDate": "2024-05-15",
  "createdAt": "2024-03-15T09:00:00Z"
}
```

### GET /deals
```json
// Query params: ?status=ACTIVE&page=1&limit=20&search=norwood
// Response 200
{
  "data": [
    {
      "id": "uuid",
      "referenceNo": "PSOS-2024-0042",
      "status": "ACTIVE",
      "propertyAddress": "14 Glenelg Street, Norwood SA 5067",
      "purchasePrice": 850000,
      "settlementDate": "2024-05-15",
      "daysToSettlement": 42,
      "conditionsSummary": { "total": 5, "met": 3, "pending": 2 },
      "parties": [...]
    }
  ],
  "total": 12,
  "page": 1,
  "limit": 20
}
```

### GET /deals/:id
```json
// Response 200 — full deal workspace data
{
  "id": "uuid",
  "referenceNo": "PSOS-2024-0042",
  "status": "ACTIVE",
  "propertyAddress": "14 Glenelg Street, Norwood SA 5067",
  "titleReference": "CT 6142/456",
  "purchasePrice": 850000,
  "depositAmount": 85000,
  "depositPaid": false,
  "contractDate": "2024-03-15",
  "settlementDate": "2024-05-15",
  "daysToSettlement": 42,
  "parties": [...],
  "conditions": [...],
  "milestones": [...],
  "recentActivity": [...],
  "documents": [...]
}
```

### PATCH /deals/:id
```json
// Request: { "settlementDate": "2024-05-22", "notes": "Buyer requested extension" }
// Response 200: updated deal
```

### PATCH /deals/:id/status
```json
// Request: { "status": "ACTIVE", "reason": "Contract signed by all parties" }
// Response 200: { "id": "uuid", "status": "ACTIVE", "updatedAt": "..." }
```

### POST /deals/:id/parties
```json
// Request
{
  "userId": "uuid",
  "partyRole": "BUYER_CONVEYANCER"
}
// Response 201: deal party object
```

---

## Conditions

### GET /deals/:id/conditions
```json
// Response 200
[
  {
    "id": "uuid",
    "name": "Finance Approval",
    "conditionType": "BOOLEAN_FLAG",
    "status": "PENDING",
    "assignedToRole": "BUYER_CONVEYANCER",
    "dueDate": "2024-04-05",
    "ruleJson": { "type": "BOOLEAN_FLAG", "field": "finance_approved" },
    "description": "Buyer's finance must be formally approved by lender"
  },
  {
    "id": "uuid",
    "name": "Building Inspection",
    "conditionType": "DOCUMENT_UPLOAD",
    "status": "MET",
    "assignedToRole": "BUYER",
    "metAt": "2024-03-20T14:30:00Z",
    "evidenceDocId": "uuid"
  }
]
```

### POST /deals/:id/conditions
```json
// Request
{
  "name": "Pest Inspection",
  "description": "Satisfactory pest inspection required",
  "conditionType": "DOCUMENT_UPLOAD",
  "assignedToRole": "BUYER",
  "dueDate": "2024-04-10",
  "ruleJson": {
    "type": "DOCUMENT_UPLOAD",
    "required_doc_type": "PEST_INSPECTION",
    "verified_required": true
  }
}
```

### PATCH /deals/:id/conditions/:conditionId
```json
// Mark a condition as met (conveyancer/assigned party)
// Request: { "status": "MET", "evidenceDocId": "uuid" }
// Response 200: updated condition

// Waive a condition
// Request: { "status": "WAIVED", "waivedReason": "Buyer accepts property as-is" }
```

### POST /deals/:id/conditions/evaluate
Triggers backend re-evaluation of all conditions and settlement gate.
```json
// Response 200
{
  "dealId": "uuid",
  "settlementAllowed": false,
  "conditions": [
    { "id": "uuid", "name": "Finance Approval", "passed": true },
    { "id": "uuid", "name": "Inspection", "passed": false, "reason": "Document not verified" }
  ],
  "blockers": ["Pest inspection document not yet verified"]
}
```

---

## Documents

### POST /deals/:id/documents (multipart/form-data)
```
Fields: file (binary), docType (string), name (string)
Response 201: { id, name, docType, s3Url (presigned), uploadedAt }
```

### GET /deals/:id/documents
```json
// Response 200: array of document metadata
[
  {
    "id": "uuid",
    "name": "Finance Approval Letter",
    "docType": "FINANCE_APPROVAL",
    "uploadedBy": { "id": "uuid", "name": "John Smith" },
    "verified": true,
    "verifiedAt": "2024-03-21T10:00:00Z",
    "downloadUrl": "https://s3.../presigned...",
    "createdAt": "2024-03-20T14:30:00Z"
  }
]
```

### PATCH /deals/:id/documents/:docId/verify
```json
// Conveyancer marks document as verified
// Request: { "verified": true }
// Response 200: updated document
```

### POST /deals/:id/documents/:docId/sign
```json
// Trigger DocuSign signing flow (mock)
// Response 200: { "envelopeId": "uuid", "signingUrl": "https://..." }
```

---

## Settlement

### POST /deals/:id/settlement/validate
```json
// Response 200
{
  "canSettle": false,
  "checks": {
    "allConditionsMet": true,
    "conveyancerApproved": false,
    "depositConfirmed": true,
    "documentsVerified": true,
    "settlementDateReached": false
  },
  "blockers": ["Seller's conveyancer has not approved settlement"]
}
```

### POST /deals/:id/settlement/approve
Conveyancer marks deal as ready for settlement.
```json
// Request: { "notes": "All checks complete, ready to proceed" }
// Response 200: { "dealId": "uuid", "status": "READY", "approvedBy": "...", "approvedAt": "..." }
```

### POST /deals/:id/settlement/execute
Initiates settlement execution (validate → escrow → PEXA → SETTLED).
```json
// Request: { "pexaWorkspaceId": "WS-12345", "notes": "Proceeding to settlement" }
// Response 202: { "executionId": "uuid", "status": "EXECUTING", "message": "Settlement initiated" }
```

### GET /deals/:id/settlement
```json
// Response 200
{
  "id": "uuid",
  "dealId": "uuid",
  "status": "COMPLETED",
  "pexaWorkspaceId": "WS-12345",
  "pexaLodgementRef": "SA-2024-78901",
  "escrowReleased": true,
  "escrowReleasedAt": "2024-05-15T10:30:00Z",
  "completedAt": "2024-05-15T10:45:00Z"
}
```

---

## Activity Feed

### GET /deals/:id/activities
```json
// Query: ?limit=20&before=cursor
// Response 200
{
  "data": [
    {
      "id": "uuid",
      "eventType": "CONDITION_MET",
      "message": "Jane Cooper marked 'Finance Approval' as complete",
      "actorRole": "BUYER_CONVEYANCER",
      "user": { "id": "uuid", "name": "Jane Cooper" },
      "isSystem": false,
      "createdAt": "2024-03-20T14:30:00Z"
    }
  ],
  "nextCursor": "...",
  "hasMore": true
}
```

### POST /deals/:id/activities (add comment)
```json
// Request: { "message": "Waiting on lender confirmation for finance" }
// Response 201: activity object
```

---

## Audit Logs

### GET /deals/:id/audit (ADMIN + CONVEYANCER)
```json
// Response 200
{
  "data": [
    {
      "id": 1234,
      "action": "DEAL_STATUS_CHANGED",
      "user": { "id": "uuid", "name": "System" },
      "oldValue": { "status": "INIT" },
      "newValue": { "status": "ACTIVE" },
      "createdAt": "2024-03-15T09:05:00Z"
    }
  ]
}
```

---

## Notifications

### GET /notifications
```json
// Response 200: user's notifications
{ "data": [...], "unreadCount": 3 }
```

### PATCH /notifications/:id/read
```json
// Response 200: { "id": "uuid", "readAt": "..." }
```

---

## WebSocket Events

Connect: `wss://api.settlement-os.com.au/ws?token=<jwt>`

### Subscribe to deal
```json
// Emit: { "event": "join_deal", "data": { "dealId": "uuid" } }
```

### Events received
```json
// deal:updated
{ "event": "deal:updated", "data": { "dealId": "uuid", "status": "READY" } }

// condition:updated
{ "event": "condition:updated", "data": { "dealId": "uuid", "conditionId": "uuid", "status": "MET" } }

// activity:new
{ "event": "activity:new", "data": { "dealId": "uuid", "activity": {...} } }

// settlement:status
{ "event": "settlement:status", "data": { "dealId": "uuid", "executionStatus": "EXECUTING" } }

// notification:new
{ "event": "notification:new", "data": { "notification": {...} } }
```

---

## Error Format

```json
{
  "statusCode": 422,
  "error": "Unprocessable Entity",
  "message": "Settlement cannot proceed: 2 conditions not met",
  "details": [
    { "field": "conditions", "code": "CONDITIONS_NOT_MET", "value": ["Finance Approval", "Title Check"] }
  ],
  "timestamp": "2024-03-20T14:30:00Z",
  "path": "/v1/deals/uuid/settlement/execute"
}
```
