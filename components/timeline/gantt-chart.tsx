"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Approval, ApprovalCategory, Project } from "@/lib/types";
import { CATEGORY_LABELS, cn } from "@/lib/utils";
import StatusBadge from "@/components/shared/status-badge";
import GanttBar from "./gantt-bar";
import TimelineControls, { ZoomLevel } from "./timeline-controls";
import {
  computeBarData,
  computeCriticalPath,
  getTimeWindow,
  getMonthInfos,
  groupByCategory,
  pct,
  BarData,
} from "./timeline-utils";

interface GanttChartProps {
  project: Project;
  approvals: Approval[];
}

const ROW_HEIGHT = 36;
const LEFT_PANEL_WIDTH = 300;

export default function GanttChart({ project, approvals }: GanttChartProps) {
  const [zoom, setZoom] = useState<ZoomLevel>("month");
  const [activeCategories, setActiveCategories] = useState<Set<ApprovalCategory>>(new Set());
  const [showDependencies, setShowDependencies] = useState(false);
  const [showCriticalPathOnly, setShowCriticalPathOnly] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);

  const { windowStart, windowEnd } = useMemo(() => getTimeWindow(), []);
  const monthInfos = useMemo(() => getMonthInfos(windowStart, windowEnd), [windowStart, windowEnd]);

  const allBars = useMemo(() => {
    const tempBars = computeBarData(approvals, project, new Set());
    const criticalIds = computeCriticalPath(tempBars);
    return computeBarData(approvals, project, criticalIds);
  }, [approvals, project]);

  const criticalIds = useMemo(() => computeCriticalPath(allBars), [allBars]);

  let filteredBars = allBars;
  if (showCriticalPathOnly) {
    filteredBars = filteredBars.filter((b) => criticalIds.has(b.approval.id));
  }

  const groups = useMemo(
    () => groupByCategory(filteredBars, activeCategories.size > 0 ? activeCategories : null),
    [filteredBars, activeCategories]
  );

  const presentCategories = useMemo(() => {
    const cats = new Set(approvals.map((a) => a.category));
    return Array.from(cats) as ApprovalCategory[];
  }, [approvals]);

  const monthMinWidth = zoom === "month" ? 100 : zoom === "quarter" ? 50 : 20;
  const chartWidth = Math.max(monthInfos.length * monthMinWidth, 1200);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayPct = pct(today, windowStart, windowEnd);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollTarget = (todayPct / 100) * chartWidth - scrollRef.current.clientWidth / 2;
      scrollRef.current.scrollLeft = Math.max(0, scrollTarget);
    }
  }, [todayPct, chartWidth]);

  const handleChartScroll = () => {
    if (scrollRef.current && leftRef.current) {
      leftRef.current.scrollTop = scrollRef.current.scrollTop;
    }
  };

  const rows: Array<{ type: "header"; category: ApprovalCategory; count: number } | { type: "bar"; bar: BarData }> = [];
  for (const group of groups) {
    rows.push({ type: "header", category: group.category, count: group.bars.length });
    for (const bar of group.bars) {
      rows.push({ type: "bar", bar });
    }
  }

  const totalHeight = rows.length * ROW_HEIGHT;

  const depLines: Array<{
    fromPct: number;
    fromRow: number;
    toPct: number;
    toRow: number;
    isCriticalPair: boolean;
  }> = [];

  if (showDependencies) {
    const barRows = new Map<string, number>();
    let rowIdx = 0;
    for (const row of rows) {
      if (row.type === "bar") {
        barRows.set(row.bar.approval.id, rowIdx);
      }
      rowIdx++;
    }

    for (const row of rows) {
      if (row.type !== "bar") continue;
      const bar = row.bar;
      for (const depId of bar.approval.dependsOn) {
        const depBar = allBars.find((b) => b.approval.id === depId);
        const fromRow = barRows.get(depId);
        const toRow = barRows.get(bar.approval.id);
        if (depBar && fromRow !== undefined && toRow !== undefined) {
          depLines.push({
            fromPct: pct(depBar.displayEnd, windowStart, windowEnd),
            fromRow,
            toPct: pct(bar.startDate, windowStart, windowEnd),
            toRow,
            isCriticalPair: criticalIds.has(depId) && criticalIds.has(bar.approval.id),
          });
        }
      }
    }
  }

  return (
    <div>
      <div className="md:hidden p-4 text-center text-gray-500 text-sm">
        The Gantt timeline is best viewed on a desktop screen.
      </div>

      <div className="hidden md:block">
        <TimelineControls
          zoom={zoom}
          onZoomChange={setZoom}
          presentCategories={presentCategories}
          activeCategories={activeCategories}
          onToggleCategory={(cat) => {
            setActiveCategories((prev) => {
              const next = new Set(prev);
              if (next.has(cat)) next.delete(cat);
              else next.add(cat);
              return next;
            });
          }}
          onClearCategories={() => setActiveCategories(new Set())}
          showDependencies={showDependencies}
          onToggleDependencies={() => setShowDependencies((p) => !p)}
          showCriticalPath={showCriticalPathOnly}
          onToggleCriticalPath={() => setShowCriticalPathOnly((p) => !p)}
        />

        <div className="flex border border-gray-800 rounded-xl overflow-hidden bg-gray-950">
          {/* Left fixed panel */}
          <div
            ref={leftRef}
            className="flex-shrink-0 overflow-hidden border-r border-gray-800 bg-gray-900/50"
            style={{ width: LEFT_PANEL_WIDTH }}
          >
            <div className="h-8 border-b border-gray-800 px-3 flex items-center">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Approval</span>
            </div>
            <div style={{ height: totalHeight }}>
              {rows.map((row) => {
                if (row.type === "header") {
                  return (
                    <div
                      key={`h-${row.category}`}
                      className="flex items-center px-3 bg-gray-800/50 border-b border-gray-800"
                      style={{ height: ROW_HEIGHT }}
                    >
                      <span className="text-xs font-semibold text-gray-300">
                        {CATEGORY_LABELS[row.category]}
                      </span>
                      <span className="text-xs text-gray-600 ml-1">({row.count})</span>
                    </div>
                  );
                }
                const bar = row.bar;
                return (
                  <div
                    key={bar.approval.id}
                    className={cn(
                      "flex items-center gap-2 px-3 border-b border-gray-800/50 transition-opacity",
                      hoveredId && hoveredId !== bar.approval.id ? "opacity-30" : "opacity-100"
                    )}
                    style={{ height: ROW_HEIGHT }}
                  >
                    <span className="text-xs text-gray-300 truncate flex-1" title={bar.approval.name}>
                      {bar.approval.name}
                    </span>
                    <StatusBadge status={bar.approval.status} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right scrollable panel */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-auto"
            onScroll={handleChartScroll}
          >
            <div style={{ width: chartWidth, minWidth: "100%" }}>
              {/* Month headers */}
              <div className="relative h-8 border-b border-gray-800 bg-gray-900/50">
                {monthInfos.map((m, i) => {
                  const showLabel =
                    zoom === "year"
                      ? m.date.getMonth() % 3 === 0
                      : true;
                  return (
                    <div
                      key={i}
                      className="absolute top-0 h-full border-r border-gray-800 flex items-center justify-center"
                      style={{
                        left: `${m.leftPct}%`,
                        width: `${m.widthPct}%`,
                      }}
                    >
                      {showLabel && (
                        <span className="text-[10px] font-medium text-gray-500 whitespace-nowrap">
                          {m.label}
                        </span>
                      )}
                    </div>
                  );
                })}
                {todayPct >= 0 && todayPct <= 100 && (
                  <div
                    className="absolute top-0.5 -translate-x-1/2 bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full z-10"
                    style={{ left: `${todayPct}%` }}
                  >
                    Today
                  </div>
                )}
              </div>

              {/* Chart body */}
              <div className="relative" style={{ height: totalHeight }}>
                {monthInfos.map((m, i) => (
                  <div
                    key={`grid-${i}`}
                    className="absolute top-0 bottom-0 border-r border-gray-800/40"
                    style={{ left: `${m.leftPct}%` }}
                  />
                ))}

                {todayPct >= 0 && todayPct <= 100 && (
                  <div
                    className="absolute top-0 bottom-0 w-px bg-blue-500 z-10"
                    style={{ left: `${todayPct}%` }}
                  />
                )}

                {showDependencies && depLines.length > 0 && (
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none z-[5]"
                    style={{ width: chartWidth, height: totalHeight }}
                  >
                    <defs>
                      <marker id="arrow-gray" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
                        <path d="M0,0 L6,2 L0,4" fill="#4b5563" />
                      </marker>
                      <marker id="arrow-amber" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
                        <path d="M0,0 L6,2 L0,4" fill="#f59e0b" />
                      </marker>
                    </defs>
                    {depLines.map((line, i) => {
                      const x1 = (line.fromPct / 100) * chartWidth;
                      const y1 = line.fromRow * ROW_HEIGHT + ROW_HEIGHT / 2;
                      const x2 = (line.toPct / 100) * chartWidth;
                      const y2 = line.toRow * ROW_HEIGHT + ROW_HEIGHT / 2;
                      return (
                        <line
                          key={i}
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke={line.isCriticalPair ? "#f59e0b" : "#4b5563"}
                          strokeWidth={line.isCriticalPair ? 2 : 1}
                          strokeDasharray={line.isCriticalPair ? "none" : "4,3"}
                          markerEnd={
                            line.isCriticalPair ? "url(#arrow-amber)" : "url(#arrow-gray)"
                          }
                        />
                      );
                    })}
                  </svg>
                )}

                {rows.map((row, i) => {
                  if (row.type === "header") {
                    return (
                      <div
                        key={`ch-${row.category}`}
                        className="absolute w-full bg-gray-800/30 border-b border-gray-800"
                        style={{ top: i * ROW_HEIGHT, height: ROW_HEIGHT }}
                      />
                    );
                  }
                  const bar = row.bar;
                  const dimmed = hoveredId !== null && hoveredId !== bar.approval.id;
                  return (
                    <div
                      key={bar.approval.id}
                      className="absolute w-full border-b border-gray-800/30"
                      style={{ top: i * ROW_HEIGHT, height: ROW_HEIGHT }}
                    >
                      <GanttBar
                        bar={bar}
                        windowStart={windowStart}
                        windowEnd={windowEnd}
                        dimmed={dimmed}
                        onHover={setHoveredId}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-500">
          {(
            [
              ["Not Started", "#94a3b8"],
              ["In Preparation", "#64748b"],
              ["Submitted", "#3b82f6"],
              ["Under Review", "#6366f1"],
              ["Comments Received", "#f59e0b"],
              ["Approved", "#22c55e"],
              ["On Hold", "#8b5cf6"],
            ] as [string, string][]
          ).map(([label, color]) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
              <span>{label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm border-2 border-dashed border-red-500 bg-red-950/40" />
            <span>Overdue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 bg-blue-500" />
            <span>Today</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="20" height="8"><line x1="0" y1="4" x2="20" y2="4" stroke="#4b5563" strokeDasharray="4,3" /></svg>
            <span>Dependency</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>Critical Path</span>
          </div>
        </div>
      </div>
    </div>
  );
}
