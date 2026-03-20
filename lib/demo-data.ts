import { Approval, Project } from "./types";
import { generateId } from "./utils";

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

export function createDemoData(): { project: Project; approvals: Approval[] } {
  const projectId = generateId();
  const project: Project = {
    id: projectId,
    name: "StateSync SIS Platform — Maricopa County Schools",
    createdAt: daysAgo(200),
  };

  // IDs for dependency references
  const rfp1Id = generateId();
  const rfp2Id = generateId();
  const vendReg1Id = generateId();
  const vendReg2Id = generateId();
  const comp1Id = generateId();
  const comp2Id = generateId();
  const sec1Id = generateId();
  const sec2Id = generateId();
  const contract1Id = generateId();
  const contract2Id = generateId();
  const budget1Id = generateId();
  const board1Id = generateId();
  const board2Id = generateId();
  const impl1Id = generateId();
  const impl2Id = generateId();

  const approvals: Approval[] = [
    // RFP Response (2) — 1 approved, 1 under-review
    {
      id: rfp1Id,
      projectId,
      name: "RFP #MC-2025-0847 Response Submission",
      category: "rfp-response",
      agency: "Maricopa County School District",
      status: "approved",
      assignedTo: "Jessica Morales",
      submissionDate: daysAgo(160),
      expectedDuration: 30,
      actualApprovalDate: daysAgo(120),
      expirationDate: daysFromNow(245),
      dependsOn: [],
      notes: "Submitted full technical + pricing proposal. Shortlisted after evaluation round.",
      statusHistory: [
        { date: daysAgo(175), fromStatus: "not-started", toStatus: "in-preparation", note: "Began drafting response" },
        { date: daysAgo(160), fromStatus: "in-preparation", toStatus: "submitted", note: "Submitted via BidSync" },
        { date: daysAgo(140), fromStatus: "submitted", toStatus: "under-review", note: "Evaluation committee formed" },
        { date: daysAgo(120), fromStatus: "under-review", toStatus: "approved", note: "Selected as finalist vendor" },
      ],
      estimatedCost: 8000,
      actualCost: 7200,
    },
    {
      id: rfp2Id,
      projectId,
      name: "Best & Final Offer (BAFO) Submission",
      category: "rfp-response",
      agency: "Maricopa County School District",
      status: "under-review",
      assignedTo: "Jessica Morales",
      submissionDate: daysAgo(90),
      expectedDuration: 45,
      actualApprovalDate: null,
      expirationDate: null,
      dependsOn: [rfp1Id],
      notes: "Revised pricing and added implementation timeline per district request.",
      statusHistory: [
        { date: daysAgo(100), fromStatus: "not-started", toStatus: "in-preparation", note: "" },
        { date: daysAgo(90), fromStatus: "in-preparation", toStatus: "submitted", note: "BAFO submitted" },
        { date: daysAgo(75), fromStatus: "submitted", toStatus: "under-review", note: "Under procurement review" },
      ],
      estimatedCost: 3000,
      actualCost: null,
    },
    // Vendor Registration (2) — 1 approved, 1 comments-received
    {
      id: vendReg1Id,
      projectId,
      name: "SAM.gov Registration & Renewal",
      category: "vendor-registration",
      agency: "System for Award Management (Federal)",
      status: "approved",
      assignedTo: "David Park",
      submissionDate: daysAgo(180),
      expectedDuration: 14,
      actualApprovalDate: daysAgo(170),
      expirationDate: daysFromNow(185),
      dependsOn: [],
      notes: "Annual SAM registration renewed. CAGE code active.",
      statusHistory: [
        { date: daysAgo(185), fromStatus: "not-started", toStatus: "in-preparation", note: "" },
        { date: daysAgo(180), fromStatus: "in-preparation", toStatus: "submitted", note: "" },
        { date: daysAgo(170), fromStatus: "submitted", toStatus: "approved", note: "Registration active" },
      ],
      estimatedCost: 0,
      actualCost: 0,
    },
    {
      id: vendReg2Id,
      projectId,
      name: "Arizona State Procurement Portal Registration",
      category: "vendor-registration",
      agency: "Arizona State Procurement Office",
      status: "comments-received",
      assignedTo: "David Park",
      submissionDate: daysAgo(130),
      expectedDuration: 21,
      actualApprovalDate: null,
      expirationDate: null,
      dependsOn: [],
      notes: "State requested updated W-9 and proof of insurance. OVERDUE.",
      statusHistory: [
        { date: daysAgo(135), fromStatus: "not-started", toStatus: "in-preparation", note: "" },
        { date: daysAgo(130), fromStatus: "in-preparation", toStatus: "submitted", note: "" },
        { date: daysAgo(110), fromStatus: "submitted", toStatus: "under-review", note: "" },
        { date: daysAgo(80), fromStatus: "under-review", toStatus: "comments-received", note: "Missing docs requested" },
      ],
      estimatedCost: 500,
      actualCost: null,
    },
    // Compliance (2) — 1 under-review, 1 in-preparation
    {
      id: comp1Id,
      projectId,
      name: "FERPA Compliance Certification",
      category: "compliance",
      agency: "Maricopa County School District — Legal",
      status: "under-review",
      assignedTo: "Sarah Kim",
      submissionDate: daysAgo(60),
      expectedDuration: 45,
      actualApprovalDate: null,
      expirationDate: null,
      dependsOn: [rfp1Id],
      notes: "District legal reviewing our FERPA compliance documentation and data handling policies.",
      statusHistory: [
        { date: daysAgo(75), fromStatus: "not-started", toStatus: "in-preparation", note: "Gathering compliance docs" },
        { date: daysAgo(60), fromStatus: "in-preparation", toStatus: "submitted", note: "" },
        { date: daysAgo(45), fromStatus: "submitted", toStatus: "under-review", note: "Assigned to district counsel" },
      ],
      estimatedCost: 5000,
      actualCost: null,
    },
    {
      id: comp2Id,
      projectId,
      name: "Section 508 Accessibility Audit (VPAT)",
      category: "compliance",
      agency: "Third-Party Accessibility Auditor",
      status: "in-preparation",
      assignedTo: "Sarah Kim",
      submissionDate: null,
      expectedDuration: 30,
      actualApprovalDate: null,
      expirationDate: null,
      dependsOn: [],
      notes: "Hiring auditor for VPAT completion. District requires WCAG 2.1 AA conformance.",
      statusHistory: [
        { date: daysAgo(20), fromStatus: "not-started", toStatus: "in-preparation", note: "Auditor selection in progress" },
      ],
      estimatedCost: 12000,
      actualCost: null,
    },
    // Security & Privacy (2) — 1 submitted, 1 not-started
    {
      id: sec1Id,
      projectId,
      name: "SOC 2 Type II Report Submission",
      category: "security-privacy",
      agency: "Maricopa County School District — IT Security",
      status: "submitted",
      assignedTo: "Marcus Johnson",
      submissionDate: daysAgo(30),
      expectedDuration: 21,
      actualApprovalDate: null,
      expirationDate: null,
      dependsOn: [],
      notes: "Latest SOC 2 report submitted to district CISO for review.",
      statusHistory: [
        { date: daysAgo(35), fromStatus: "not-started", toStatus: "in-preparation", note: "" },
        { date: daysAgo(30), fromStatus: "in-preparation", toStatus: "submitted", note: "" },
      ],
      estimatedCost: 2000,
      actualCost: null,
    },
    {
      id: sec2Id,
      projectId,
      name: "Data Privacy Impact Assessment (DPIA)",
      category: "security-privacy",
      agency: "Maricopa County School District — Privacy Office",
      status: "not-started",
      assignedTo: "Marcus Johnson",
      submissionDate: null,
      expectedDuration: 30,
      actualApprovalDate: null,
      expirationDate: null,
      dependsOn: [comp1Id],
      notes: "Required after FERPA review. Will document all PII data flows.",
      statusHistory: [],
      estimatedCost: 3500,
      actualCost: null,
    },
    // Contract & Legal (2) — 1 comments-received (overdue), 1 not-started
    {
      id: contract1Id,
      projectId,
      name: "Master Services Agreement (MSA) Negotiation",
      category: "contract-legal",
      agency: "Maricopa County School District — Procurement",
      status: "comments-received",
      assignedTo: "Angela Torres",
      submissionDate: daysAgo(140),
      expectedDuration: 60,
      actualApprovalDate: null,
      expirationDate: null,
      dependsOn: [rfp2Id],
      notes: "District counsel redlined indemnification and liability clauses. OVERDUE — in negotiation.",
      statusHistory: [
        { date: daysAgo(150), fromStatus: "not-started", toStatus: "in-preparation", note: "" },
        { date: daysAgo(140), fromStatus: "in-preparation", toStatus: "submitted", note: "Initial MSA sent" },
        { date: daysAgo(110), fromStatus: "submitted", toStatus: "under-review", note: "" },
        { date: daysAgo(70), fromStatus: "under-review", toStatus: "comments-received", note: "Redlines received" },
      ],
      estimatedCost: 15000,
      actualCost: null,
    },
    {
      id: contract2Id,
      projectId,
      name: "Data Processing Agreement (DPA)",
      category: "contract-legal",
      agency: "Maricopa County School District — Legal",
      status: "not-started",
      assignedTo: "Angela Torres",
      submissionDate: null,
      expectedDuration: 30,
      actualApprovalDate: null,
      expirationDate: null,
      dependsOn: [comp1Id, sec2Id],
      notes: "Cannot begin until FERPA and DPIA are completed.",
      statusHistory: [],
      estimatedCost: 5000,
      actualCost: null,
    },
    // Budget & Funding (1) — on-hold
    {
      id: budget1Id,
      projectId,
      name: "E-Rate Category 2 Funding Application",
      category: "budget-funding",
      agency: "USAC / Universal Service Administrative Co.",
      status: "on-hold",
      assignedTo: "Robert Chen",
      submissionDate: null,
      expectedDuration: 90,
      actualApprovalDate: null,
      expirationDate: null,
      dependsOn: [rfp2Id],
      notes: "District exploring E-Rate eligibility for SIS infrastructure costs. Filing window opens July.",
      statusHistory: [
        { date: daysAgo(40), fromStatus: "not-started", toStatus: "in-preparation", note: "" },
        { date: daysAgo(25), fromStatus: "in-preparation", toStatus: "on-hold", note: "Waiting for filing window" },
      ],
      estimatedCost: 1500,
      actualCost: null,
    },
    // Board Approval (2) — 1 in-preparation, 1 not-started
    {
      id: board1Id,
      projectId,
      name: "Superintendent Recommendation Letter",
      category: "board-approval",
      agency: "Maricopa County School District — Superintendent",
      status: "in-preparation",
      assignedTo: "Jessica Morales",
      submissionDate: null,
      expectedDuration: 14,
      actualApprovalDate: null,
      expirationDate: null,
      dependsOn: [rfp2Id, contract1Id],
      notes: "Superintendent drafting recommendation pending BAFO award and MSA finalization.",
      statusHistory: [
        { date: daysAgo(15), fromStatus: "not-started", toStatus: "in-preparation", note: "Initial briefing with superintendent" },
      ],
      estimatedCost: 0,
      actualCost: null,
    },
    {
      id: board2Id,
      projectId,
      name: "School Board Vote — Contract Approval",
      category: "board-approval",
      agency: "Maricopa County School Board",
      status: "not-started",
      assignedTo: "Jessica Morales",
      submissionDate: null,
      expectedDuration: 30,
      actualApprovalDate: null,
      expirationDate: null,
      dependsOn: [board1Id, contract1Id, comp1Id],
      notes: "Requires board agenda placement. Next board meeting cycle is monthly.",
      statusHistory: [],
      estimatedCost: 0,
      actualCost: null,
    },
    // Implementation (2) — both not-started, depend on board + contract
    {
      id: impl1Id,
      projectId,
      name: "Pilot Deployment — 3 School Sites",
      category: "implementation",
      agency: "Maricopa County School District — IT",
      status: "not-started",
      assignedTo: "Marcus Johnson",
      submissionDate: null,
      expectedDuration: 60,
      actualApprovalDate: null,
      expirationDate: null,
      dependsOn: [board2Id, contract2Id],
      notes: "Initial rollout to 3 pilot schools for UAT before district-wide deployment.",
      statusHistory: [],
      estimatedCost: 45000,
      actualCost: null,
    },
    {
      id: impl2Id,
      projectId,
      name: "District-Wide Go-Live Authorization",
      category: "implementation",
      agency: "Maricopa County School District — CTO",
      status: "not-started",
      assignedTo: "Marcus Johnson",
      submissionDate: null,
      expectedDuration: 14,
      actualApprovalDate: null,
      expirationDate: null,
      dependsOn: [impl1Id],
      notes: "CTO sign-off required after successful pilot evaluation.",
      statusHistory: [],
      estimatedCost: 0,
      actualCost: null,
    },
  ];

  return { project, approvals };
}
