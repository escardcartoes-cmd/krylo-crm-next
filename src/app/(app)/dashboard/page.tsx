"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Topbar } from "@/components/layout/Topbar";
import { ButtonLink } from "@/components/ui/button-link";
import { CreditCard, Users, DollarSign, TrendingUp, Target, Zap, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

function fmt(v: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency", currency: "BRL", maximumFractionDigits: 0,
  }).format(v);
}

function n(v: number) {
  return new Intl.NumberFormat("pt-BR").format(v);
}

function StatCard({
  label, value, sub, icon: Icon, bg, iconBg, color,
}: {
  label: string; value: string | number; sub: string;
  icon: React.ComponentType<{ className?: string }>; bg: string; iconBg: string; color: string;
}) {
  return (
    <div className={`rounded-2xl p-5 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_4px_16px_rgba(0,0,0,0.08)] transition-shadow ${bg}`}>
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider truncate opacity-70" style={{ color: "inherit" }}>{label}</p>
          <p className="text-[26px] font-bold tracking-[-0.5px] mt-1 leading-none">{value}</p>
          <p className="text-[12px] mt-1.5 opacity-60">{sub}</p>
        </div>
        <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
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
        subtitle="Visão geral do seu negócio de cartões"
        actions={
          <>
            <ButtonLink href="/empresas/nova" variant="outline" size="sm">+ Empresa</ButtonLink>
            <ButtonLink href="/oportunidades/nova" size="sm">+ Oportunidade</ButtonLink>
          </>
        }
      />

      <div className="flex-1 px-7 pt-5 pb-7 space-y-5">

        {/* Meta card */}
        <div
          className="rounded-2xl p-5 text-white relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg,#0057FF 0%,#338BFF 60%,#66AAFF 100%)",
            boxShadow: "0 4px 24px rgba(0,87,255,0.25)",
          }}
        >
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
          <div className="absolute -right-2 top-8 h-20 w-20 rounded-full bg-white/10" />
          <div className="absolute left-1/2 -bottom-6 h-24 w-24 rounded-full bg-white/5" />
          <div className="relative flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-[11px] font-semibold text-white/60 uppercase tracking-wider mb-1.5">
                🎯 {data?.meta_nome ?? "Meta principal"}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-[28px] font-bold tracking-[-0.5px]">
                  {isLoading ? "—" : fmt(data?.faturado_90d ?? 0)}
                </span>
                <span className="text-sm text-white/60">/ {fmt(data?.meta_valor ?? 100000)}</span>
              </div>
              <p className="text-[12px] text-white/60 mt-1">
                Ritmo: <span className="text-white font-semibold">{fmt((data?.meta_valor ?? 100000) / 90)}/dia</span>
              </p>
            </div>
            <div className="text-right">
              <div className="text-[44px] font-black tracking-[-1px] leading-none">{pct}%</div>
              <p className="text-[11px] text-white/60 mt-1">90 dias restantes</p>
            </div>
          </div>
          <div className="relative mt-4 h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* KPIs — linha 1: cartões */}
        <div>
          <p className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-3">Cartões</p>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            <StatCard
              label="Clientes com cartão" icon={CreditCard}
              value={dash(data?.clientes_ativos)}
              sub="programas ativos"
              bg="bg-gradient-to-br from-[#EEF3FF] to-[#D6E4FF] text-[#0057FF]"
              iconBg="bg-white/70" color="text-[#0057FF]"
            />
            <StatCard
              label="Cartões emitidos" icon={CreditCard}
              value={dash(data?.cartoes_emitidos, n)}
              sub="implantações fechadas"
              bg="bg-gradient-to-br from-[#E8F9F0] to-[#C8F0DA] text-[#1A7F4B]"
              iconBg="bg-white/70" color="text-[#34C759]"
            />
            <StatCard
              label="MRR (receita mensal)" icon={DollarSign}
              value={dash(data?.mrr, fmt)}
              sub="de clientes ativos"
              bg="bg-gradient-to-br from-[#F5EEFF] to-[#E8D5FF] text-[#AF52DE]"
              iconBg="bg-white/70" color="text-[#AF52DE]"
            />
            <StatCard
              label="Cartões no pipeline" icon={Target}
              value={dash(data?.cartoes_pipeline, n)}
              sub="em negociação"
              bg="bg-gradient-to-br from-[#FFF5E8] to-[#FFE5B8] text-[#B07D00]"
              iconBg="bg-white/70" color="text-[#FF9500]"
            />
          </div>
        </div>

        {/* KPIs — linha 2: prospecção */}
        <div>
          <p className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-3">Prospecção</p>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            <StatCard
              label="Prospects SDR" icon={Users}
              value={dash(data?.prospects_sdr)}
              sub="aguardando prospecção"
              bg="bg-white text-[#1C1C1E]"
              iconBg="bg-[#EEF3FF]" color="text-[#0057FF]"
            />
            <StatCard
              label="Em cadência" icon={TrendingUp}
              value={dash(data?.em_cadencia)}
              sub="follow-ups ativos"
              bg="bg-white text-[#1C1C1E]"
              iconBg="bg-[#E8F9F0]" color="text-[#34C759]"
            />
            <StatCard
              label="Pipeline (R$)" icon={DollarSign}
              value={dash(data?.pipeline_total, fmt)}
              sub={`${data?.oportunidades_ativas ?? 0} oportunidades`}
              bg="bg-white text-[#1C1C1E]"
              iconBg="bg-[#F5EEFF]" color="text-[#AF52DE]"
            />
            <StatCard
              label="Fechados no mês" icon={Target}
              value={dash(data?.fechados_mes)}
              sub={fmt(data?.receita_mes ?? 0) + " em receita"}
              bg="bg-white text-[#1C1C1E]"
              iconBg="bg-[#E5FFFE]" color="text-[#00C7BE]"
            />
          </div>
        </div>

        {/* Bottom grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Cadências */}
          <div className="bg-white rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-[#FFF5E8] flex items-center justify-center">
                  <Zap className="h-3.5 w-3.5 text-[#FF9500]" />
                </div>
                <p className="text-[13px] font-bold text-[#1C1C1E]">Cadências para hoje</p>
              </div>
              <ButtonLink href="/cadencias" variant="ghost" size="xs" className="text-[#0057FF]">Ver todas →</ButtonLink>
            </div>
            <div className="px-5 pb-5 pt-3">
              {!isLoading && data?.cadencias_hoje?.length ? (
                <div className="space-y-1">
                  {data.cadencias_hoje.map((c: any) => (
                    <div key={c.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-[#F9F9FB] transition-colors group">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#FF9500] flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-[#1C1C1E] truncate">{c.empresa_nome}</p>
                          <p className="text-[11px] text-[#8E8E93] mt-0.5">Etapa {c.etapa}</p>
                        </div>
                      </div>
                      <span className="text-[11px] text-[#8E8E93] bg-[#F2F2F7] px-2 py-0.5 rounded-lg flex-shrink-0 ml-2">{c.data_acao}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="text-3xl mb-2">🎉</div>
                  <p className="text-[13px] font-semibold text-[#1C1C1E]">Tudo em dia!</p>
                  <p className="text-[12px] text-[#8E8E93] mt-1">Nenhuma cadência pendente hoje.</p>
                </div>
              )}
            </div>
          </div>

          {/* Oportunidades paradas */}
          <div className="bg-white rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-[#FFF1F0] flex items-center justify-center">
                  <Clock className="h-3.5 w-3.5 text-[#FF3B30]" />
                </div>
                <p className="text-[13px] font-bold text-[#1C1C1E]">Implantações paradas</p>
              </div>
              <ButtonLink href="/pipeline" variant="ghost" size="xs" className="text-[#0057FF]">Pipeline →</ButtonLink>
            </div>
            <div className="px-5 pb-5 pt-3">
              {!isLoading && data?.oportunidades_paradas?.length ? (
                <div className="space-y-1">
                  {data.oportunidades_paradas.map((o: any) => (
                    <Link
                      key={o.id}
                      href={`/oportunidades/${o.id}`}
                      className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-[#FFF1F0] transition-colors group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#FF3B30] flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-[#1C1C1E] truncate group-hover:text-[#FF3B30] transition-colors">{o.titulo}</p>
                          <p className="text-[11px] text-[#8E8E93] mt-0.5 truncate">{o.empresa_nome}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <span className="text-[13px] font-bold text-[#1C1C1E]">{fmt(o.valor_estimado)}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-[#C7C7CC] group-hover:text-[#FF3B30] transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="text-3xl mb-2">🚀</div>
                  <p className="text-[13px] font-semibold text-[#1C1C1E]">Pipeline fluindo!</p>
                  <p className="text-[12px] text-[#8E8E93] mt-1">Todas as oportunidades têm contato recente.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
