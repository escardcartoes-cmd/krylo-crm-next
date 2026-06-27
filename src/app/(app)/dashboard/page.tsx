"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Topbar } from "@/components/layout/Topbar";
import { ButtonLink } from "@/components/ui/button-link";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

function fmt(v: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency", currency: "BRL", maximumFractionDigits: 0,
  }).format(v);
}
function n(v: number) {
  return new Intl.NumberFormat("pt-BR").format(v);
}

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="surface-card rounded-xl p-5">
      <p className="text-[12px] font-medium text-[#64748B]">{label}</p>
      <p className="text-[26px] font-semibold text-[#0F172A] tracking-[-0.5px] mt-1 leading-none">{value}</p>
      {sub && <p className="text-[12px] text-[#94A3B8] mt-1.5">{sub}</p>}
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

  const firstName = user?.nome?.split(" ")[0] ?? "";

  return (
    <>
      <Topbar
        title={firstName ? `Bom dia, ${firstName}` : "Dashboard"}
        subtitle={data?.mes_atual ? `Resumo de ${data.mes_atual}` : ""}
        actions={
          <>
            <ButtonLink href="/empresas/nova" variant="outline" size="sm">Nova empresa</ButtonLink>
            <ButtonLink href="/oportunidades/nova" size="sm">Nova oportunidade</ButtonLink>
          </>
        }
      />

      <div className="flex-1 px-8 pt-4 pb-8 space-y-6">

        {/* Meta — minimal, informative */}
        <div className="surface-card rounded-xl p-5">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-[#64748B]">{data?.meta_nome ?? "Meta"}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-[28px] font-semibold text-[#0F172A] tracking-[-0.5px] leading-none">
                  {isLoading ? "—" : fmt(data?.faturado_90d ?? 0)}
                </span>
                <span className="text-[14px] text-[#94A3B8]">de {fmt(data?.meta_valor ?? 100000)}</span>
              </div>
              <p className="text-[12px] text-[#64748B] mt-2">
                {fmt((data?.meta_valor ?? 100000) / 90)}/dia para fechar a meta
              </p>
            </div>
            <div className="text-right">
              <p className="text-[32px] font-semibold text-[#0F172A] tracking-[-0.5px] leading-none">{pct}<span className="text-[18px] text-[#94A3B8]">%</span></p>
              <p className="text-[12px] text-[#64748B] mt-1">90 dias</p>
            </div>
          </div>
          <div className="mt-4 h-1 bg-[#F1F5F9] rounded-full overflow-hidden">
            <div className="h-full bg-[#4F46E5] rounded-full" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Cartões */}
        <section>
          <h2 className="text-[13px] font-semibold text-[#0F172A] mb-3">Programas de cartão</h2>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            <Stat label="Clientes ativos" value={dash(data?.clientes_ativos)} sub="com cartão" />
            <Stat label="Cartões emitidos" value={dash(data?.cartoes_emitidos, n)} sub="implantações fechadas" />
            <Stat label="MRR" value={dash(data?.mrr, fmt)} sub="receita recorrente" />
            <Stat label="Cartões no pipeline" value={dash(data?.cartoes_pipeline, n)} sub="em negociação" />
          </div>
        </section>

        {/* Prospecção */}
        <section>
          <h2 className="text-[13px] font-semibold text-[#0F172A] mb-3">Prospecção e vendas</h2>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            <Stat label="Prospects no SDR" value={dash(data?.prospects_sdr)} sub="aguardando contato" />
            <Stat label="Em cadência" value={dash(data?.em_cadencia)} sub="follow-ups ativos" />
            <Stat label="Pipeline" value={dash(data?.pipeline_total, fmt)} sub={`${data?.oportunidades_ativas ?? 0} oportunidades`} />
            <Stat label="Fechados no mês" value={dash(data?.fechados_mes)} sub={`${fmt(data?.receita_mes ?? 0)} de receita`} />
          </div>
        </section>

        {/* Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Cadências hoje */}
          <div className="surface-card rounded-xl">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#F1F5F9]">
              <h3 className="text-[13px] font-semibold text-[#0F172A]">Cadências de hoje</h3>
              <Link href="/cadencias" className="text-[12px] text-[#4F46E5] hover:underline">Ver todas</Link>
            </div>
            <div>
              {!isLoading && data?.cadencias_hoje?.length ? (
                <ul className="divide-y divide-[#F1F5F9]">
                  {data.cadencias_hoje.map((c: any) => (
                    <li key={c.id} className="flex items-center justify-between px-5 py-3 hover:bg-[#F8FAFC]">
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-[#0F172A] truncate">{c.empresa_nome}</p>
                        <p className="text-[11px] text-[#64748B] mt-0.5">Etapa {c.etapa}</p>
                      </div>
                      <span className="text-[11px] text-[#64748B] tabular-nums">{c.data_acao}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[13px] text-[#94A3B8] text-center py-10">
                  Nenhuma cadência para hoje
                </p>
              )}
            </div>
          </div>

          {/* Implantações paradas */}
          <div className="surface-card rounded-xl">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#F1F5F9]">
              <h3 className="text-[13px] font-semibold text-[#0F172A]">Implantações paradas</h3>
              <Link href="/pipeline" className="text-[12px] text-[#4F46E5] hover:underline">Pipeline</Link>
            </div>
            <div>
              {!isLoading && data?.oportunidades_paradas?.length ? (
                <ul className="divide-y divide-[#F1F5F9]">
                  {data.oportunidades_paradas.map((o: any) => (
                    <li key={o.id}>
                      <Link href={`/oportunidades/${o.id}`}
                            className="flex items-center justify-between px-5 py-3 hover:bg-[#F8FAFC] group">
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-[#0F172A] truncate group-hover:text-[#4F46E5]">{o.titulo}</p>
                          <p className="text-[11px] text-[#64748B] mt-0.5 truncate">{o.empresa_nome}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-3">
                          <span className="text-[13px] font-medium text-[#0F172A] tabular-nums">{fmt(o.valor_estimado)}</span>
                          <ChevronRight className="h-3.5 w-3.5 text-[#CBD5E1]" />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[13px] text-[#94A3B8] text-center py-10">
                  Nenhuma oportunidade parada
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
