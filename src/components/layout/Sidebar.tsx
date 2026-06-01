"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, Bot, Phone, Mail, Brain,
  HelpCircle, Radar, Building2, Users, Target,
  BarChart3, Calculator, CheckSquare, Thermometer,
  LogOut, Search, Sparkles, Upload, Goal, Settings, UserCircle,
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
      { href: "/leads/importar",  label: "Importar Leads",  icon: Upload },
      { href: "/cadencias",       label: "Cadências SDR",   icon: Mail },
      { href: "/central-ia",      label: "Central de IA",   icon: Brain },
      { href: "/radar",           label: "Radar de Mercado",icon: Radar },
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
    <aside
      className="fixed top-3 left-3 bottom-3 w-[232px] z-50 rounded-2xl flex flex-col overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #FFFFFF 0%, #FAFBFF 100%)",
        boxShadow: "0 0 0 1px rgba(15,23,42,0.06), 0 10px 40px rgba(79,70,229,0.08), 0 4px 12px rgba(15,23,42,0.04)",
      }}
    >
      {/* Brand */}
      <div className="px-4 pt-5 pb-4 relative">
        <div className="absolute inset-x-0 top-0 h-24 opacity-60 pointer-events-none"
             style={{ background: "radial-gradient(circle at 50% 0%, rgba(79,70,229,0.12), transparent 70%)" }} />
        <div className="relative flex items-center gap-2.5">
          <div
            className="h-9 w-9 rounded-xl flex items-center justify-center text-white font-bold text-[14px] flex-shrink-0"
            style={{
              background: "linear-gradient(135deg,#4F46E5 0%,#7C3AED 100%)",
              boxShadow: "0 4px 12px rgba(79,70,229,0.35), 0 0 0 1px rgba(255,255,255,0.6) inset",
            }}
          >
            K
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-bold text-[#0F172A] leading-tight tracking-[-0.2px]">Krylo</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Sparkles className="h-2.5 w-2.5 text-[#4F46E5]" />
              <span className="text-[9px] font-semibold uppercase tracking-wider text-[#4F46E5]">Starter</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 pb-3">
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] transition-colors group">
          <Search className="h-3.5 w-3.5 text-[#64748B] flex-shrink-0" />
          <span className="text-[12px] text-[#64748B] flex-1 text-left">Buscar…</span>
          <kbd className="text-[9px] text-[#94A3B8] bg-white border border-[#E2E8F0] rounded px-1 py-0.5 font-mono">⌘K</kbd>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
        {navSections.map((section, si) => (
          <div key={si} className={si > 0 ? "pt-4" : ""}>
            {section.label && (
              <p className="px-2.5 pb-1.5 text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.08em]">
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
                    "relative flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-150",
                    item.indent ? "ml-3" : "",
                    active
                      ? "text-[#4F46E5]"
                      : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
                  )}
                  style={active ? {
                    background: "linear-gradient(135deg, rgba(79,70,229,0.12) 0%, rgba(124,58,237,0.08) 100%)",
                    boxShadow: "0 0 0 1px rgba(79,70,229,0.1)",
                  } : undefined}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r-full"
                          style={{ background: "linear-gradient(180deg,#4F46E5,#7C3AED)" }} />
                  )}
                  <Icon className={cn("h-[15px] w-[15px] flex-shrink-0 transition-colors",
                    active ? "text-[#4F46E5]" : "text-[#64748B]")} />
                  <span className="flex-1 truncate">{item.label}</span>
                  {badge && badge > 0 ? (
                    <span className="h-4 min-w-4 px-1 rounded-full bg-[#EF4444] text-white text-[9px] font-bold flex items-center justify-center"
                          style={{ boxShadow: "0 2px 6px rgba(239,68,68,0.4)" }}>
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
        <div className="px-3 py-3 border-t border-[rgba(15,23,42,0.05)] bg-gradient-to-b from-transparent to-[rgba(79,70,229,0.03)]">
          <div className="flex items-center gap-1.5">
            <Link href="/conta"
              className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-white transition-colors flex-1 min-w-0">
              <div
                className="h-8 w-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg,#4F46E5,#A855F7)",
                  boxShadow: "0 2px 8px rgba(79,70,229,0.3)",
                }}
              >
                {user.nome?.[0]?.toUpperCase() ?? "A"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-[#0F172A] truncate leading-tight">{user.nome}</p>
                <p className="text-[10px] text-[#64748B] truncate capitalize">{user.perfil}</p>
              </div>
            </Link>
            <button
              onClick={logout}
              title="Sair"
              className="text-[#64748B] hover:text-[#EF4444] p-1.5 rounded-lg hover:bg-[#FEF2F2] flex-shrink-0"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
