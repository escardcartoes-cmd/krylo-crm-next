"use client";

interface TopbarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Topbar({ title, subtitle, actions }: TopbarProps) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-7 py-4 bg-white/80 backdrop-blur-sm border-b border-[rgba(0,0,0,0.06)] shadow-[0_1px_0_rgba(0,0,0,0.04)]">
      <div>
        <h1 className="text-[20px] font-bold text-[#1C1C1E] tracking-[-0.4px] leading-tight">{title}</h1>
        {subtitle && <p className="text-[12px] text-[#8E8E93] mt-0.5">{subtitle}</p>}
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </header>
  );
}
