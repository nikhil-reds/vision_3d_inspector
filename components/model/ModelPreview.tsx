"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { modelViews } from "@/lib/data";
import { IconButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

type ViewId = (typeof modelViews)[number]["id"];

/** Static "3D" viewport: switches between pre-rendered views of the reference model. */
export function ModelPreview({ empty, fileName, className }: { empty?: boolean; fileName?: string; className?: string }) {
  const [view, setView] = useState<ViewId>("iso");
  const [zoom, setZoom] = useState(1);
  const [grid, setGrid] = useState(true);
  const [dims, setDims] = useState(true);
  const [spin, setSpin] = useState(0);
  const current = modelViews.find((v) => v.id === view)!;

  const cycle = () => {
    const order: ViewId[] = ["iso", "front", "side", "top"];
    const i = order.indexOf(view);
    setView(order[(i + 1) % order.length] ?? "iso");
    setSpin((s) => s + 1);
  };

  return (
    <div className={cn("panel relative overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] px-3 py-2 sm:px-4">
        <div className="flex items-center gap-2">
          <span className="flex size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          <span className="font-mono text-[11px] text-mist-300">{empty ? "No model loaded" : fileName}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <IconButton icon="rotate" label="Next view" onClick={cycle} disabled={empty} />
          <IconButton icon="zoomIn" label="Zoom in" onClick={() => setZoom((z) => Math.min(1.6, z + 0.15))} disabled={empty} />
          <IconButton icon="zoomOut" label="Zoom out" onClick={() => setZoom((z) => Math.max(0.8, z - 0.15))} disabled={empty} />
          <IconButton icon="grid" label="Toggle grid overlay" active={grid} onClick={() => setGrid((g) => !g)} />
          <IconButton icon="ruler" label="Toggle dimensions" active={dims} onClick={() => setDims((d) => !d)} disabled={empty} />
          <IconButton icon="maximize" label="Reset view" onClick={() => { setZoom(1); setView("iso"); }} disabled={empty} />
        </div>
      </div>

      {/* Viewport */}
      <div className="relative aspect-[4/3] overflow-hidden bg-ink-950 sm:aspect-[16/10]">
        <div className="absolute inset-0 transition-transform duration-500 ease-out" style={{ transform: `scale(${zoom})` }}>
          <Image
            key={`${view}-${spin}`}
            src={empty ? "/images/placeholders/model-empty.jpg" : current.src}
            alt={empty ? "Empty viewport" : `${current.label} view of reference model`}
            fill
            sizes="(min-width:1280px) 60vw, 95vw"
            className="animate-fade-up object-cover"
            priority
          />
        </div>
        {grid && <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" />}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(4,6,10,0.7))]" />

        {empty ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-ink-800/80 ring-1 ring-white/10 backdrop-blur">
              <Icon name="cube" size={28} className="text-accent-300" />
            </div>
            <p className="mt-4 font-medium text-white">Upload a model to preview it</p>
            <p className="mt-1 text-sm text-mist-400">The viewport renders your reference geometry here.</p>
          </div>
        ) : (
          <>
            {/* HUD */}
            <div className="hud-corners pointer-events-none absolute inset-5 opacity-40" />
            <div className="pointer-events-none absolute left-4 top-4 space-y-1 font-mono text-[10px] uppercase tracking-wider text-mist-300 sm:left-6 sm:top-6">
              <p className="text-accent-300">View · {current.label}</p>
              <p>Zoom {Math.round(zoom * 100)}%</p>
              <p className="hidden sm:block">Shading · {view === "wire" ? "Wireframe" : "Solid + edges"}</p>
            </div>
            <Image src="/icons/axis-gizmo.svg" alt="" width={64} height={64} className="pointer-events-none absolute bottom-4 left-4 opacity-90 sm:bottom-6 sm:left-6" />
            {dims && (
              <div className="pointer-events-none absolute bottom-4 right-4 rounded-xl bg-ink-950/70 px-3 py-2 font-mono text-[10px] text-mist-200 ring-1 ring-white/10 backdrop-blur sm:bottom-6 sm:right-6">
                <p><span className="text-rose-300">X</span> 120.0 mm</p>
                <p><span className="text-emerald-300">Y</span> 100.0 mm</p>
                <p><span className="text-sky-300">Z</span> 80.0 mm</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* View switcher */}
      <div className="flex gap-2 overflow-x-auto border-t border-white/[0.06] p-3">
        {modelViews.map((v) => (
          <button
            key={v.id}
            disabled={empty}
            onClick={() => setView(v.id)}
            className={cn(
              "group relative shrink-0 overflow-hidden rounded-lg ring-1 transition disabled:opacity-40",
              view === v.id && !empty ? "ring-2 ring-accent-400" : "ring-white/10 hover:ring-white/25"
            )}
          >
            <span className="relative block h-12 w-20">
              <Image src={v.src} alt="" fill sizes="80px" className="object-cover" />
            </span>
            <span className="absolute inset-x-0 bottom-0 bg-ink-950/75 py-0.5 text-center text-[10px] text-mist-200">{v.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
