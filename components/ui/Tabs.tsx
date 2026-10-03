"use client";

import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./Icon";

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  icon?: IconName;
  count?: number;
}

interface TabsProps<T extends string> {
  items: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  variant?: "pill" | "underline";
  size?: "sm" | "md";
  className?: string;
}

export function Tabs<T extends string>({ items, value, onChange, variant = "pill", size = "md", className }: TabsProps<T>) {
  if (variant === "underline") {
    return (
      <div role="tablist" className={cn("flex gap-6 overflow-x-auto border-b border-white/[0.07]", className)}>
        {items.map((t) => {
          const active = t.id === value;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(t.id)}
              className={cn(
                "relative flex shrink-0 items-center gap-2 pb-3 text-sm font-medium transition-colors",
                active ? "text-white" : "text-mist-400 hover:text-mist-200"
              )}
            >
              {t.icon && <Icon name={t.icon} size={15} />}
              {t.label}
              {t.count !== undefined && (
                <span className={cn("rounded-md px-1.5 py-0.5 text-[11px] tabular-nums", active ? "bg-accent-400/15 text-accent-300" : "bg-white/5 text-mist-400")}>{t.count}</span>
              )}
              {active && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-accent-400 shadow-[0_0_12px_rgba(79,220,244,0.8)]" />}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div role="tablist" className={cn("inline-flex max-w-full gap-1 overflow-x-auto rounded-xl bg-ink-900/80 p-1 ring-1 ring-inset ring-white/[0.07]", className)}>
      {items.map((t) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.id)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-lg font-medium transition-all",
              size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-3.5 py-2 text-sm",
              active ? "bg-white/[0.09] text-white shadow-sm ring-1 ring-inset ring-white/10" : "text-mist-400 hover:text-mist-200"
            )}
          >
            {t.icon && <Icon name={t.icon} size={size === "sm" ? 13 : 15} />}
            {t.label}
            {t.count !== undefined && <span className="tabular-nums text-mist-400">{t.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
