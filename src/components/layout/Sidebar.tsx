"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/brand/Logo";
import {
  LayoutDashboard, Bot, Phone, Mail, Brain,
  HelpCircle, Radar, Building2, Users, Target,
  BarChart3, Calculator, CheckSquare, Thermometer,
  LogOut, Search, Upload, Goal, Settings, UserCircle,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  indent?: boolean;
  badge?: number;
}

const navSections: { label: string | null; items: NavItem[] }[] = [
  { label: null, items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }] },
  {
    label: "Prospecção",
    items: [
      { href: "/sdr-evolutivo",   label: "SDR Evolutivo",   icon: Bot },
      { href: "/fila-whatsapp",   label: "Fila WhatsApp",   icon: Phone, indent: true },
      { href: "/leads/importar",  label: "Importar leads",  icon: Upload },
      { href: "/cadencias",       label: "Cadências",       icon: Mail },
      { href: "/central-ia",      label: "Central de IA",   icon: Brain },
      { href: "/radar",           label: "Radar de mercado",icon: Radar },
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
      { href: "/metas",           label: "Metas",           icon: Goal },
    ],
  },
  {
    label: "Configurações",
    items: [
      { href: "/usuarios",        label: "Usuários",        icon: Users },
      { href: "/configuracoes",   label: "Empresa",         icon: Settings },
      { href: "/conta",           label: "Minha conta",     icon: UserCircle },
      { href: "/ajuda",           label: "Ajuda",           icon: HelpCircle },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const { data: counts } = useQuery({
    queryKey: ["sidebar-counts"],
    queryFn: () => api.get("/api/sidebar/counts").then(r => r.data),
    refetchInterval: 30_000,
    enabled: !!user,
  });

  function badgeFor(href: string): number | undefined {
    if (href === "/fila-whatsapp") return counts?.fila_whatsapp;
    if (href === "/cadencias")     return counts?.cadencias_hoje;
    if (href === "/atividades")    return counts?.atividades_pendentes;
    return undefined;
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <aside className="fixed top-0 left-0 bottom-0 w-[240px] z-50 bg-white border-r border-[#E2E8F0] flex flex-col">
      {/* Brand */}
      <Link href="/dashboard" className="px-4 py-4 border-b border-[#F1F5F9] flex items-center gap-2.5 hover:bg-[#F8FAFC] transition-colors">
        <Logo variant="mark" size={28} />
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-[#0F172A] leading-none tracking-[-0.2px]">Krylo</p>
          <p className="text-[10px] text-[#94A3B8] mt-1 uppercase tracking-wider font-medium">Starter</p>
        </div>
      </Link>

      {/* Search */}
      <div className="px-3 py-2.5">
        <button className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-[#F1F5F9] hover:bg-[#E2E8F0] transition-colors">
          <Search className="h-3.5 w-3.5 text-[#94A3B8] flex-shrink-0" />
          <span className="text-[12px] text-[#64748B] flex-1 text-left">Buscar…</span>
          <kbd className="text-[10px] text-[#94A3B8] bg-white border border-[#E2E8F0] rounded px-1 font-mono">⌘K</kbd>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 pb-2">
        {navSections.map((section, si) => (
          <div key={si} className={si > 0 ? "pt-4" : "pt-1"}>
            {section.label && (
              <p className="px-2.5 pb-1 text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider">
                {section.label}
              </p>
            )}
            {section.items.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              const badge = item.badge ?? badgeFor(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] transition-colors",
                    item.indent ? "ml-3" : "",
                    active
                      ? "bg-[#EEF2FF] text-[#4F46E5] font-medium"
                      : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
                  )}
                >
                  <Icon className={cn("h-[15px] w-[15px] flex-shrink-0",
                    active ? "text-[#4F46E5]" : "text-[#64748B]")} />
                  <span className="flex-1 truncate">{item.label}</span>
                  {badge && badge > 0 ? (
                    <span className="h-4 min-w-4 px-1 rounded bg-[#DC2626] text-white text-[10px] font-semibold flex items-center justify-center tabular-nums">
                      {badge > 99 ? "99+" : badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User */}
      {user && (
        <div className="px-3 py-3 border-t border-[#F1F5F9]">
          <div className="flex items-center gap-2">
            <Link href="/conta" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-[#F1F5F9] transition-colors flex-1 min-w-0">
              <div className="h-7 w-7 rounded-full bg-[#4F46E5] flex items-center justify-center text-white text-[12px] font-medium flex-shrink-0">
                {user.nome?.[0]?.toUpperCase() ?? "A"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-[#0F172A] truncate leading-tight">{user.nome}</p>
                <p className="text-[10px] text-[#94A3B8] truncate capitalize">{user.perfil}</p>
              </div>
            </Link>
            <button onClick={logout} title="Sair"
              className="text-[#94A3B8] hover:text-[#DC2626] p-1.5 rounded hover:bg-[#FEF2F2] flex-shrink-0">
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
