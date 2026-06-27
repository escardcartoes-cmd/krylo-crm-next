import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "default" | "outline" | "ghost" | "secondary" | "destructive";
type Size = "xs" | "sm" | "default" | "icon";

const base =
  "inline-flex shrink-0 items-center justify-center font-medium whitespace-nowrap transition-colors duration-100 select-none cursor-pointer";

const variants: Record<Variant, string> = {
  default:
    "bg-[#4F46E5] text-white rounded-lg hover:bg-[#4338CA] active:bg-[#3730A3]",
  outline:
    "bg-white text-[#0F172A] border border-[#CBD5E1] rounded-lg hover:bg-[#F8FAFC] hover:border-[#94A3B8]",
  ghost:
    "text-[#475569] rounded-lg hover:bg-[#F1F5F9] hover:text-[#0F172A]",
  secondary:
    "bg-[#F1F5F9] text-[#0F172A] rounded-lg hover:bg-[#E2E8F0]",
  destructive:
    "bg-[#DC2626] text-white rounded-lg hover:bg-[#B91C1C]",
};

const sizes: Record<Size, string> = {
  xs:      "h-7 px-2.5 text-[12px] gap-1",
  sm:      "h-8 px-3.5 text-[13px] gap-1.5",
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
