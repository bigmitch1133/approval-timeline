"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, FolderOpen } from "lucide-react";
import { Project, Approval } from "@/lib/types";
import { useLocalStorage } from "@/lib/use-local-storage";
import { generateId, formatDate } from "@/lib/utils";
import { createDemoData } from "@/lib/demo-data";
import ProjectForm from "@/components/forms/project-form";

export default function HomePage() {
  const [projects, setProjects] = useLocalStorage<Project[]>("projects", []);
  const [approvals, setApprovals] = useLocalStorage<Approval[]>("approvals", []);
  const [showForm, setShowForm] = useState(false);
  const [seeded, setSeeded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (seeded) return;
    setSeeded(true);

    // Check if data exists and is current (has SLED categories)
    const storedApprovals = localStorage.getItem("approvals");
    const storedProjects = localStorage.getItem("projects");
    const hasData = storedProjects && JSON.parse(storedProjects).length > 0;
    const isStale = storedApprovals && hasData &&
      JSON.parse(storedApprovals).some((a: Approval) =>
        ["zoning", "site-plan", "environmental", "building", "fire-life-safety"].includes(a.category)
      );

    if (hasData && !isStale) return;

    // Seed fresh demo data (or replace stale data)
    const demo = createDemoData();
    setProjects([demo.project]);
    setApprovals(demo.approvals);
  }, [seeded, setProjects, setApprovals]);

  const handleCreateProject = (name: string) => {
    const newProject: Project = {
      id: generateId(),
      name,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setProjects((prev) => [...prev, newProject]);
    setShowForm(false);
    router.push(`/projects/${newProject.id}`);
  };

  const getApprovalCount = (projectId: string) =>
    approvals.filter((a) => a.projectId === projectId).length;

  return (
    <div>
      {/* Top bar */}
      <header className="bg-gray-950 border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm tracking-tight">P</span>
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight">Plottwist</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Projects</h2>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors"
          >
            <Plus size={16} />
            New Project
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <FolderOpen size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">No projects yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => router.push(`/projects/${project.id}`)}
                className="text-left bg-gray-900 rounded-xl border border-gray-800 p-5 hover:border-blue-600/50 hover:bg-gray-900/80 transition-all group"
              >
                <h3 className="font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">
                  {project.name}
                </h3>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>Created {formatDate(project.createdAt)}</span>
                  <span>{getApprovalCount(project.id)} approvals</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {showForm && (
        <ProjectForm
          onSubmit={handleCreateProject}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
