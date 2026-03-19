"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, ArrowLeft, Pencil, Trash2, Calendar, Table } from "lucide-react";
import { Project, Approval } from "@/lib/types";
import { useLocalStorage } from "@/lib/use-local-storage";
import {
  CATEGORY_LABELS,
  formatDate,
  cn,
} from "@/lib/utils";
import StatusBadge from "@/components/shared/status-badge";
import ApprovalForm from "@/components/forms/approval-form";
import GanttChart from "@/components/timeline/gantt-chart";

type Tab = "approvals" | "timeline";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [projects] = useLocalStorage<Project[]>("projects", []);
  const [approvals, setApprovals] = useLocalStorage<Approval[]>("approvals", []);
  const [tab, setTab] = useState<Tab>("approvals");
  const [showForm, setShowForm] = useState(false);
  const [editingApproval, setEditingApproval] = useState<Approval | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const project = projects.find((p) => p.id === projectId);
  const projectApprovals = useMemo(
    () => approvals.filter((a) => a.projectId === projectId),
    [approvals, projectId]
  );

  if (!project) {
    return (
      <div className="p-8 text-center text-gray-500">
        Project not found.{" "}
        <button onClick={() => router.push("/")} className="text-blue-500 hover:underline">
          Go back
        </button>
      </div>
    );
  }

  const handleSaveApproval = (approval: Approval) => {
    setApprovals((prev) => {
      const exists = prev.find((a) => a.id === approval.id);
      if (exists) {
        return prev.map((a) => (a.id === approval.id ? approval : a));
      }
      return [...prev, approval];
    });
    setShowForm(false);
    setEditingApproval(null);
  };

  const handleDelete = (id: string) => {
    setApprovals((prev) => prev.filter((a) => a.id !== id));
    setDeleteConfirm(null);
  };

  return (
    <div>
      {/* Top bar */}
      <header className="bg-gray-950 border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="text-gray-500 hover:text-gray-300 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs tracking-tight">P</span>
            </div>
            <span className="text-sm text-gray-500">Plottwist</span>
            <span className="text-gray-700">/</span>
            <span className="text-sm font-semibold text-white">{project.name}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-gray-800 mb-6">
          <button
            onClick={() => setTab("approvals")}
            className={cn(
              "flex items-center gap-1.5 pb-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === "approvals"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-300"
            )}
          >
            <Table size={15} />
            Approvals
          </button>
          <button
            onClick={() => setTab("timeline")}
            className={cn(
              "flex items-center gap-1.5 pb-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === "timeline"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-300"
            )}
          >
            <Calendar size={15} />
            Timeline
          </button>
        </div>

        {tab === "approvals" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                Approvals ({projectApprovals.length})
              </h2>
              <button
                onClick={() => {
                  setEditingApproval(null);
                  setShowForm(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors"
              >
                <Plus size={16} />
                Add Approval
              </button>
            </div>

            {projectApprovals.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-sm">
                No approvals yet. Add one to get started.
              </div>
            ) : (
              <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 bg-gray-900/50">
                      <th className="text-left px-4 py-2.5 font-medium text-gray-400">Name</th>
                      <th className="text-left px-4 py-2.5 font-medium text-gray-400">Category</th>
                      <th className="text-left px-4 py-2.5 font-medium text-gray-400">Agency</th>
                      <th className="text-left px-4 py-2.5 font-medium text-gray-400">Status</th>
                      <th className="text-left px-4 py-2.5 font-medium text-gray-400">Assigned To</th>
                      <th className="text-left px-4 py-2.5 font-medium text-gray-400">Submitted</th>
                      <th className="text-left px-4 py-2.5 font-medium text-gray-400">Duration</th>
                      <th className="text-right px-4 py-2.5 font-medium text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectApprovals.map((approval) => (
                      <tr
                        key={approval.id}
                        className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                      >
                        <td className="px-4 py-2.5 font-medium text-white max-w-[200px] truncate">
                          {approval.name}
                        </td>
                        <td className="px-4 py-2.5 text-gray-400">
                          {CATEGORY_LABELS[approval.category]}
                        </td>
                        <td className="px-4 py-2.5 text-gray-400 max-w-[150px] truncate">
                          {approval.agency || "—"}
                        </td>
                        <td className="px-4 py-2.5">
                          <StatusBadge status={approval.status} />
                        </td>
                        <td className="px-4 py-2.5 text-gray-400">
                          {approval.assignedTo || "—"}
                        </td>
                        <td className="px-4 py-2.5 text-gray-400">
                          {formatDate(approval.submissionDate)}
                        </td>
                        <td className="px-4 py-2.5 text-gray-400">
                          {approval.expectedDuration}d
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setEditingApproval(approval);
                                setShowForm(true);
                              }}
                              className="p-1.5 text-gray-600 hover:text-blue-400 rounded transition-colors"
                              title="Edit"
                            >
                              <Pencil size={14} />
                            </button>
                            {deleteConfirm === approval.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleDelete(approval.id)}
                                  className="text-xs text-red-500 hover:text-red-400 font-medium"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  className="text-xs text-gray-500 hover:text-gray-300"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirm(approval.id)}
                                className="p-1.5 text-gray-600 hover:text-red-400 rounded transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === "timeline" && (
          <GanttChart project={project} approvals={projectApprovals} />
        )}
      </main>

      {showForm && (
        <ApprovalForm
          projectId={projectId}
          approval={editingApproval}
          otherApprovals={projectApprovals}
          onSubmit={handleSaveApproval}
          onClose={() => {
            setShowForm(false);
            setEditingApproval(null);
          }}
        />
      )}
    </div>
  );
}
