"use client";

import { useEffect } from "react";
import { Icon } from "./Icon";

export function Toast({ message, onDone, duration = 2800 }: { message: string | null; onDone: () => void; duration?: number }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDone, duration);
    return () => clearTimeout(t);
  }, [message, onDone, duration]);

  if (!message) return null;
  return (
    <div role="status" className="fixed bottom-6 left-1/2 z-[110] flex -translate-x-1/2 animate-fade-up items-center gap-3 rounded-2xl border border-white/10 bg-ink-750/95 px-4 py-3 text-sm text-white shadow-2xl shadow-black/50 backdrop-blur-xl">
      <span className="flex size-6 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
        <Icon name="check" size={14} />
      </span>
      {message}
    </div>
  );
}
