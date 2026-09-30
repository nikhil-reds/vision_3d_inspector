import { cn } from "@/lib/cn";
import type { ActivityKind } from "@/lib/data";
import { Icon, type IconName } from "@/components/ui/Icon";

const kinds: Record<ActivityKind, { icon: IconName; cls: string }> = {
  analysis: { icon: "activity", cls: "text-violet-300 bg-violet-400/10 ring-violet-400/20" },
  upload: { icon: "cube", cls: "text-accent-300 bg-accent-400/10 ring-accent-400/20" },
  capture: { icon: "camera", cls: "text-sky-300 bg-sky-400/10 ring-sky-400/20" },
  issue: { icon: "alert", cls: "text-rose-300 bg-rose-400/10 ring-rose-400/20" },
  report: { icon: "file", cls: "text-emerald-300 bg-emerald-400/10 ring-emerald-400/20" },
  project: { icon: "folder", cls: "text-amber-300 bg-amber-400/10 ring-amber-400/20" },
};

export function ActivityFeed({ items }: { items: { id: string; kind: ActivityKind; title: string; detail: string; time: string; user: string }[] }) {
  return (
    <div className="panel p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">Recent activity</h2>
          <p className="mt-0.5 text-xs text-mist-400">Live event stream</p>
        </div>
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-emerald-300">
          <span className="size-1.5 animate-pulse-soft rounded-full bg-emerald-400" /> Live
        </span>
      </div>
      <ol className="relative space-y-5">
        <span className="absolute bottom-2 left-[17px] top-2 w-px bg-gradient-to-b from-white/10 via-white/[0.06] to-transparent" aria-hidden />
        {items.map((a) => {
          const k = kinds[a.kind];
          return (
            <li key={a.id} className="relative flex gap-3.5">
              <span className={cn("relative z-10 flex size-9 shrink-0 items-center justify-center rounded-xl bg-ink-800 ring-1 ring-inset", k.cls)}>
                <Icon name={k.icon} size={16} />
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate text-sm font-medium text-white">{a.title}</p>
                  <span className="shrink-0 text-[11px] text-mist-400">{a.time}</span>
                </div>
                <p className="mt-0.5 truncate text-xs text-mist-400">{a.detail}</p>
                <p className="mt-1 text-[11px] text-mist-400/70">by {a.user}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
