"use client";

import { ApprovalCategory } from "@/lib/types";
import { CATEGORY_LABELS, cn } from "@/lib/utils";

export type ZoomLevel = "month" | "quarter" | "year";

interface TimelineControlsProps {
  zoom: ZoomLevel;
  onZoomChange: (z: ZoomLevel) => void;
  presentCategories: ApprovalCategory[];
  activeCategories: Set<ApprovalCategory>;
  onToggleCategory: (cat: ApprovalCategory) => void;
  onClearCategories: () => void;
  showDependencies: boolean;
  onToggleDependencies: () => void;
  showCriticalPath: boolean;
  onToggleCriticalPath: () => void;
}

export default function TimelineControls({
  zoom,
  onZoomChange,
  presentCategories,
  activeCategories,
  onToggleCategory,
  onClearCategories,
  showDependencies,
  onToggleDependencies,
  showCriticalPath,
  onToggleCriticalPath,
}: TimelineControlsProps) {
  const zoomOptions: ZoomLevel[] = ["month", "quarter", "year"];

  return (
    <div className="flex flex-wrap items-center gap-4 mb-4 p-3 bg-gray-900 rounded-xl border border-gray-800">
      {/* Zoom */}
      <div className="flex items-center gap-1">
        <span className="text-xs font-medium text-gray-500 mr-1">Zoom:</span>
        {zoomOptions.map((z) => (
          <button
            key={z}
            onClick={() => onZoomChange(z)}
            className={cn(
              "px-2.5 py-1 text-xs rounded-lg font-medium transition-colors",
              zoom === z
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700"
            )}
          >
            {z.charAt(0).toUpperCase() + z.slice(1)}
          </button>
        ))}
      </div>

      <div className="h-6 w-px bg-gray-700" />

      {/* Category pills */}
      <div className="flex items-center gap-1 flex-wrap">
        <span className="text-xs font-medium text-gray-500 mr-1">Filter:</span>
        {presentCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => onToggleCategory(cat)}
            className={cn(
              "px-2.5 py-1 text-xs rounded-full font-medium transition-colors",
              activeCategories.has(cat)
                ? "bg-blue-600/20 text-blue-400 border border-blue-500/40"
                : "bg-gray-800 text-gray-500 border border-gray-700 hover:bg-gray-700"
            )}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
        {activeCategories.size > 0 && (
          <button
            onClick={onClearCategories}
            className="px-2 py-1 text-xs text-red-400 hover:text-red-300"
          >
            Clear
          </button>
        )}
      </div>

      <div className="h-6 w-px bg-gray-700" />

      {/* Toggles */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleDependencies}
          className={cn(
            "px-2.5 py-1 text-xs rounded-lg font-medium transition-colors",
            showDependencies
              ? "bg-gray-600 text-white"
              : "bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700"
          )}
        >
          Dependencies
        </button>
        <button
          onClick={onToggleCriticalPath}
          className={cn(
            "px-2.5 py-1 text-xs rounded-lg font-medium transition-colors",
            showCriticalPath
              ? "bg-amber-500 text-white"
              : "bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700"
          )}
        >
          Critical Path
        </button>
      </div>
    </div>
  );
}
