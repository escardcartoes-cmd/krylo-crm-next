import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "default" | "outline" | "ghost" | "secondary" | "destructive";
type Size = "xs" | "sm" | "default" | "icon";

const base =
  "inline-flex shrink-0 items-center justify-center font-semibold whitespace-nowrap transition-all duration-150 select-none cursor-pointer";

const variants: Record<Variant, string> = {
  default:
    "text-white rounded-xl active:scale-[0.98]",
  outline:
    "bg-white text-[#334155] border border-[rgba(15,23,42,0.1)] rounded-xl hover:bg-[#F8FAFC] hover:border-[rgba(79,70,229,0.3)] active:scale-[0.98]",
  ghost:
    "text-[#475569] rounded-xl hover:bg-[rgba(79,70,229,0.06)] hover:text-[#4F46E5]",
  secondary:
    "bg-[#F1F5F9] text-[#334155] rounded-xl hover:bg-[#E2E8F0] active:scale-[0.98]",
  destructive:
    "bg-[#EF4444] text-white rounded-xl hover:bg-[#DC2626] active:scale-[0.98]",
};

const defaultStyle: Record<Variant, React.CSSProperties | undefined> = {
  default: {
    background: "linear-gradient(135deg,#4F46E5 0%,#6366F1 100%)",
    boxShadow: "0 1px 0 0 rgba(255,255,255,0.2) inset, 0 4px 12px rgba(79,70,229,0.3), 0 1px 3px rgba(79,70,229,0.2)",
  },
  outline: { boxShadow: "0 1px 2px rgba(15,23,42,0.04)" },
  ghost: undefined,
  secondary: undefined,
  destructive: { boxShadow: "0 4px 12px rgba(239,68,68,0.25)" },
};

const sizes: Record<Size, string> = {
  xs:      "h-7 px-2.5 text-[11px] gap-1",
  sm:      "h-8 px-3.5 text-[12px] gap-1.5",
  default: "h-10 px-5 text-[13px] gap-2",
  icon:    "h-10 w-10",
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
    <Link
      href={href}
      className={cn(base, variants[variant], sizes[size], className)}
      style={defaultStyle[variant]}
    >
      {children}
    </Link>
  );
}
