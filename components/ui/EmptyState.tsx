import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./Icon";

export function EmptyState({
  icon = "cube",
  title,
  description,
  action,
  className,
}: {
  icon?: IconName;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-white/10 px-6 py-16 text-center", className)}>
      <div className="bg-grid-fade pointer-events-none absolute inset-0 opacity-70" />
      <div className="relative mb-5 flex size-16 items-center justify-center rounded-2xl bg-ink-700 ring-1 ring-white/10">
        <div className="absolute inset-0 rounded-2xl bg-accent-400/10 blur-xl" />
        <Icon name={icon} size={26} className="relative text-accent-300" />
      </div>
      <h3 className="relative text-base font-semibold text-white">{title}</h3>
      {description && <p className="relative mt-2 max-w-sm text-sm text-mist-400">{description}</p>}
      {action && <div className="relative mt-6">{action}</div>}
    </div>
  );
}
