import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./Icon";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-b from-accent-300 to-accent-500 text-ink-950 shadow-[0_0_0_1px_rgba(138,238,253,0.4),0_8px_24px_-8px_rgba(28,195,224,0.6)] hover:from-accent-300 hover:to-accent-400",
  secondary: "bg-white/[0.06] text-white ring-1 ring-inset ring-white/10 hover:bg-white/[0.1]",
  outline: "text-mist-200 ring-1 ring-inset ring-white/15 hover:bg-white/[0.04] hover:text-white",
  ghost: "text-mist-300 hover:bg-white/[0.05] hover:text-white",
  danger: "bg-rose-500/15 text-rose-300 ring-1 ring-inset ring-rose-400/30 hover:bg-rose-500/25",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-xl",
  lg: "h-12 px-6 text-[15px] gap-2.5 rounded-xl",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  iconRight?: IconName;
  className?: string;
  children?: ReactNode;
}

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type LinkProps = CommonProps & { href: string; target?: string };

export function Button(props: ButtonProps | LinkProps) {
  const { variant = "primary", size = "md", icon, iconRight, className, children } = props;
  const cls = cn(
    "inline-flex shrink-0 items-center justify-center font-medium whitespace-nowrap transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400 disabled:pointer-events-none disabled:opacity-40",
    variants[variant],
    sizes[size],
    className
  );
  const iconSize = size === "sm" ? 14 : size === "lg" ? 18 : 16;
  const content = (
    <>
      {icon && <Icon name={icon} size={iconSize} />}
      {children}
      {iconRight && <Icon name={iconRight} size={iconSize} />}
    </>
  );

  if (props.href !== undefined) {
    return (
      <Link href={props.href} target={props.target} className={cls}>
        {content}
      </Link>
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { variant: _v, size: _s, icon: _i, iconRight: _ir, className: _c, children: _ch, type = "button", ...rest } = props as ButtonProps;
  return (
    <button type={type} className={cls} {...rest}>
      {content}
    </button>
  );
}

export function IconButton({
  icon,
  label,
  className,
  active,
  ...rest
}: { icon: IconName; label: string; active?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-xl text-mist-300 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-2 focus-visible:outline-accent-400",
        active && "bg-accent-400/15 text-accent-300 ring-1 ring-inset ring-accent-400/30",
        className
      )}
      {...rest}
    >
      <Icon name={icon} size={17} />
    </button>
  );
}
