import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "default" | "outline" | "ghost" | "secondary" | "destructive";
type Size = "xs" | "sm" | "default" | "icon";

const base =
  "inline-flex shrink-0 items-center justify-center font-medium whitespace-nowrap transition-all duration-150 select-none cursor-pointer";

const variants: Record<Variant, string> = {
  default:
    "bg-[#0057FF] text-white rounded-xl shadow-[0_1px_3px_rgba(0,87,255,0.3)] hover:bg-[#0047D4] active:scale-[0.98]",
  outline:
    "bg-white text-[#3A3A3C] border border-[rgba(0,0,0,0.1)] rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.06)] hover:bg-[#F2F2F7] active:scale-[0.98]",
  ghost:
    "text-[#3A3A3C] rounded-xl hover:bg-[rgba(0,0,0,0.05)]",
  secondary:
    "bg-[#F2F2F7] text-[#3A3A3C] rounded-xl hover:bg-[#E8E8ED] active:scale-[0.98]",
  destructive:
    "bg-[#FF3B30] text-white rounded-xl hover:bg-[#E0352A] active:scale-[0.98]",
};

const sizes: Record<Size, string> = {
  xs:      "h-6 px-2 text-[11px] gap-1",
  sm:      "h-7 px-3 text-[12px] gap-1.5",
  default: "h-9 px-4 text-[13px] gap-2",
  icon:    "h-9 w-9",
};

interface Props {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
}

export function ButtonLink({ href, children, variant = "default", size = "default", className }: Props) {
  return (
    <Link href={href} className={cn(base, variants[variant], sizes[size], className)}>
      {children}
    </Link>
  );
}
