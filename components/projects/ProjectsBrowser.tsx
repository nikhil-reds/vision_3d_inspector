"use client";

import { useMemo, useState } from "react";
import { projects, statusMeta, type InspectionMode, type ProjectStatus } from "@/lib/data";
import { ProjectCard } from "./ProjectCard";
import { Select } from "@/components/ui/Select";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button, IconButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

type StatusFilter = "all" | ProjectStatus;
type ModeFilter = "all" | InspectionMode;
type Sort = "recent" | "name" | "score" | "issues";

export function ProjectsBrowser() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [mode, setMode] = useState<ModeFilter>("all");
  const [sort, setSort] = useState<Sort>("recent");
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = projects.filter(
      (p) =>
        (status === "all" || p.status === status) &&
        (mode === "all" || p.mode === mode) &&
        (!q || [p.name, p.client, p.code, p.type].some((s) => s.toLowerCase().includes(q)))
    );
    const sorted = [...list];
    if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "score") sorted.sort((a, b) => (b.matchScore ?? -1) - (a.matchScore ?? -1));
    if (sort === "issues") sorted.sort((a, b) => b.issues - a.issues);
    return sorted;
  }, [query, status, mode, sort]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: projects.length };
    projects.forEach((p) => (c[p.status] = (c[p.status] ?? 0) + 1));
    return c;
  }, []);

  const hasFilters = query || status !== "all" || mode !== "all";

  return (
    <div>
      <Tabs
        variant="underline"
        value={status}
        onChange={setStatus}
        className="mb-5"
        items={[
          { id: "all", label: "All projects", count: counts.all },
          ...(Object.keys(statusMeta) as ProjectStatus[]).map((s) => ({ id: s, label: statusMeta[s].label, count: counts[s] ?? 0 })),
        ]}
      />

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Icon name="search" size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mist-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, client, code or type"
            className="h-10 w-full rounded-xl bg-ink-800 pl-10 pr-10 text-sm text-white ring-1 ring-inset ring-white/10 placeholder:text-mist-400/80 focus:outline-none focus:ring-accent-400/50"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-mist-400 hover:text-white" aria-label="Clear search">
              <Icon name="x" size={14} />
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
          <Select
            className="sm:w-48"
            icon="filter"
            value={mode}
            onChange={setMode}
            options={[
              { value: "all", label: "All modes" },
              { value: "quick", label: "Quick inspection" },
              { value: "precision", label: "Precision inspection" },
            ]}
          />
          <Select
            className="sm:w-44"
            icon="sliders"
            value={sort}
            onChange={setSort}
            align="right"
            options={[
              { value: "recent", label: "Most recent" },
              { value: "name", label: "Name A–Z" },
              { value: "score", label: "Match score" },
              { value: "issues", label: "Most issues" },
            ]}
          />
          <div className="col-span-2 flex items-center justify-between gap-1 rounded-xl bg-ink-800 p-1 ring-1 ring-inset ring-white/10 sm:col-span-1">
            <span className="px-2 text-xs text-mist-400 sm:hidden">View</span>
            <div className="flex gap-1">
              <IconButton icon="grid" label="Grid view" active={view === "grid"} onClick={() => setView("grid")} className="size-8" />
              <IconButton icon="list" label="List view" active={view === "list"} onClick={() => setView("list")} className="size-8" />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between text-xs text-mist-400">
        <span>
          Showing <span className="font-mono text-white">{filtered.length}</span> of {projects.length} projects
        </span>
        {hasFilters && (
          <button
            onClick={() => {
              setQuery("");
              setStatus("all");
              setMode("all");
            }}
            className="text-accent-300 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="search"
          title="No projects match your filters"
          description="Try a different search term or clear the active filters to see every inspection project."
          action={
            <Button variant="secondary" icon="refresh" onClick={() => { setQuery(""); setStatus("all"); setMode("all"); }}>
              Reset filters
            </Button>
          }
        />
      ) : (
        <div className={cn(view === "grid" ? "grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4" : "space-y-3")}>
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} layout={view} />
          ))}
        </div>
      )}
    </div>
  );
}
