import { cn } from "@/lib/cn";

export function SectionHeading({ eyebrow, title, description, align = "center", className }: { eyebrow: string; title: React.ReactNode; description?: string; align?: "center" | "left"; className?: string }) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      <p className={cn("inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.24em] text-accent-400")}>
        <span className="h-px w-6 bg-accent-400/60" />
        {eyebrow}
      </p>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-base leading-relaxed text-mist-400">{description}</p>}
    </div>
  );
}
