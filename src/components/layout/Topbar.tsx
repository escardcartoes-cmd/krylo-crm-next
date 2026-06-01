"use client";

interface TopbarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Topbar({ title, subtitle, actions }: TopbarProps) {
  return (
    <header className="flex items-center justify-between px-8 pt-7 pb-2">
      <div>
        <h1 className="text-[26px] font-extrabold text-[#0F172A] tracking-[-0.6px] leading-tight">{title}</h1>
        {subtitle && <p className="text-[13px] text-[#64748B] mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
