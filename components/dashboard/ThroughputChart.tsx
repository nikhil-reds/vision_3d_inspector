"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { throughput } from "@/lib/data";
import { Tabs } from "@/components/ui/Tabs";

type Range = "7d" | "30d" | "90d";

export function ThroughputChart() {
  const [range, setRange] = useState<Range>("7d");
  const [hover, setHover] = useState<number | null>(null);
  // Static scaling per range to mimic different datasets.
  const factor = range === "7d" ? 1 : range === "30d" ? 3.6 : 10.8;
  const data = throughput.map((d, i) => ({
    ...d,
    quick: Math.round(d.quick * factor * (range === "7d" ? 1 : 0.8 + ((i * 37) % 10) / 25)),
    precision: Math.round(d.precision * factor * (range === "7d" ? 1 : 0.85 + ((i * 53) % 10) / 30)),
  }));
  const max = Math.max(...data.map((d) => d.quick + d.precision));
  const total = data.reduce((s, d) => s + d.quick + d.precision, 0);

  return (
    <div className="panel flex h-full flex-col p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white">Inspection throughput</h2>
          <p className="mt-0.5 text-xs text-mist-400">
            <span className="font-mono text-white">{total}</span> inspections · {range === "7d" ? "daily" : "weekly buckets"}
          </p>
        </div>
        <Tabs
          size="sm"
          value={range}
          onChange={setRange}
          items={[
            { id: "7d", label: "7D" },
            { id: "30d", label: "30D" },
            { id: "90d", label: "90D" },
          ]}
        />
      </div>
      <div className="mt-6 flex min-h-44 flex-1 items-end gap-2 sm:gap-3">
        {data.map((d, i) => {
          const hq = ((d.quick) / max) * 100;
          const hp = ((d.precision) / max) * 100;
          return (
            <div key={d.day} className="relative flex h-full flex-1 flex-col items-center justify-end gap-2" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              {hover === i && (
                <div className="absolute -top-2 z-10 -translate-y-full whitespace-nowrap rounded-lg border border-white/10 bg-ink-700 px-2.5 py-1.5 text-[11px] shadow-xl">
                  <p className="text-accent-300">Quick {d.quick}</p>
                  <p className="text-violet-300">Precision {d.precision}</p>
                </div>
              )}
              <div className="flex h-full w-full max-w-10 flex-col justify-end gap-[3px]">
                <div className={cn("w-full rounded-md bg-gradient-to-t from-violet-600/60 to-violet-400/80 transition-all", hover === i && "brightness-125")} style={{ height: `${hp}%` }} />
                <div className={cn("w-full rounded-md bg-gradient-to-t from-accent-600/60 to-accent-300/90 transition-all", hover === i && "brightness-125")} style={{ height: `${hq}%` }} />
              </div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-mist-400">{range === "7d" ? d.day : `W${i + 1}`}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex gap-5 text-xs text-mist-400">
        <span className="flex items-center gap-2"><span className="size-2 rounded-sm bg-accent-400" /> Quick</span>
        <span className="flex items-center gap-2"><span className="size-2 rounded-sm bg-violet-400" /> Precision</span>
      </div>
    </div>
  );
}
