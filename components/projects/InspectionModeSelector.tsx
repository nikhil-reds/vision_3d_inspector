"use client";

import { cn } from "@/lib/cn";
import type { InspectionMode } from "@/lib/data";
import { Icon } from "@/components/ui/Icon";
import { modeDetails } from "@/lib/modes";


export function InspectionModeSelector({ value, onChange }: { value: InspectionMode; onChange: (m: InspectionMode) => void }) {
  return (
    <div role="radiogroup" className="grid gap-4 md:grid-cols-2">
      {(Object.keys(modeDetails) as InspectionMode[]).map((m) => {
        const d = modeDetails[m];
        const active = m === value;
        return (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(m)}
            className={cn(
              "group relative overflow-hidden rounded-2xl border p-5 text-left transition-all",
              active ? "border-accent-400/50 bg-accent-400/[0.06] shadow-[0_0_0_4px_rgba(79,220,244,0.08)]" : "border-white/10 bg-ink-800/60 hover:border-white/20"
            )}
          >
            {active && <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" />}
            <div className="relative flex items-start justify-between">
              <span className={cn("flex size-11 items-center justify-center rounded-xl ring-1 ring-inset", active ? "bg-accent-400/15 text-accent-300 ring-accent-400/30" : "bg-white/5 text-mist-300 ring-white/10")}>
                <Icon name={d.icon} size={20} />
              </span>
              <span className={cn("flex size-5 items-center justify-center rounded-full ring-1 ring-inset", active ? "bg-accent-400 text-ink-950 ring-accent-300" : "ring-white/20")}>
                {active && <Icon name="check" size={12} strokeWidth={3} />}
              </span>
            </div>
            <p className="relative mt-4 font-semibold text-white">{d.title}</p>
            <p className="relative mt-1 text-sm text-mist-400">{d.tagline}</p>
            <div className="relative mt-4 grid grid-cols-3 gap-2 rounded-xl bg-ink-950/40 p-3 ring-1 ring-inset ring-white/[0.06]">
              {d.specs.map((s) => (
                <div key={s.label}>
                  <p className="text-[10px] uppercase tracking-wider text-mist-400">{s.label}</p>
                  <p className="mt-0.5 font-mono text-sm text-white">{s.value}</p>
                </div>
              ))}
            </div>
            <ul className="relative mt-4 space-y-1.5">
              {d.bullets.map((b) => (
                <li key={b} className="flex items-center gap-2 text-xs text-mist-300">
                  <Icon name="check" size={13} className={active ? "text-accent-300" : "text-mist-400"} />
                  {b}
                </li>
              ))}
            </ul>
          </button>
        );
      })}
    </div>
  );
}
