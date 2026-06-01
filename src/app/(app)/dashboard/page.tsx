"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Topbar } from "@/components/layout/Topbar";
import { ButtonLink } from "@/components/ui/button-link";
import Link from "next/link";
import {
  CreditCard, Users, DollarSign, TrendingUp, Target,
  Zap, Clock, ArrowUpRight, Activity, Sparkles,
} from "lucide-react";

function fmt(v: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency", currency: "BRL", maximumFractionDigits: 0,
  }).format(v);
}
function n(v: number) {
  return new Intl.NumberFormat("pt-BR").format(v);
}

interface StatProps {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
  tint: string;
  iconColor: string;
  trend?: { value: number; positive: boolean };
}

function Stat({ label, value, sub, icon: Icon, tint, iconColor, trend }: StatProps) {
  return (
    <div className="surface-card rounded-2xl p-5 relative overflow-hidden group">
      <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-60 blur-2xl ${tint}`} />
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${tint}`}>
            <Icon className={`h-[18px] w-[18px] ${iconColor}`} />
          </div>
          {trend && (
            <div className={`flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-lg ${trend.positive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
              <ArrowUpRight className={`h-3 w-3 ${!trend.positive ? "rotate-90" : ""}`} />
              {trend.value}%
            </div>
          )}
        </div>
        <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-[0.06em]">{label}</p>
        <p className="text-[28px] font-extrabold text-[#0F172A] tracking-[-0.8px] mt-0.5 leading-none">{value}</p>
        <p className="text-[12px] text-[#64748B] mt-1.5">{sub}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.get("/api/dashboard").then((r) => r.data),
  });

  const pct = data
    ? Math.min(100, Math.round(((data.faturado_90d || 0) / (data.meta_valor || 100000)) * 100))
    : 0;

  const dash = (v: any, fmt_fn?: (n: number) => string) =>
    isLoading ? "—" : fmt_fn ? fmt_fn(v ?? 0) : (v ?? 0);

  return (
    <>
      <Topbar
        title={`Olá${user?.nome ? `, ${user.nome.split(" ")[0]}` : ""} 👋`}
        subtitle="Visão geral do seu negócio de cartões private label e benefícios"
        actions={
          <>
            <ButtonLink href="/empresas/nova" variant="outline" size="sm">+ Empresa</ButtonLink>
            <ButtonLink href="/oportunidades/nova" size="sm">+ Oportunidade</ButtonLink>
          </>
        }
      />

      <div className="flex-1 px-8 pt-4 pb-8 space-y-5">

        {/* Hero meta card */}
        <div
          className="rounded-2xl p-7 text-white relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg,#4F46E5 0%,#7C3AED 50%,#A855F7 100%)",
            boxShadow: "0 10px 40px rgba(79,70,229,0.3), 0 4px 12px rgba(124,58,237,0.2)",
          }}
        >
          {/* Decorative orbs */}
          <div className="absolute -right-12 -top-12 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute right-32 top-4 h-32 w-32 rounded-full bg-white/10 blur-xl" />
          <div className="absolute -left-8 -bottom-8 h-40 w-40 rounded-full bg-pink-400/20 blur-3xl" />

          {/* Pattern dots */}
          <div className="absolute inset-0 opacity-[0.06]" style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }} />

          <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-center">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-7 w-7 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Target className="h-3.5 w-3.5" />
                </div>
                <p className="text-[11px] font-bold text-white/80 uppercase tracking-[0.12em]">
                  {data?.meta_nome ?? "Meta principal"}
                </p>
              </div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-[40px] font-black tracking-[-1.5px] leading-none">
                  {isLoading ? "—" : fmt(data?.faturado_90d ?? 0)}
                </span>
                <span className="text-[15px] text-white/60 font-medium">/ {fmt(data?.meta_valor ?? 100000)}</span>
              </div>
              <p className="text-[12px] text-white/70 mt-2 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5" />
                Ritmo necessário: <span className="font-bold text-white">{fmt((data?.meta_valor ?? 100000) / 90)}/dia</span>
              </p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center justify-center h-32 w-32 rounded-full relative">
                <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-sm" />
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
                  <circle cx="50" cy="50" r="44" fill="none" stroke="white" strokeWidth="6"
                    strokeDasharray={`${pct * 2.764} ${(100 - pct) * 2.764}`}
                    strokeLinecap="round" />
                </svg>
                <div className="relative text-center">
                  <div className="text-[32px] font-black tracking-[-1px] leading-none">{pct}%</div>
                  <div className="text-[9px] text-white/70 font-semibold uppercase tracking-wider mt-1">90 dias</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cartões */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="h-4 w-4 text-[#4F46E5]" />
            <p className="text-[12px] font-bold text-[#475569] uppercase tracking-[0.08em]">Programas de Cartão</p>
            <div className="flex-1 h-px bg-gradient-to-r from-[#E2E8F0] to-transparent" />
          </div>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            <Stat label="Clientes ativos" icon={CreditCard}
              value={dash(data?.clientes_ativos)} sub="programas ativos"
              tint="tint-blue" iconColor="text-[#4F46E5]" />
            <Stat label="Cartões emitidos" icon={Sparkles}
              value={dash(data?.cartoes_emitidos, n)} sub="implantações fechadas"
              tint="tint-emerald" iconColor="text-emerald-600" />
            <Stat label="MRR" icon={DollarSign}
              value={dash(data?.mrr, fmt)} sub="receita recorrente"
              tint="tint-violet" iconColor="text-violet-600" />
            <Stat label="Cartões no pipeline" icon={Target}
              value={dash(data?.cartoes_pipeline, n)} sub="em negociação"
              tint="tint-amber" iconColor="text-amber-600" />
          </div>
        </div>

        {/* Prospecção */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Activity className="h-4 w-4 text-[#4F46E5]" />
            <p className="text-[12px] font-bold text-[#475569] uppercase tracking-[0.08em]">Prospecção e Vendas</p>
            <div className="flex-1 h-px bg-gradient-to-r from-[#E2E8F0] to-transparent" />
          </div>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            <Stat label="Prospects SDR" icon={Users}
              value={dash(data?.prospects_sdr)} sub="aguardando contato"
              tint="tint-sky" iconColor="text-sky-600" />
            <Stat label="Em cadência" icon={TrendingUp}
              value={dash(data?.em_cadencia)} sub="follow-ups ativos"
              tint="tint-emerald" iconColor="text-emerald-600" />
            <Stat label="Pipeline" icon={DollarSign}
              value={dash(data?.pipeline_total, fmt)} sub={`${data?.oportunidades_ativas ?? 0} oportunidades`}
              tint="tint-violet" iconColor="text-violet-600" />
            <Stat label="Fechados no mês" icon={Target}
              value={dash(data?.fechados_mes)} sub={fmt(data?.receita_mes ?? 0) + " em receita"}
              tint="tint-rose" iconColor="text-rose-600" />
          </div>
        </div>

        {/* Bottom — two-column rich panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Cadências */}
          <div className="surface-card rounded-2xl overflow-hidden">
            <div className="px-5 pt-5 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg tint-amber flex items-center justify-center">
                  <Zap className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-[#0F172A]">Cadências para hoje</p>
                  <p className="text-[11px] text-[#64748B]">Follow-ups pendentes</p>
                </div>
              </div>
              <ButtonLink href="/cadencias" variant="ghost" size="xs">Ver todas →</ButtonLink>
            </div>
            <div className="px-5 pb-5">
              {!isLoading && data?.cadencias_hoje?.length ? (
                <div className="space-y-1">
                  {data.cadencias_hoje.map((c: any) => (
                    <div key={c.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F8FAFC] transition-colors group">
                      <div className="flex items-center gap-2.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        <div>
                          <p className="text-[13px] font-semibold text-[#0F172A]">{c.empresa_nome}</p>
                          <p className="text-[11px] text-[#64748B] mt-0.5">Etapa {c.etapa}</p>
                        </div>
                      </div>
                      <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg font-semibold">{c.data_acao}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="h-14 w-14 rounded-2xl tint-emerald flex items-center justify-center mb-3">
                    <Sparkles className="h-6 w-6 text-emerald-600" />
                  </div>
                  <p className="text-[14px] font-bold text-[#0F172A]">Tudo em dia! 🎉</p>
                  <p className="text-[12px] text-[#64748B] mt-1">Nenhuma cadência pendente para hoje.</p>
                </div>
              )}
            </div>
          </div>

          {/* Oportunidades paradas */}
          <div className="surface-card rounded-2xl overflow-hidden">
            <div className="px-5 pt-5 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg tint-rose flex items-center justify-center">
                  <Clock className="h-4 w-4 text-rose-600" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-[#0F172A]">Implantações paradas</p>
                  <p className="text-[11px] text-[#64748B]">Sem contato há +7 dias</p>
                </div>
              </div>
              <ButtonLink href="/pipeline" variant="ghost" size="xs">Pipeline →</ButtonLink>
            </div>
            <div className="px-5 pb-5">
              {!isLoading && data?.oportunidades_paradas?.length ? (
                <div className="space-y-1">
                  {data.oportunidades_paradas.map((o: any) => (
                    <Link key={o.id} href={`/oportunidades/${o.id}`}
                          className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F8FAFC] transition-colors group">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-1.5 w-1.5 rounded-full bg-rose-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-[#0F172A] truncate group-hover:text-[#4F46E5]">{o.titulo}</p>
                          <p className="text-[11px] text-[#64748B] mt-0.5 truncate">{o.empresa_nome}</p>
                        </div>
                      </div>
                      <span className="text-[13px] font-bold text-[#0F172A] ml-3 flex-shrink-0">{fmt(o.valor_estimado)}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="h-14 w-14 rounded-2xl tint-blue flex items-center justify-center mb-3">
                    <TrendingUp className="h-6 w-6 text-[#4F46E5]" />
                  </div>
                  <p className="text-[14px] font-bold text-[#0F172A]">Pipeline fluindo! 🚀</p>
                  <p className="text-[12px] text-[#64748B] mt-1">Todas as oportunidades têm contato recente.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
