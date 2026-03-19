"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Approval, ApprovalCategory, ApprovalStatus } from "@/lib/types";
import { CATEGORY_LABELS, STATUS_LABELS, CATEGORY_ORDER, generateId } from "@/lib/utils";

const ALL_STATUSES: ApprovalStatus[] = [
  "not-started", "in-preparation", "submitted", "under-review",
  "comments-received", "resubmitted", "approved",
  "approved-with-conditions", "denied", "expired", "on-hold",
];

const inputClass = "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
const labelClass = "block text-sm font-medium text-gray-400 mb-1";

interface ApprovalFormProps {
  projectId: string;
  approval?: Approval | null;
  otherApprovals: Approval[];
  onSubmit: (approval: Approval) => void;
  onClose: () => void;
}

export default function ApprovalForm({
  projectId,
  approval,
  otherApprovals,
  onSubmit,
  onClose,
}: ApprovalFormProps) {
  const isEdit = !!approval;
  const panelRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState(approval?.name ?? "");
  const [category, setCategory] = useState<ApprovalCategory>(approval?.category ?? "other");
  const [agency, setAgency] = useState(approval?.agency ?? "");
  const [status, setStatus] = useState<ApprovalStatus>(approval?.status ?? "not-started");
  const [assignedTo, setAssignedTo] = useState(approval?.assignedTo ?? "");
  const [submissionDate, setSubmissionDate] = useState(approval?.submissionDate ?? "");
  const [expectedDuration, setExpectedDuration] = useState(approval?.expectedDuration ?? 30);
  const [actualApprovalDate, setActualApprovalDate] = useState(approval?.actualApprovalDate ?? "");
  const [expirationDate, setExpirationDate] = useState(approval?.expirationDate ?? "");
  const [dependsOn, setDependsOn] = useState<string[]>(approval?.dependsOn ?? []);
  const [notes, setNotes] = useState(approval?.notes ?? "");
  const [estimatedCost, setEstimatedCost] = useState(approval?.estimatedCost ?? 0);
  const [actualCost, setActualCost] = useState<string>(
    approval?.actualCost != null ? String(approval.actualCost) : ""
  );

  const showActualDate = status === "approved" || status === "approved-with-conditions";
  const availableDeps = otherApprovals.filter((a) => a.id !== approval?.id);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const oldStatus = approval?.status ?? "not-started";
    const statusHistory = [...(approval?.statusHistory ?? [])];
    if (isEdit && oldStatus !== status) {
      statusHistory.push({
        date: new Date().toISOString().split("T")[0],
        fromStatus: oldStatus,
        toStatus: status,
        note: "",
      });
    }

    onSubmit({
      id: approval?.id ?? generateId(),
      projectId,
      name,
      category,
      agency,
      status,
      assignedTo,
      submissionDate: submissionDate || null,
      expectedDuration,
      actualApprovalDate: showActualDate && actualApprovalDate ? actualApprovalDate : null,
      expirationDate: expirationDate || null,
      dependsOn,
      notes,
      statusHistory,
      estimatedCost,
      actualCost: actualCost !== "" ? Number(actualCost) : null,
    });
  };

  const toggleDep = (id: string) => {
    setDependsOn((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div ref={panelRef} className="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 animate-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            {isEdit ? "Edit Approval" : "Add Approval"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required autoFocus />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Category *</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as ApprovalCategory)} className={inputClass}>
                {CATEGORY_ORDER.map((c) => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Status *</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as ApprovalStatus)} className={inputClass}>
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Agency</label>
            <input type="text" value={agency} onChange={(e) => setAgency(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Assigned To</label>
            <input type="text" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Submission Date</label>
              <input type="date" value={submissionDate} onChange={(e) => setSubmissionDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Expected Duration (biz days) *</label>
              <input type="number" value={expectedDuration} onChange={(e) => setExpectedDuration(Number(e.target.value))} className={inputClass} min={1} required />
            </div>
          </div>

          {showActualDate && (
            <div>
              <label className={labelClass}>Actual Approval Date</label>
              <input type="date" value={actualApprovalDate} onChange={(e) => setActualApprovalDate(e.target.value)} className={inputClass} />
            </div>
          )}

          <div>
            <label className={labelClass}>Expiration Date</label>
            <input type="date" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} className={inputClass} />
          </div>

          {availableDeps.length > 0 && (
            <div>
              <label className={labelClass}>Dependencies</label>
              <div className="border border-gray-700 rounded-lg p-2 max-h-32 overflow-y-auto space-y-1">
                {availableDeps.map((a) => (
                  <label key={a.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-800 px-1 rounded transition-colors">
                    <input
                      type="checkbox"
                      checked={dependsOn.includes(a.id)}
                      onChange={() => toggleDep(a.id)}
                      className="rounded border-gray-600 bg-gray-800"
                    />
                    <span className="text-gray-300 truncate">{a.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Estimated Cost ($)</label>
              <input type="number" value={estimatedCost} onChange={(e) => setEstimatedCost(Number(e.target.value))} className={inputClass} min={0} />
            </div>
            <div>
              <label className={labelClass}>Actual Cost ($)</label>
              <input type="number" value={actualCost} onChange={(e) => setActualCost(e.target.value)} className={inputClass} min={0} placeholder="—" />
            </div>
          </div>

          <div>
            <label className={labelClass}>Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={inputClass} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-gray-200 transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors">
              {isEdit ? "Save Changes" : "Add Approval"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
