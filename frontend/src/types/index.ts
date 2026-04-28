// ─── Enums ────────────────────────────────────────────────────────────────────

export type UserRole =
  | 'BUYER'
  | 'SELLER'
  | 'BUYER_CONVEYANCER'
  | 'SELLER_CONVEYANCER'
  | 'AGENT'
  | 'ADMIN';

export type DealStatus = 'INIT' | 'ACTIVE' | 'READY' | 'SETTLED' | 'CANCELLED';

export type ConditionStatus = 'PENDING' | 'MET' | 'WAIVED' | 'FAILED';

export type ConditionType =
  | 'BOOLEAN_FLAG'
  | 'DATE_DEADLINE'
  | 'DOCUMENT_UPLOAD'
  | 'EXTERNAL_CONFIRMATION'
  | 'APPROVAL';

export type MilestoneStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETE' | 'BLOCKED';

export type DocType =
  | 'CONTRACT'
  | 'ID_VERIFICATION'
  | 'FINANCE_APPROVAL'
  | 'BUILDING_INSPECTION'
  | 'PEST_INSPECTION'
  | 'TITLE_SEARCH'
  | 'DISCHARGE_MORTGAGE'
  | 'TRANSFER'
  | 'SETTLEMENT_STATEMENT'
  | 'DISCLOSURE'
  | 'OTHER';

export type NotificationChannel = 'EMAIL' | 'SMS' | 'IN_APP';
export type ActivityEventType =
  | 'COMMENT'
  | 'STATUS_CHANGED'
  | 'CONDITION_MET'
  | 'CONDITION_WAIVED'
  | 'DOCUMENT_UPLOADED'
  | 'DOCUMENT_VERIFIED'
  | 'PARTY_ADDED'
  | 'MILESTONE_COMPLETE'
  | 'SETTLEMENT_APPROVED'
  | 'SETTLEMENT_EXECUTED'
  | 'SYSTEM';

// ─── Entities ─────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  firmName?: string;
  licenseNo?: string;
  createdAt: string;
}

export interface DealParty {
  id: string;
  role: string;
  user: Pick<User, 'id' | 'email' | 'firmName' | 'phone'> & { name: string };
}

export interface Condition {
  id: string;
  name: string;
  description?: string;
  conditionType: ConditionType;
  status: ConditionStatus;
  assignedToRole?: string;
  ruleJson: Record<string, any>;
  dueDate?: string;
  metAt?: string;
  waivedReason?: string;
  displayOrder: number;
  evidenceDocId?: string;
  createdAt: string;
}

export interface Milestone {
  id: string;
  name: string;
  milestoneType: string;
  status: MilestoneStatus;
  dueDate?: string;
  completedAt?: string;
  assignedToRole?: string;
  displayOrder: number;
}

export interface Document {
  id: string;
  name: string;
  docType: DocType;
  originalFilename: string;
  verified: boolean;
  isSigned: boolean;
  verifiedAt?: string;
  downloadUrl: string;
  fileSizeBytes?: number;
  mimeType?: string;
  uploadedBy: { id: string; name: string };
  createdAt: string;
}

export interface Activity {
  id: string;
  eventType: ActivityEventType;
  message: string;
  actorRole?: string;
  isSystem: boolean;
  user?: Pick<User, 'id'> & { name: string };
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface Deal {
  id: string;
  referenceNo: string;
  status: DealStatus;
  propertyAddress: string;
  propertySuburb: string;
  propertyState: string;
  propertyPostcode: string;
  titleReference?: string;
  purchasePrice: number;
  depositAmount?: number;
  depositPaid: boolean;
  contractDate?: string;
  settlementDate?: string;
  actualSettledAt?: string;
  pexaWorkspaceId?: string;
  notes?: string;
  daysToSettlement?: number;
  conditionsSummary?: { total: number; met: number; pending: number };
  parties?: DealParty[];
  conditions?: Condition[];
  milestones?: Milestone[];
  recentActivity?: Activity[];
  documents?: Document[];
  createdAt: string;
  updatedAt: string;
}

export interface SettlementValidation {
  canSettle: boolean;
  checks: {
    allConditionsMet: boolean;
    depositConfirmed: boolean;
    settlementDateReached: boolean;
    dealStatus: DealStatus;
  };
  blockers: string[];
  conditions: Array<{ conditionId: string; name: string; passed: boolean; reason?: string }>;
}

export interface SettlementExecution {
  id: string;
  dealId: string;
  status: 'PENDING' | 'VALIDATING' | 'APPROVED' | 'EXECUTING' | 'COMPLETED' | 'FAILED';
  pexaWorkspaceId?: string;
  pexaLodgementRef?: string;
  escrowReleased: boolean;
  escrowReleasedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  channel: NotificationChannel;
  status: string;
  readAt?: string;
  deal?: { id: string; referenceNo: string };
  createdAt: string;
}

// ─── API Response Wrappers ────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

// ─── UI Helpers ──────────────────────────────────────────────────────────────

export const DEAL_STATUS_LABELS: Record<DealStatus, string> = {
  INIT: 'Initiated',
  ACTIVE: 'In Progress',
  READY: 'Ready to Settle',
  SETTLED: 'Settled',
  CANCELLED: 'Cancelled',
};

export const DEAL_STATUS_COLORS: Record<DealStatus, string> = {
  INIT: 'bg-gray-100 text-gray-700',
  ACTIVE: 'bg-blue-100 text-blue-700',
  READY: 'bg-amber-100 text-amber-700',
  SETTLED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export const CONDITION_STATUS_COLORS: Record<ConditionStatus, string> = {
  PENDING: 'text-gray-500',
  MET: 'text-green-600',
  WAIVED: 'text-amber-600',
  FAILED: 'text-red-600',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  BUYER: 'Buyer',
  SELLER: 'Seller',
  BUYER_CONVEYANCER: "Buyer's Conveyancer",
  SELLER_CONVEYANCER: "Seller's Conveyancer",
  AGENT: 'Real Estate Agent',
  ADMIN: 'Administrator',
};

export const DOC_TYPE_LABELS: Record<DocType, string> = {
  CONTRACT: 'Contract of Sale',
  ID_VERIFICATION: 'Identity Verification',
  FINANCE_APPROVAL: 'Finance Approval',
  BUILDING_INSPECTION: 'Building Inspection Report',
  PEST_INSPECTION: 'Pest Inspection Report',
  TITLE_SEARCH: 'Title Search',
  DISCHARGE_MORTGAGE: 'Discharge of Mortgage',
  TRANSFER: 'Transfer of Land',
  SETTLEMENT_STATEMENT: 'Settlement Statement',
  DISCLOSURE: 'Form 1 Disclosure',
  OTHER: 'Other Document',
};
