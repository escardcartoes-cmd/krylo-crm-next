"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Topbar } from "@/components/layout/Topbar";
import { ButtonLink } from "@/components/ui/button-link";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, CreditCard } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

function fmt(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);
}

function fmtK(v: number) {
  if (v >= 1000) return `R$ ${(v / 1000).toFixed(0)}K`;
  return fmt(v);
}

const ETAPAS = [
  { key: "prospect",   label: "Prospect",    tint: "bg-[#F1F5F9]",    text: "text-[#64748B]", accent: "#94A3B8" },
  { key: "contato",    label: "Contato",     tint: "tint-blue",       text: "text-[#4F46E5]", accent: "#4F46E5" },
  { key: "proposta",   label: "Proposta",    tint: "tint-amber",      text: "text-amber-700", accent: "#F59E0B" },
  { key: "negociacao", label: "Negociação",  tint: "bg-orange-50",    text: "text-orange-700",accent: "#F97316" },
  { key: "fechado",    label: "Implantação", tint: "tint-emerald",    text: "text-emerald-700",accent: "#10B981" },
];

export default function PipelinePage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["pipeline"],
    queryFn: () => api.get("/api/pipeline").then((r) => r.data),
  });

  const moveMutation = useMutation({
    mutationFn: ({ id, etapa }: { id: number; etapa: string }) =>
      api.put(`/api/oportunidades/${id}`, { etapa }).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pipeline"] }); toast.success("Movido!"); },
    onError: () => toast.error("Erro ao mover"),
  });

  const totalPipeline = ETAPAS.filter(e => e.key !== "fechado").reduce((acc, e) => {
    return acc + (data?.[e.key] ?? []).reduce((s: number, o: any) => s + (o.valor_estimado || 0), 0);
  }, 0);

  const totalCartoes = ETAPAS.reduce((acc, e) => {
    return acc + (data?.[e.key] ?? []).reduce((s: number, o: any) => s + (o.num_cartoes || 0), 0);
  }, 0);

  return (
    <>
      <Topbar
        title="Pipeline"
        subtitle={isLoading ? "Pipeline de vendas" : `${fmt(totalPipeline)} em negociação`}
        actions={<ButtonLink href="/oportunidades/nova" size="sm">+ Oportunidade</ButtonLink>}
      />
      <div className="flex-1 px-8 pt-4 pb-8 space-y-5">

        {/* Summary bar */}
        {!isLoading && data && (
          <div className="flex items-center gap-2 flex-wrap">
            {ETAPAS.map(etapa => {
              const cards: any[] = data?.[etapa.key] ?? [];
              const total = cards.reduce((s: number, o: any) => s + (o.valor_estimado || 0), 0);
              if (cards.length === 0) return null;
              return (
                <div key={etapa.key} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${etapa.tint}`}>
                  <div className="h-1.5 w-1.5 rounded-full" style={{ background: etapa.accent }} />
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${etapa.text}`}>{etapa.label}</span>
                  <span className={`text-[11px] font-extrabold ${etapa.text}`}>{cards.length} · {fmtK(total)}</span>
                </div>
              );
            })}
            {totalCartoes > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl tint-emerald">
                <CreditCard className="h-3.5 w-3.5 text-emerald-700" />
                <span className="text-[11px] font-bold text-emerald-700">{totalCartoes.toLocaleString("pt-BR")} cartões projetados</span>
              </div>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="flex gap-3">
            {ETAPAS.map((e) => <Skeleton key={e.key} className="h-96 w-64 flex-shrink-0 rounded-2xl" />)}
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-4">
            {ETAPAS.map((etapa) => {
              const cards: any[] = data?.[etapa.key] ?? [];
              const colTotal = cards.reduce((s: number, o: any) => s + (o.valor_estimado || 0), 0);
              const colCartoes = cards.reduce((s: number, o: any) => s + (o.num_cartoes || 0), 0);
              return (
                <div
                  key={etapa.key}
                  className="surface-card flex-shrink-0 w-64 rounded-2xl flex flex-col overflow-hidden"
                >
                  <div className={`px-4 py-3 ${etapa.tint}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${etapa.text}`}>
                        {etapa.label}
                      </span>
                      <span className={`text-[11px] font-extrabold tabular-nums ${etapa.text}`}>
                        {cards.length}
                      </span>
                    </div>
                    <div className={`text-[13px] font-bold mt-0.5 ${etapa.text}`}>{fmt(colTotal)}</div>
                    {colCartoes > 0 && (
                      <div className={`flex items-center gap-1 text-[10px] mt-0.5 ${etapa.text} opacity-80`}>
                        <CreditCard className="h-3 w-3" />
                        {colCartoes.toLocaleString("pt-BR")} cartões
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-2 space-y-2 min-h-32">
                    {cards.map((op: any) => {
                      const progressPct = op.num_cartoes > 0 && op.valor_estimado > 0
                        ? Math.min(100, Math.round((op.valor_estimado / (colTotal || 1)) * 100))
                        : 0;
                      return (
                        <div
                          key={op.id}
                          className="bg-white rounded-xl border border-[rgba(15,23,42,0.06)] shadow-[0_1px_3px_rgba(15,23,42,0.04)] hover:shadow-[0_4px_12px_rgba(79,70,229,0.08),0_0_0_1px_rgba(79,70,229,0.2)] transition-all cursor-pointer group overflow-hidden"
                        >
                          {progressPct > 0 && (
                            <div className="h-0.5 w-full bg-[rgba(15,23,42,0.04)]">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{ width: `${progressPct}%`, background: etapa.accent }}
                              />
                            </div>
                          )}
                          <div className="p-3">
                            <Link href={`/oportunidades/${op.id}`}>
                              <p className="text-[12px] font-bold text-[#0F172A] truncate group-hover:text-[#4F46E5] transition-colors">
                                {op.titulo}
                              </p>
                              <p className="text-[11px] text-[#64748B] mt-0.5 truncate">{op.empresa_nome}</p>
                              <div className="flex items-center justify-between mt-2">
                                <p className="text-[12px] font-bold text-[#0F172A]">{fmt(op.valor_estimado)}</p>
                                {op.num_cartoes > 0 && (
                                  <span className="flex items-center gap-1 text-[10px] text-[#64748B]">
                                    <CreditCard className="h-3 w-3" />
                                    {op.num_cartoes.toLocaleString("pt-BR")}
                                  </span>
                                )}
                              </div>
                            </Link>
                            <div className="flex gap-1 mt-2 flex-wrap">
                              {ETAPAS.filter(e => e.key !== etapa.key).map(e => (
                                <button
                                  key={e.key}
                                  onClick={() => moveMutation.mutate({ id: op.id, etapa: e.key })}
                                  className={`text-[10px] px-1.5 py-0.5 rounded-md ${e.tint} ${e.text} hover:opacity-80 transition-opacity font-semibold`}
                                >
                                  → {e.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {cards.length === 0 && (
                      <div className="flex flex-col items-center py-8 text-center">
                        <Target className="h-5 w-5 text-[#CBD5E1] mb-1.5" />
                        <p className="text-[11px] text-[#94A3B8]">Vazio</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
