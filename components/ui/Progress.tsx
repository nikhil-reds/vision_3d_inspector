import { cn } from "@/lib/cn";

export function ProgressBar({ value, className, tone = "accent", size = "md" }: { value: number; className?: string; tone?: "accent" | "emerald" | "amber" | "violet"; size?: "sm" | "md" }) {
  const tones = {
    accent: "from-accent-500 to-accent-300 shadow-[0_0_12px_rgba(79,220,244,0.55)]",
    emerald: "from-emerald-500 to-emerald-300",
    amber: "from-amber-500 to-amber-300",
    violet: "from-violet-500 to-violet-300 shadow-[0_0_12px_rgba(167,139,250,0.5)]",
  };
  return (
    <div
      className={cn("w-full overflow-hidden rounded-full bg-white/[0.06]", size === "sm" ? "h-1" : "h-1.5", className)}
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className={cn("h-full rounded-full bg-gradient-to-r transition-[width] duration-500 ease-out", tones[tone])} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function ScoreRing({ value, size = 140, stroke = 10, label, sublabel, className }: { value: number; size?: number; stroke?: number; label?: string; sublabel?: string; className?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color = value >= 95 ? "#34d399" : value >= 85 ? "#4fdcf4" : value >= 70 ? "#fbbf24" : "#f43f5e";
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r - stroke / 2 - 4} stroke="rgba(255,255,255,0.05)" strokeWidth={1} strokeDasharray="2 5" fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value / 100)}
          style={{ filter: `drop-shadow(0 0 8px ${color}88)`, transition: "stroke-dashoffset 0.8s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-[1.6em] font-semibold tracking-tight text-white tabular-nums" style={{ fontSize: size / 5 }}>
          {value.toFixed(1)}
          <span className="text-mist-400" style={{ fontSize: size / 10 }}>%</span>
        </span>
        {label && <span className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-mist-400">{label}</span>}
        {sublabel && <span className="text-[11px] text-mist-400">{sublabel}</span>}
      </div>
    </div>
  );
}
