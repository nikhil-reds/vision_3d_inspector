"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./Icon";

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  hint?: string;
}

interface SelectProps<T extends string> {
  value: T;
  options: SelectOption<T>[];
  onChange: (v: T) => void;
  icon?: IconName;
  label?: string;
  className?: string;
  align?: "left" | "right";
  id?: string;
}

/** Custom dropdown menu styled for the dark UI. */
export function Select<T extends string>({ value, options, onChange, icon, label, className, align = "left", id }: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-10 w-full items-center gap-2 rounded-xl bg-ink-800 px-3 text-left text-sm text-mist-200 ring-1 ring-inset ring-white/10 transition hover:ring-white/20",
          open && "ring-accent-400/50"
        )}
      >
        {icon && <Icon name={icon} size={15} className="text-mist-400" />}
        {label && <span className="text-mist-400">{label}</span>}
        <span className="flex-1 truncate font-medium text-white">{current?.label}</span>
        <Icon name="chevronDown" size={15} className={cn("text-mist-400 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <ul
          role="listbox"
          className={cn(
            "absolute z-50 mt-2 max-h-72 min-w-full animate-fade-up overflow-auto rounded-xl border border-white/10 bg-ink-750/95 p-1 shadow-2xl shadow-black/50 backdrop-blur-xl",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {options.map((o) => {
            const selected = o.value === value;
            return (
              <li key={o.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm whitespace-nowrap transition-colors",
                    selected ? "bg-accent-400/10 text-white" : "text-mist-300 hover:bg-white/[0.05] hover:text-white"
                  )}
                >
                  <span className="flex-1">
                    {o.label}
                    {o.hint && <span className="block text-xs text-mist-400">{o.hint}</span>}
                  </span>
                  {selected && <Icon name="check" size={15} className="text-accent-300" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
