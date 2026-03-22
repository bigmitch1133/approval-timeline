import { Approval, ApprovalCategory, Project } from "@/lib/types";
import { CATEGORY_ORDER } from "@/lib/utils";

// ─── Date helpers ────────────────────────────────────────────────

function toDate(iso: string): Date {
  return new Date(iso + "T00:00:00");
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

// ─── Bar data ────────────────────────────────────────────────────

export interface BarData {
  approval: Approval;
  startDate: Date;
  expectedEnd: Date;
  actualEnd: Date | null;
  displayEnd: Date;
  isOverdue: boolean;
  overdueEnd: Date | null;
  isCritical: boolean;
}

function getBaseStartDate(approval: Approval, project: Project): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (approval.submissionDate) {
    return toDate(approval.submissionDate);
  }

  if (approval.statusHistory.length > 0) {
    const earliest = approval.statusHistory.reduce((min, sh) =>
      sh.date < min ? sh.date : min
    , approval.statusHistory[0].date);
    return toDate(earliest);
  }

  if (approval.status === "not-started") {
    return addDays(today, 14);
  }

  const projectDate = toDate(project.createdAt);
  const fallback = addDays(today, -14);
  return projectDate < fallback ? projectDate : fallback;
}

function calendarDays(businessDays: number): number {
  return Math.ceil(businessDays * 1.4);
}

export function computeBarData(
  approvals: Approval[],
  project: Project,
  criticalIds: Set<string>
): BarData[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build a map of approval id → base start date
  const startDates = new Map<string, Date>();
  for (const a of approvals) {
    startDates.set(a.id, getBaseStartDate(a, project));
  }

  // Dependency gating: iterate up to 10 times
  const endDateOf = (id: string): Date => {
    const start = startDates.get(id)!;
    const a = approvals.find((x) => x.id === id)!;
    return addDays(start, calendarDays(a.expectedDuration));
  };

  for (let iter = 0; iter < 10; iter++) {
    let changed = false;
    for (const a of approvals) {
      if (a.dependsOn.length === 0) continue;

      // Check if all deps are approved
      const allDepsApproved = a.dependsOn.every((depId) => {
        const dep = approvals.find((x) => x.id === depId);
        return dep && (dep.status === "approved" || dep.status === "approved-with-conditions");
      });

      if (allDepsApproved) continue;

      // Gate: start after latest dependency end
      const latestDepEnd = a.dependsOn.reduce((maxDate, depId) => {
        const depEnd = endDateOf(depId);
        return depEnd > maxDate ? depEnd : maxDate;
      }, new Date(0));

      const current = startDates.get(a.id)!;
      if (latestDepEnd > current) {
        startDates.set(a.id, latestDepEnd);
        changed = true;
      }
    }
    if (!changed) break;
  }

  return approvals.map((a) => {
    const startDate = startDates.get(a.id)!;
    const expectedEnd = addDays(startDate, calendarDays(a.expectedDuration));
    const isApproved = a.status === "approved" || a.status === "approved-with-conditions";
    const actualEnd = isApproved && a.actualApprovalDate ? toDate(a.actualApprovalDate) : null;
    const displayEnd = actualEnd ?? expectedEnd;
    const isOverdue = !isApproved && today > expectedEnd;
    const overdueEnd = isOverdue ? today : null;

    return {
      approval: a,
      startDate,
      expectedEnd,
      actualEnd,
      displayEnd: isOverdue ? today : displayEnd,
      isOverdue,
      overdueEnd,
      isCritical: criticalIds.has(a.id),
    };
  });
}

// ─── Time window ─────────────────────────────────────────────────

export function getTimeWindow(): { windowStart: Date; windowEnd: Date } {
  const today = new Date();
  const windowStart = startOfMonth(addDays(today, -90));
  const windowEnd = endOfMonth(addDays(today, 456)); // ~15 months
  return { windowStart, windowEnd };
}

// ─── Month labels ────────────────────────────────────────────────

export interface MonthInfo {
  label: string;
  date: Date;
  leftPct: number;
  widthPct: number;
}

export function getMonthInfos(windowStart: Date, windowEnd: Date): MonthInfo[] {
  const totalMs = windowEnd.getTime() - windowStart.getTime();
  const months: MonthInfo[] = [];
  let d = new Date(windowStart);

  while (d < windowEnd) {
    const monthStart = new Date(d);
    const monthEnd = endOfMonth(d);
    const effectiveEnd = monthEnd > windowEnd ? windowEnd : monthEnd;
    const leftPct = ((monthStart.getTime() - windowStart.getTime()) / totalMs) * 100;
    const widthPct = ((effectiveEnd.getTime() - monthStart.getTime()) / totalMs) * 100;

    months.push({
      label: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      date: new Date(d),
      leftPct,
      widthPct,
    });

    d = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  }

  return months;
}

// ─── Critical path ───────────────────────────────────────────────

const CRITICAL_CATEGORIES: ApprovalCategory[] = [
  "zoning", "site-plan", "building", "environmental", "transportation", "utility",
];

export function computeCriticalPath(bars: BarData[]): Set<string> {
  const eligible = bars.filter((b) =>
    CRITICAL_CATEGORIES.includes(b.approval.category)
  );

  if (eligible.length === 0) return new Set();

  // Find latest finishing
  let latest = eligible[0];
  for (const b of eligible) {
    if (b.displayEnd > latest.displayEnd) latest = b;
  }

  // Trace dependency chain
  const criticalIds = new Set<string>();
  const queue = [latest.approval.id];
  while (queue.length > 0) {
    const id = queue.pop()!;
    if (criticalIds.has(id)) continue;
    criticalIds.add(id);
    const a = bars.find((b) => b.approval.id === id);
    if (a) {
      for (const depId of a.approval.dependsOn) {
        queue.push(depId);
      }
    }
  }

  return criticalIds;
}

// ─── Grouping ────────────────────────────────────────────────────

export interface CategoryGroup {
  category: ApprovalCategory;
  bars: BarData[];
}

export function groupByCategory(bars: BarData[], filter: Set<ApprovalCategory> | null): CategoryGroup[] {
  const groups: CategoryGroup[] = [];

  for (const cat of CATEGORY_ORDER) {
    const catBars = bars.filter((b) => b.approval.category === cat);
    if (catBars.length === 0) continue;
    if (filter && filter.size > 0 && !filter.has(cat)) continue;
    groups.push({ category: cat, bars: catBars });
  }

  return groups;
}

// ─── Percent positioning ─────────────────────────────────────────

export function pct(date: Date, windowStart: Date, windowEnd: Date): number {
  const total = windowEnd.getTime() - windowStart.getTime();
  return ((date.getTime() - windowStart.getTime()) / total) * 100;
}
