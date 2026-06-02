import { cn } from "@/lib/utils";

/**
 * Krylo brand mark.
 *
 * Concept: stylized "K" formed by two angled blades + diamond accent.
 * The diamond evokes a card/chip; the angled blades convey forward motion.
 * Gradient: indigo → violet → magenta.
 *
 * Variants:
 *  - mark      → square icon only (favicon, avatar, sidebar collapsed)
 *  - wordmark  → text-only "Krylo" with custom letterforms
 *  - full      → mark + wordmark side by side
 */

interface LogoProps {
  variant?: "mark" | "wordmark" | "full";
  size?: number;          // pixel size for mark
  textColor?: string;     // wordmark text color
  className?: string;
  showTagline?: boolean;
}

const GRADIENT_ID = "krylo-grad";
const GLOW_ID = "krylo-glow";

function Mark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Krylo"
    >
      <defs>
        <linearGradient id={GRADIENT_ID} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#4F46E5" />
          <stop offset="55%"  stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
        <filter id={GLOW_ID} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Rounded square base with gradient */}
      <rect x="0" y="0" width="64" height="64" rx="14" fill={`url(#${GRADIENT_ID})`} />

      {/* Subtle inner highlight */}
      <rect x="0" y="0" width="64" height="64" rx="14" fill="url(#krylo-shine)" opacity="0.15" />
      <defs>
        <linearGradient id="krylo-shine" x1="0" y1="0" x2="0" y2="64">
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* K mark — vertical bar + two diagonal blades */}
      <g fill="white">
        {/* Vertical stem */}
        <rect x="14" y="14" width="6" height="36" rx="2" />
        {/* Upper diagonal blade */}
        <path d="M22 30 L42 14 L48 14 L28 32 Z" />
        {/* Lower diagonal blade */}
        <path d="M22 32 L28 32 L48 50 L42 50 Z" />
      </g>

      {/* Diamond accent — top right */}
      <g transform="translate(48 14) rotate(45)">
        <rect x="-3" y="-3" width="6" height="6" fill="white" opacity="0.9" />
      </g>
    </svg>
  );
}

function Wordmark({ color = "#0F172A", size = 22 }: { color?: string; size?: number }) {
  return (
    <span
      className="font-extrabold tracking-[-0.04em] leading-none"
      style={{ color, fontSize: size, fontFeatureSettings: '"ss01"' }}
    >
      Krylo
    </span>
  );
}

export function Logo({
  variant = "full",
  size = 32,
  textColor = "#0F172A",
  className,
  showTagline = false,
}: LogoProps) {
  if (variant === "mark") return <span className={className}><Mark size={size} /></span>;
  if (variant === "wordmark")
    return (
      <span className={cn("inline-flex flex-col", className)}>
        <Wordmark color={textColor} size={size} />
        {showTagline && (
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#64748B] mt-1">
            Cartões & Benefícios
          </span>
        )}
      </span>
    );
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Mark size={size} />
      <span className="inline-flex flex-col leading-none">
        <Wordmark color={textColor} size={size * 0.7} />
        {showTagline && (
          <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#64748B] mt-1">
            Cartões & Benefícios
          </span>
        )}
      </span>
    </span>
  );
}
