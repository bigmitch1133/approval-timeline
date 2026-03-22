export type ApprovalCategory =
  | "zoning"
  | "site-plan"
  | "environmental"
  | "transportation"
  | "utility"
  | "building"
  | "fire-life-safety"
  | "health"
  | "other";

export type ApprovalStatus =
  | "not-started"
  | "in-preparation"
  | "submitted"
  | "under-review"
  | "comments-received"
  | "resubmitted"
  | "approved"
  | "approved-with-conditions"
  | "denied"
  | "expired"
  | "on-hold";

export interface StatusChange {
  date: string;
  fromStatus: ApprovalStatus;
  toStatus: ApprovalStatus;
  note: string;
}

export interface Approval {
  id: string;
  projectId: string;
  name: string;
  category: ApprovalCategory;
  agency: string;
  status: ApprovalStatus;
  assignedTo: string;
  submissionDate: string | null;
  expectedDuration: number;
  actualApprovalDate: string | null;
  expirationDate: string | null;
  dependsOn: string[];
  notes: string;
  statusHistory: StatusChange[];
  estimatedCost: number;
  actualCost: number | null;
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
}
