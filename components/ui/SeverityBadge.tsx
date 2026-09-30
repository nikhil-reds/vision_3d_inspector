import { cn } from "@/lib/cn";
import { severityMeta, type Severity } from "@/lib/data";

const styles: Record<Severity, string> = {
  critical: "bg-rose-500/12 text-rose-300 ring-rose-400/30",
  high: "bg-orange-500/12 text-orange-300 ring-orange-400/30",
  medium: "bg-yellow-400/10 text-yellow-200 ring-yellow-300/25",
  low: "bg-sky-400/10 text-sky-300 ring-sky-400/25",
};

const bars: Record<Severity, number> = { critical: 4, high: 3, medium: 2, low: 1 };

export function SeverityBadge({ severity, className }: { severity: Severity; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 rounded-md px-2 py-1 text-[11px] font-semibold uppercase tracking-wider ring-1 ring-inset", styles[severity], className)}>
      <span className="flex items-end gap-[2px]" aria-hidden>
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className={cn("w-[3px] rounded-sm bg-current", i > bars[severity] && "opacity-25")} style={{ height: 3 + i * 2 }} />
        ))}
      </span>
      {severityMeta[severity].label}
    </span>
  );
}
