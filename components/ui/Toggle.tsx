"use client";

import { cn } from "@/lib/cn";

export function Toggle({ checked, onChange, label, id }: { checked: boolean; onChange: (v: boolean) => void; label: string; id?: string }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full ring-1 ring-inset transition-colors",
        checked ? "bg-accent-500/80 ring-accent-300/50" : "bg-ink-600 ring-white/10"
      )}
    >
      <span className={cn("inline-block size-4.5 rounded-full bg-white shadow transition-transform", checked ? "translate-x-5.5" : "translate-x-1")} />
    </button>
  );
}
