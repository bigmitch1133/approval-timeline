import { ApprovalCategory, ApprovalStatus } from "./types";

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateId(): string {
  return crypto.randomUUID();
}

export const CATEGORY_LABELS: Record<ApprovalCategory, string> = {
  "rfp-response": "RFP Response",
  "vendor-registration": "Vendor Registration",
  compliance: "Compliance",
  "security-privacy": "Security & Privacy",
  "contract-legal": "Contract & Legal",
  "budget-funding": "Budget & Funding",
  "board-approval": "Board Approval",
  implementation: "Implementation",
  other: "Other",
};

export const CATEGORY_ORDER: ApprovalCategory[] = [
  "rfp-response",
  "vendor-registration",
  "compliance",
  "security-privacy",
  "contract-legal",
  "budget-funding",
  "board-approval",
  "implementation",
  "other",
];

export const STATUS_LABELS: Record<ApprovalStatus, string> = {
  "not-started": "Not Started",
  "in-preparation": "In Preparation",
  submitted: "Submitted",
  "under-review": "Under Review",
  "comments-received": "Comments Received",
  resubmitted: "Resubmitted",
  approved: "Approved",
  "approved-with-conditions": "Approved w/ Conditions",
  denied: "Denied",
  expired: "Expired",
  "on-hold": "On Hold",
};

export const STATUS_COLORS: Record<ApprovalStatus, string> = {
  "not-started": "#94a3b8",
  "in-preparation": "#64748b",
  submitted: "#3b82f6",
  "under-review": "#6366f1",
  "comments-received": "#f59e0b",
  resubmitted: "#3b82f6",
  approved: "#22c55e",
  "approved-with-conditions": "#22c55e",
  denied: "#ef4444",
  expired: "#991b1b",
  "on-hold": "#8b5cf6",
};
