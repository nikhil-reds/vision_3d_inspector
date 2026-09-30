"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { comparisonImages, issues, severityMeta } from "@/lib/data";
import { Tabs } from "@/components/ui/Tabs";

type Mode = "side" | "slider" | "heatmap";

function Markers({ active, onSelect }: { active: string | null; onSelect: (id: string) => void }) {
  return (
    <>
      {issues
        .filter((i) => i.marker)
        .map((i, n) => (
          <button
            key={i.id}
            onClick={() => onSelect(i.id)}
            className="group absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${i.marker!.x}%`, top: `${i.marker!.y}%` }}
            aria-label={i.title}
          >
            <span className="absolute inset-0 animate-ping rounded-full opacity-60" style={{ background: severityMeta[i.severity].color }} />
            <span
              className={cn("relative flex size-6 items-center justify-center rounded-full font-mono text-[10px] font-bold text-ink-950 ring-2 ring-ink-950 transition-transform", active === i.id && "scale-125")}
              style={{ background: severityMeta[i.severity].color }}
            >
              {n + 1}
            </span>
            <span className={cn("pointer-events-none absolute left-8 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-ink-950/90 px-2 py-1 text-[11px] text-white ring-1 ring-white/10 transition-opacity", active === i.id ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
              {i.title}
            </span>
          </button>
        ))}
    </>
  );
}

function Label({ children, tone = "cyan" }: { children: React.ReactNode; tone?: "cyan" | "amber" | "rose" }) {
  const t = { cyan: "text-accent-300", amber: "text-amber-300", rose: "text-rose-300" }[tone];
  return <span className={cn("absolute left-3 top-3 rounded-md bg-ink-950/75 px-2 py-1 font-mono text-[10px] uppercase tracking-wider backdrop-blur", t)}>{children}</span>;
}

export function ComparisonCard({ title = "Reference vs actual", description = "Same camera pose, registered to the design coordinate frame." }: { title?: string; description?: string }) {
  const [mode, setMode] = useState<Mode>("side");
  const [split, setSplit] = useState(50);
  const [active, setActive] = useState<string | null>(null);

  return (
    <section className="panel overflow-hidden">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-white">{title}</h2>
          <p className="mt-0.5 text-xs text-mist-400">{description}</p>
        </div>
        <Tabs
          size="sm"
          value={mode}
          onChange={setMode}
          items={[
            { id: "side", label: "Side by side", icon: "split" },
            { id: "slider", label: "Overlay", icon: "layers" },
            { id: "heatmap", label: "Deviation", icon: "flame" },
          ]}
        />
      </div>

      <div className="border-t border-white/[0.06] bg-ink-950 p-3">
        {mode === "side" && (
          <div className="grid gap-3 md:grid-cols-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl ring-1 ring-white/10">
              <Image src={comparisonImages.reference} alt="Reference design render" fill sizes="(min-width:768px) 45vw, 95vw" className="object-cover" loading="eager" />
              <Label>Reference · CAD</Label>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl ring-1 ring-white/10">
              <Image src={comparisonImages.actual} alt="Actual fabricated part photo" fill sizes="(min-width:768px) 45vw, 95vw" className="object-cover" loading="eager" />
              <Label tone="amber">Actual · Photo</Label>
              <Markers active={active} onSelect={setActive} />
            </div>
          </div>
        )}

        {mode === "slider" && (
          <div className="relative mx-auto aspect-[4/3] max-w-4xl select-none overflow-hidden rounded-xl ring-1 ring-white/10">
            <Image src={comparisonImages.actual} alt="Actual fabricated part photo" fill sizes="(min-width:1024px) 60vw, 95vw" className="object-cover" />
            <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}>
              <Image src={comparisonImages.reference} alt="Reference design render" fill sizes="(min-width:1024px) 60vw, 95vw" className="object-cover" />
            </div>
            <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-accent-300 shadow-[0_0_14px_rgba(79,220,244,0.9)]" style={{ left: `${split}%` }}>
              <span className="absolute left-1/2 top-1/2 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-ink-950 text-accent-300 ring-2 ring-accent-300">⇆</span>
            </div>
            <Label>Reference</Label>
            <span className="absolute right-3 top-3 rounded-md bg-ink-950/75 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-amber-300 backdrop-blur">Actual</span>
            <input
              type="range"
              min={0}
              max={100}
              value={split}
              onChange={(e) => setSplit(Number(e.target.value))}
              aria-label="Overlay position"
              className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
            />
          </div>
        )}

        {mode === "heatmap" && (
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_200px]">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl ring-1 ring-white/10">
              <Image src={comparisonImages.heatmap} alt="Surface deviation heatmap" fill sizes="(min-width:1024px) 60vw, 95vw" className="object-cover" />
              <Label tone="rose">Deviation map</Label>
              <Markers active={active} onSelect={setActive} />
            </div>
            <div className="flex flex-row gap-4 rounded-xl bg-ink-850 p-4 ring-1 ring-inset ring-white/[0.06] lg:flex-col">
              <div className="flex-1">
                <p className="text-xs font-medium text-white">Deviation scale</p>
                <div className="mt-3 h-3 rounded-full bg-[linear-gradient(90deg,#1d4ed8,#06b6d4,#22c55e,#facc15,#ef4444)]" />
                <div className="mt-1.5 flex justify-between font-mono text-[10px] text-mist-400">
                  <span>0</span>
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4+ mm</span>
                </div>
              </div>
              <dl className="flex-1 space-y-2 text-xs">
                {[
                  ["Within tolerance", "88.1%"],
                  ["0.5 – 2 mm", "8.7%"],
                  ["> 2 mm", "3.2%"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-2">
                    <dt className="text-mist-400">{k}</dt>
                    <dd className="font-mono text-white">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
