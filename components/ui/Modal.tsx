"use client";

import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}

export function Modal({ open, onClose, title, description, children, footer, size = "md" }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={title}>
      <button aria-label="Close dialog" className="absolute inset-0 bg-ink-950/75 backdrop-blur-sm animate-fade-up" onClick={onClose} />
      <div
        className={cn(
          "relative w-full animate-fade-up overflow-hidden rounded-t-3xl border border-white/10 bg-ink-800 shadow-2xl shadow-black/60 sm:rounded-3xl",
          size === "sm" && "sm:max-w-md",
          size === "md" && "sm:max-w-lg",
          size === "lg" && "sm:max-w-3xl"
        )}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-400/60 to-transparent" />
        <div className="flex items-start justify-between gap-4 px-6 pt-6">
          <div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            {description && <p className="mt-1 text-sm text-mist-400">{description}</p>}
          </div>
          <button onClick={onClose} aria-label="Close" className="-mr-2 -mt-1 rounded-lg p-2 text-mist-400 hover:bg-white/5 hover:text-white">
            <Icon name="x" size={18} />
          </button>
        </div>
        {children && <div className="px-6 py-5">{children}</div>}
        {footer && <div className="flex flex-col-reverse gap-2 border-t border-white/[0.06] bg-ink-850/60 px-6 py-4 sm:flex-row sm:justify-end">{footer}</div>}
      </div>
    </div>
  );
}
