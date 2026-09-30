import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Field({ label, htmlFor, hint, error, children, optional }: { label: string; htmlFor?: string; hint?: string; error?: string; children: ReactNode; optional?: boolean }) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="flex items-center justify-between text-sm font-medium text-mist-200">
        {label}
        {optional && <span className="text-xs font-normal text-mist-400">Optional</span>}
      </label>
      {children}
      {error ? <p className="text-xs text-rose-300">{error}</p> : hint ? <p className="text-xs text-mist-400">{hint}</p> : null}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl bg-ink-800 px-3.5 text-sm text-white ring-1 ring-inset ring-white/10 placeholder:text-mist-400/70 transition focus:outline-none focus:ring-2 focus:ring-accent-400/60";

export function TextInput({ className, invalid, ...props }: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return <input className={cn(inputCls, "h-11", invalid && "ring-rose-400/60", className)} {...props} />;
}

export function TextArea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(inputCls, "min-h-28 resize-y py-3", className)} {...props} />;
}
