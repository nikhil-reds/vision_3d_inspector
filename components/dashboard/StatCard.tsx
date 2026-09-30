import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/components/ui/Icon";

interface StatCardProps {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down" | "flat";
  /** When true, a downward trend is good (e.g. issues). */
  invert?: boolean;
  hint?: string;
  icon: IconName;
  spark?: number[];
  accent?: "cyan" | "emerald" | "violet" | "amber";
}

const accents = {
  cyan: { text: "text-accent-300", bg: "bg-accent-400/10", ring: "ring-accent-400/20", stroke: "#4fdcf4" },
  emerald: { text: "text-emerald-300", bg: "bg-emerald-400/10", ring: "ring-emerald-400/20", stroke: "#34d399" },
  violet: { text: "text-violet-300", bg: "bg-violet-400/10", ring: "ring-violet-400/20", stroke: "#a78bfa" },
  amber: { text: "text-amber-300", bg: "bg-amber-400/10", ring: "ring-amber-400/20", stroke: "#fbbf24" },
};

function Sparkline({ data, color, id }: { data: number[]; color: string; id: string }) {
  const w = 120, h = 40;
  const min = Math.min(...data), max = Math.max(...data);
  const pts = data.map((d, i) => [(i / (data.length - 1)) * w, h - 4 - ((d - min) / (max - min || 1)) * (h - 8)]);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-10 w-28" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.35" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L${w},${h} L0,${h} Z`} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.75" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function StatCard({ label, value, delta, trend = "flat", invert, hint, icon, spark, accent = "cyan" }: StatCardProps) {
  const a = accents[accent];
  const good = trend === "flat" ? null : invert ? trend === "down" : trend === "up";
  return (
    <div className="panel group relative overflow-hidden p-5 transition-colors hover:border-white/15">
      <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full opacity-0 blur-3xl transition-opacity group-hover:opacity-100" style={{ background: `${a.stroke}22` }} />
      <div className="flex items-start justify-between">
        <div className={cn("flex size-10 items-center justify-center rounded-xl ring-1 ring-inset", a.bg, a.ring, a.text)}>
          <Icon name={icon} size={18} />
        </div>
        {spark && <Sparkline data={spark} color={a.stroke} id={`spark-${label.replace(/\W/g, "")}`} />}
      </div>
      <p className="mt-5 text-sm text-mist-400">{label}</p>
      <div className="mt-1 flex items-end justify-between gap-3">
        <p className="font-mono text-3xl font-semibold tracking-tight text-white tabular-nums">{value}</p>
        {delta && (
          <span
            className={cn(
              "mb-1 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium",
              good === null ? "bg-white/5 text-mist-300" : good ? "bg-emerald-400/10 text-emerald-300" : "bg-rose-400/10 text-rose-300"
            )}
          >
            {trend !== "flat" && <Icon name="arrowUpRight" size={12} className={cn(trend === "down" && "rotate-90")} />}
            {delta}
          </span>
        )}
      </div>
      {hint && <p className="mt-1 text-xs text-mist-400/80">{hint}</p>}
    </div>
  );
}
