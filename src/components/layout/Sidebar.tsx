"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, Bot, Phone, Mail, Brain,
  HelpCircle, Radar, Building2, Users, Target,
  BarChart3, Calculator, CheckSquare, Thermometer,
  LogOut, Settings, ChevronRight,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  indent?: boolean;
  badge?: number;
}

const navSections: { label: string | null; items: NavItem[] }[] = [
  {
    label: null,
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Prospecção",
    items: [
      { href: "/sdr-evolutivo",   label: "SDR Evolutivo",   icon: Bot },
      { href: "/fila-whatsapp",   label: "Fila WhatsApp",   icon: Phone, indent: true },
      { href: "/cadencias",       label: "Cadências SDR",   icon: Mail },
      { href: "/central-ia",      label: "Central de IA",   icon: Brain },
      { href: "/radar",           label: "Radar de Mercado",icon: Radar },
      { href: "/ajuda",           label: "Ajuda",           icon: HelpCircle },
    ],
  },
  {
    label: "Vendas",
    items: [
      { href: "/empresas",        label: "Empresas",        icon: Building2 },
      { href: "/contatos",        label: "Contatos",        icon: Users },
      { href: "/oportunidades",   label: "Oportunidades",   icon: Target },
      { href: "/pipeline",        label: "Pipeline",        icon: BarChart3 },
      { href: "/simulador",       label: "Simulador",       icon: Calculator },
      { href: "/atividades",      label: "Atividades",      icon: CheckSquare },
    ],
  },
  {
    label: "Clientes",
    items: [
      { href: "/termometro",      label: "Termômetro",      icon: Thermometer },
      { href: "/usuarios",        label: "Usuários",        icon: Users },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <aside
      className={cn(
        "fixed top-3 left-3 bottom-3 w-[220px] z-50",
        "bg-white rounded-2xl flex flex-col overflow-hidden",
        "shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_8px_32px_rgba(0,0,0,0.1)]",
      )}
    >
      {/* Brand */}
      <div className="px-4 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-[#0057FF] flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
            K
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-[#1C1C1E] leading-tight truncate">Krylo CRM</p>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-[#EEF3FF] text-[#0057FF] text-[9px] font-semibold uppercase tracking-wide leading-none mt-0.5">
              Starter
            </span>
          </div>
        </div>
      </div>

      {/* Search hint */}
      <div className="px-3 pb-3">
        <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-[#F2F2F7] cursor-pointer hover:bg-[#E8E8ED] transition-colors">
          <svg className="h-3.5 w-3.5 text-[#8E8E93] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <span className="text-[12px] text-[#8E8E93] flex-1">Buscar…</span>
          <kbd className="text-[9px] text-[#C7C7CC] bg-white border border-[rgba(0,0,0,0.08)] rounded px-1 py-0.5 font-mono">⌘K</kbd>
        </div>
      </div>

      <div className="w-full h-px bg-[rgba(0,0,0,0.05)] mb-1" />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
        {navSections.map((section, si) => (
          <div key={si} className={si > 0 ? "pt-3" : ""}>
            {section.label && (
              <p className="px-2.5 pb-1 text-[10px] font-semibold text-[#C7C7CC] uppercase tracking-widest">
                {section.label}
              </p>
            )}
            {section.items.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-[7px] rounded-xl text-[13px] font-medium transition-all duration-150",
                    item.indent ? "ml-3" : "",
                    active
                      ? "bg-[#EEF3FF] text-[#0057FF]"
                      : "text-[#3A3A3C] hover:bg-[#F2F2F7] hover:text-[#1C1C1E]"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-[15px] w-[15px] flex-shrink-0 transition-colors",
                      active ? "text-[#0057FF]" : "text-[#8E8E93]"
                    )}
                  />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge ? (
                    <span className="h-4 min-w-4 px-1 rounded-full bg-[#0057FF] text-white text-[9px] font-bold flex items-center justify-center">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="w-full h-px bg-[rgba(0,0,0,0.05)] mt-1" />

      {/* User */}
      {user && (
        <div className="px-3 py-3">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-[#F2F2F7] transition-colors group cursor-default">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#0057FF] to-[#5B9BFF] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user.nome?.[0]?.toUpperCase() ?? "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-[#1C1C1E] truncate leading-tight">{user.nome}</p>
              <p className="text-[10px] text-[#8E8E93] truncate capitalize">{user.perfil}</p>
            </div>
            <button
              onClick={logout}
              title="Sair"
              className="opacity-0 group-hover:opacity-100 transition-opacity text-[#8E8E93] hover:text-[#FF3B30]"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
