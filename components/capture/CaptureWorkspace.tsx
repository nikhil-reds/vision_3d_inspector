"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { captureAngles } from "@/lib/data";
import { CaptureCard } from "./CaptureCard";
import { Button, IconButton } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/Progress";
import { Icon } from "@/components/ui/Icon";
import { Toast } from "@/components/ui/Toast";

export function CaptureWorkspace({ projectId }: { projectId: string }) {
  const [captured, setCaptured] = useState<Record<string, boolean>>(() => Object.fromEntries(captureAngles.map((a) => [a.id, a.captured])));
  const [selectedId, setSelectedId] = useState(captureAngles.find((a) => !a.captured)?.id ?? captureAngles[0].id);
  const [flash, setFlash] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const selected = captureAngles.find((a) => a.id === selectedId)!;
  const index = captureAngles.indexOf(selected);
  const isCaptured = captured[selectedId];
  const count = Object.values(captured).filter(Boolean).length;
  const done = count === captureAngles.length;

  const markCaptured = (msg: string) => {
    setCaptured((c) => ({ ...c, [selectedId]: true }));
    setToast(msg);
    const next = captureAngles.find((a) => a.id !== selectedId && !captured[a.id]);
    if (next) setTimeout(() => setSelectedId(next.id), 700);
  };

  const shoot = () => {
    setFlash(true);
    setTimeout(() => setFlash(false), 180);
    markCaptured(`${selected.label} captured`);
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      {/* Viewfinder */}
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-black shadow-2xl shadow-black/50">
          <div className="relative aspect-[4/3]">
            {isCaptured ? (
              <Image key={selectedId} src={selected.image} alt={selected.label} fill sizes="(min-width:1280px) 60vw, 95vw" className="animate-fade-up object-cover" priority />
            ) : (
              <>
                {/* Live-feed simulation: dimmed demo image with guide silhouette */}
                <Image key={`live-${selectedId}`} src={selected.image} alt={`${selected.label} live preview`} fill sizes="(min-width:1280px) 60vw, 95vw" className="object-cover opacity-45 blur-[1.5px] saturate-50" priority />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative h-[58%] w-[46%] rounded-3xl border-2 border-dashed border-accent-300/70 shadow-[0_0_40px_rgba(79,220,244,0.25)_inset]">
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink-950/70 px-3 py-1 text-[11px] font-medium text-accent-300 backdrop-blur">
                      Align object inside guide
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Overlays */}
            {showGrid && (
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-y-0 left-1/3 w-px bg-white/15" />
                <div className="absolute inset-y-0 left-2/3 w-px bg-white/15" />
                <div className="absolute inset-x-0 top-1/3 h-px bg-white/15" />
                <div className="absolute inset-x-0 top-2/3 h-px bg-white/15" />
              </div>
            )}
            <div className="hud-corners pointer-events-none absolute inset-6 opacity-80 sm:inset-10" />
            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-accent-300/80">
              <Icon name="crosshair" size={36} strokeWidth={1.2} />
            </div>
            <div className={cn("pointer-events-none absolute inset-0 bg-white transition-opacity duration-150", flash ? "opacity-80" : "opacity-0")} />

            {/* Top bar */}
            <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-white/85 sm:px-6 sm:text-[11px]">
              <span className="flex items-center gap-2">
                <span className={cn("size-2 rounded-full", isCaptured ? "bg-emerald-400" : "animate-pulse-soft bg-rose-500")} />
                {isCaptured ? "Captured" : "Live"} · Shot 0{index + 1}/05
              </span>
              <span className="hidden sm:inline">ISO 200 · f/2.8 · 1/125 · 26mm</span>
              <span>{selected.angle}</span>
            </div>

            {/* Level indicator */}
            <div className="pointer-events-none absolute left-1/2 top-12 hidden -translate-x-1/2 items-center gap-2 sm:flex">
              <span className="h-px w-10 bg-white/40" />
              <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 font-mono text-[10px] text-emerald-300 ring-1 ring-emerald-400/40">LEVEL 0.4°</span>
              <span className="h-px w-10 bg-white/40" />
            </div>

            {/* Bottom info */}
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pb-4 pt-12 sm:px-6 sm:pb-5">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white sm:text-base">{selected.label}</p>
                <p className="mt-0.5 hidden max-w-md text-xs text-white/70 sm:block">{selected.instruction}</p>
              </div>
              <div className="hidden shrink-0 text-right font-mono text-[10px] text-white/70 sm:block">
                <p>Distance ≈ 1.2 m</p>
                <p className={isCaptured ? "text-emerald-300" : "text-amber-300"}>{isCaptured ? `Sharpness ${selected.quality ?? 92}%` : "Hold steady…"}</p>
              </div>
            </div>
          </div>

          {/* Camera controls */}
          <div className="flex items-center justify-between border-t border-white/10 bg-ink-900 px-4 py-4 sm:px-8">
            <div className="flex items-center gap-1">
              <IconButton icon="grid" label="Toggle grid" active={showGrid} onClick={() => setShowGrid((g) => !g)} />
              <IconButton icon="flash" label="Flash (auto)" />
            </div>
            <button
              type="button"
              onClick={shoot}
              aria-label="Capture photo"
              className="group relative flex size-16 items-center justify-center rounded-full ring-2 ring-white/70 transition hover:ring-accent-300 sm:size-[72px]"
            >
              <span className="size-12 rounded-full bg-white transition-transform group-active:scale-90 sm:size-14" />
            </button>
            <div className="flex items-center gap-1">
              <IconButton icon="refresh" label="Retake" onClick={() => setCaptured((c) => ({ ...c, [selectedId]: false }))} disabled={!isCaptured} />
              <IconButton icon="upload" label="Upload photo" onClick={() => fileRef.current?.click()} />
            </div>
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) markCaptured(`Photo attached to ${selected.label} (demo)`);
            e.target.value = "";
          }}
        />

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: "sun" as const, t: "Even lighting", d: "Avoid hard shadows and reflections." },
            { icon: "ruler" as const, t: "Fill 60–80%", d: "Keep the whole object inside the guide." },
            { icon: "target" as const, t: "Stay level", d: "Hold the camera at object mid-height." },
          ].map((tip) => (
            <div key={tip.t} className="panel flex gap-3 p-4">
              <Icon name={tip.icon} size={18} className="mt-0.5 shrink-0 text-accent-300" />
              <div>
                <p className="text-sm font-medium text-white">{tip.t}</p>
                <p className="mt-0.5 text-xs text-mist-400">{tip.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shot list */}
      <aside className="space-y-4">
        <div className="panel p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Capture progress</h2>
            <span className="font-mono text-sm text-white">
              {count}<span className="text-mist-400">/{captureAngles.length}</span>
            </span>
          </div>
          <ProgressBar value={(count / captureAngles.length) * 100} tone={done ? "emerald" : "accent"} className="mt-3" />
          <div className="mt-2 grid grid-cols-5 gap-1">
            {captureAngles.map((a) => (
              <span key={a.id} className={cn("h-1 rounded-full", captured[a.id] ? "bg-emerald-400/70" : a.id === selectedId ? "bg-accent-400" : "bg-white/10")} />
            ))}
          </div>
          <p className="mt-3 text-xs text-mist-400">{done ? "All required angles captured. You can start the analysis." : `${captureAngles.length - count} angle${captureAngles.length - count === 1 ? "" : "s"} remaining.`}</p>
        </div>

        <div className="space-y-2">
          {captureAngles.map((a, i) => (
            <CaptureCard key={a.id} angle={a} index={i} selected={a.id === selectedId} captured={captured[a.id]} onSelect={() => setSelectedId(a.id)} />
          ))}
        </div>

        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
          <Button variant="secondary" icon="upload" onClick={() => fileRef.current?.click()}>Upload photo</Button>
          <Button href={`/projects/${projectId}/analysis`} iconRight="arrowRight" className={cn(!done && "opacity-50")}>
            {done ? "Start analysis" : "Analyze with current photos"}
          </Button>
        </div>
      </aside>

      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}
