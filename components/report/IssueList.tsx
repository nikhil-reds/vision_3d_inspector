"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { issues, severityMeta, type Severity } from "@/lib/data";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { Tabs } from "@/components/ui/Tabs";
import { Icon } from "@/components/ui/Icon";
import { EmptyState } from "@/components/ui/EmptyState";

type Filter = "all" | Severity;

function Confidence({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1 w-16 overflow-hidden rounded-full bg-white/[0.07]">
        <div className={cn("h-full rounded-full", value >= 90 ? "bg-emerald-400" : value >= 80 ? "bg-accent-400" : "bg-amber-400")} style={{ width: `${value}%` }} />
      </div>
      <span className="font-mono text-xs text-mist-200">{value}%</span>
    </div>
  );
}

export function IssueList() {
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<string | null>(issues[0].id);
  const list = issues.filter((i) => filter === "all" || i.severity === filter);
  const count = (s: Severity) => issues.filter((i) => i.severity === s).length;

  return (
    <section className="panel overflow-hidden">
      <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-semibold text-white">Issue list</h2>
          <p className="mt-0.5 text-xs text-mist-400">Click a row to see reference, actual and deviation crops.</p>
        </div>
        <Tabs
          size="sm"
          value={filter}
          onChange={setFilter}
          items={[
            { id: "all", label: "All", count: issues.length },
            ...(["critical", "high", "medium", "low"] as Severity[]).map((s) => ({ id: s, label: severityMeta[s].label, count: count(s) })),
          ]}
        />
      </div>

      {/* Column headers (desktop) */}
      <div className="hidden grid-cols-[110px_1.4fr_1fr_1fr_120px_28px] gap-4 border-y border-white/[0.06] bg-white/[0.015] px-5 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-mist-400 lg:grid">
        <span>Severity</span>
        <span>Issue</span>
        <span>Expected result</span>
        <span>Actual result</span>
        <span>Confidence</span>
        <span />
      </div>

      {list.length === 0 ? (
        <div className="p-5">
          <EmptyState icon="checkCircle" title="No issues at this severity" description="Nothing was flagged for the selected severity level." />
        </div>
      ) : (
        <ul className="divide-y divide-white/[0.05] border-t border-white/[0.06] lg:border-t-0">
          {list.map((i) => {
            const expanded = open === i.id;
            return (
              <li key={i.id} className={cn(expanded && "bg-white/[0.015]")}>
                <button onClick={() => setOpen(expanded ? null : i.id)} aria-expanded={expanded} className="grid w-full gap-3 px-5 py-4 text-left transition-colors hover:bg-white/[0.02] lg:grid-cols-[110px_1.4fr_1fr_1fr_120px_28px] lg:items-center lg:gap-4">
                  <div className="flex items-center justify-between lg:block">
                    <SeverityBadge severity={i.severity} />
                    <Icon name="chevronDown" size={16} className={cn("text-mist-400 transition-transform lg:hidden", expanded && "rotate-180")} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-white">{i.title}</p>
                    <p className="mt-0.5 text-xs text-mist-400">
                      <span className="font-mono">{i.id}</span> · {i.location}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 lg:contents">
                    <div className="text-sm">
                      <p className="text-[10px] uppercase tracking-wider text-mist-400 lg:hidden">Expected</p>
                      <p className="text-mist-300">{i.expected}</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-[10px] uppercase tracking-wider text-mist-400 lg:hidden">Actual</p>
                      <p className="text-white">{i.actual}</p>
                    </div>
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] uppercase tracking-wider text-mist-400 lg:hidden">Confidence</p>
                    <Confidence value={i.confidence} />
                  </div>
                  <Icon name="chevronDown" size={16} className={cn("hidden text-mist-400 transition-transform lg:block", expanded && "rotate-180")} />
                </button>

                {expanded && (
                  <div className="animate-fade-up px-5 pb-5">
                    <div className="rounded-2xl bg-ink-950/50 p-4 ring-1 ring-inset ring-white/[0.06]">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <p className="max-w-2xl text-sm text-mist-300">{i.description}</p>
                        <dl className="flex shrink-0 gap-6 text-xs">
                          <div>
                            <dt className="text-mist-400">Deviation</dt>
                            <dd className="mt-0.5 font-mono text-sm text-white">{i.deviation}</dd>
                          </div>
                          <div>
                            <dt className="text-mist-400">Category</dt>
                            <dd className="mt-0.5 text-sm text-white">{i.category}</dd>
                          </div>
                        </dl>
                      </div>
                      {i.images ? (
                        <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
                          {([
                            ["Reference", i.images.reference, "text-accent-300"],
                            ["Actual", i.images.actual, "text-amber-300"],
                            ["Deviation", i.images.heat, "text-rose-300"],
                          ] as const).map(([label, src, tone]) => (
                            <figure key={label} className="relative aspect-[4/3] overflow-hidden rounded-xl ring-1 ring-white/10">
                              <Image src={src} alt={`${i.title} — ${label}`} fill sizes="(min-width:1024px) 22vw, 30vw" className="object-cover" />
                              <figcaption className={cn("absolute left-2 top-2 rounded bg-ink-950/75 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider backdrop-blur sm:text-[10px]", tone)}>{label}</figcaption>
                            </figure>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-4 flex items-center gap-2 text-xs text-mist-400">
                          <Icon name="image" size={14} /> Surface-level finding — no localized crop available.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
