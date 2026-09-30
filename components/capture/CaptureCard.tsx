import Image from "next/image";
import { cn } from "@/lib/cn";
import type { CaptureAngle } from "@/lib/data";
import { Icon } from "@/components/ui/Icon";

export function CaptureCard({ angle, index, selected, captured, onSelect }: { angle: CaptureAngle; index: number; selected: boolean; captured: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "group relative flex w-full items-center gap-3 rounded-2xl p-2.5 text-left transition-all",
        selected ? "bg-accent-400/[0.08] ring-1 ring-inset ring-accent-400/50" : "ring-1 ring-inset ring-white/[0.06] hover:bg-white/[0.03] hover:ring-white/15"
      )}
    >
      <div className="relative aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-xl bg-ink-900 ring-1 ring-white/10 sm:w-24">
        {captured ? (
          <Image src={angle.image} alt={angle.label} fill sizes="96px" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center border border-dashed border-white/10">
            <AngleGlyph id={angle.id} />
          </div>
        )}
        {captured && (
          <span className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-emerald-400 text-ink-950 shadow">
            <Icon name="check" size={12} strokeWidth={3} />
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[10px] uppercase tracking-wider text-mist-400">Shot 0{index + 1} · {angle.angle}</p>
        <p className="mt-0.5 truncate text-sm font-medium text-white">{angle.label}</p>
        <p className={cn("mt-1 text-xs", captured ? "text-emerald-300" : selected ? "text-accent-300" : "text-mist-400")}>
          {captured ? `Captured · quality ${angle.quality ?? 90}%` : selected ? "Ready to capture" : "Pending"}
        </p>
      </div>
      {selected && <span className="absolute -left-px inset-y-4 w-[3px] rounded-r-full bg-accent-400 shadow-[0_0_10px_rgba(79,220,244,0.9)]" />}
    </button>
  );
}

/** Small top-down diagram showing where the camera should stand. */
function AngleGlyph({ id }: { id: string }) {
  const rot: Record<string, number> = { front: 0, "left-45": -45, "right-45": 45, rear: 180, top: 0 };
  return (
    <svg viewBox="0 0 48 36" className="h-8 w-10 text-mist-400" aria-hidden>
      <rect x="18" y="12" width="12" height="10" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
      {id === "top" ? (
        <circle cx="24" cy="17" r="3" fill="none" stroke="#4fdcf4" strokeWidth="1.4" />
      ) : (
        <g transform={`rotate(${rot[id] ?? 0} 24 17)`}>
          <path d="M24 30v-5" stroke="#4fdcf4" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="24" cy="32" r="2.2" fill="#4fdcf4" />
        </g>
      )}
    </svg>
  );
}
