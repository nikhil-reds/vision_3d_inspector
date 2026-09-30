import { cn } from "@/lib/cn";
import { statusMeta, type ProjectStatus } from "@/lib/data";

const tones = {
  slate: "bg-slate-400/10 text-slate-300 ring-slate-400/20",
  sky: "bg-sky-400/10 text-sky-300 ring-sky-400/25",
  violet: "bg-violet-400/10 text-violet-300 ring-violet-400/25",
  emerald: "bg-emerald-400/10 text-emerald-300 ring-emerald-400/25",
  amber: "bg-amber-400/10 text-amber-300 ring-amber-400/25",
};

const dots = {
  slate: "bg-slate-400",
  sky: "bg-sky-400",
  violet: "bg-violet-400 animate-pulse-soft",
  emerald: "bg-emerald-400",
  amber: "bg-amber-400",
};

export function StatusBadge({ status, className }: { status: ProjectStatus; className?: string }) {
  const meta = statusMeta[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium whitespace-nowrap ring-1 ring-inset", tones[meta.tone], className)}>
      <span className={cn("size-1.5 rounded-full", dots[meta.tone])} />
      {meta.label}
    </span>
  );
}
