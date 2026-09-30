import { cn } from "@/lib/cn";
import { ProgressBar } from "@/components/ui/Progress";
import { Icon } from "@/components/ui/Icon";

export interface ProgressStep {
  id: string;
  label: string;
  detail: string;
  duration: string;
  /** 0–100 */
  progress: number;
}

export function InspectionProgress({ steps, className }: { steps: ProgressStep[]; className?: string }) {
  return (
    <ol className={cn("relative space-y-3", className)}>
      {steps.map((s, i) => {
        const state = s.progress >= 100 ? "done" : s.progress > 0 ? "active" : "pending";
        return (
          <li
            key={s.id}
            className={cn(
              "relative flex gap-4 rounded-2xl p-4 transition-all duration-300",
              state === "active" ? "bg-accent-400/[0.06] ring-1 ring-inset ring-accent-400/30" : "ring-1 ring-inset ring-white/[0.05]",
              state === "pending" && "opacity-60"
            )}
          >
            <div className="relative flex flex-col items-center">
              <span
                className={cn(
                  "relative flex size-9 items-center justify-center rounded-xl font-mono text-xs ring-1 ring-inset",
                  state === "done" && "bg-emerald-400/15 text-emerald-300 ring-emerald-400/30",
                  state === "active" && "bg-accent-400/15 text-accent-300 ring-accent-400/40",
                  state === "pending" && "bg-white/[0.03] text-mist-400 ring-white/10"
                )}
              >
                {state === "done" ? <Icon name="check" size={16} strokeWidth={2.5} /> : `0${i + 1}`}
                {state === "active" && <span className="absolute inset-0 animate-ping rounded-xl ring-1 ring-accent-400/40" />}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <p className={cn("font-medium", state === "pending" ? "text-mist-300" : "text-white")}>{s.label}</p>
                <span className="shrink-0 font-mono text-xs text-mist-400">
                  {state === "done" ? s.duration : state === "active" ? `${Math.round(s.progress)}%` : "Queued"}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-mist-400">{s.detail}</p>
              <ProgressBar value={s.progress} size="sm" tone={state === "done" ? "emerald" : "accent"} className="mt-3" />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
