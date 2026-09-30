import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";

export function Logo({ href = "/", className, compact }: { href?: string; className?: string; compact?: boolean }) {
  return (
    <Link href={href} className={cn("group flex items-center gap-2.5", className)}>
      <Image src="/icons/logo-mark.svg" alt="" width={34} height={34} className="rounded-[10px] transition-transform group-hover:scale-105" priority />
      {!compact && (
        <span className="leading-none">
          <span className="block text-[15px] font-semibold tracking-tight text-white">
            Vision<span className="text-accent-300">3D</span>
          </span>
          <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-[0.22em] text-mist-400">Inspector</span>
        </span>
      )}
    </Link>
  );
}
