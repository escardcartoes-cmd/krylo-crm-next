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
  { key: "prospect",   label: "Prospect",    headerBg: "bg-[#F2F2F7]", headerText: "text-[#8E8E93]",  colBg: "bg-[#F9F9FB]",   accentColor: "#8E8E93" },
  { key: "contato",    label: "Contato",     headerBg: "bg-[#EBF0FF]", headerText: "text-[#0057FF]",  colBg: "bg-[#F5F7FF]",   accentColor: "#0057FF" },
  { key: "proposta",   label: "Proposta",    headerBg: "bg-[#FFF9EB]", headerText: "text-[#B07C00]",  colBg: "bg-[#FFFDF5]",   accentColor: "#FF9500" },
  { key: "negociacao", label: "Negociação",  headerBg: "bg-[#FFF3EB]", headerText: "text-[#C25A00]",  colBg: "bg-[#FFFAF5]",   accentColor: "#FF6B00" },
  { key: "fechado",    label: "Implantação", headerBg: "bg-[#EDFAF3]", headerText: "text-[#1A7F4B]",  colBg: "bg-[#F5FDF8]",   accentColor: "#34C759" },
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
        subtitle={isLoading ? undefined : `${fmt(totalPipeline)} em negociação`}
        actions={<ButtonLink href="/oportunidades/nova" size="sm">+ Oportunidade</ButtonLink>}
      />
      <div className="px-7 pt-4 pb-7">

        {/* Summary bar */}
        {!isLoading && data && (
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            {ETAPAS.map(etapa => {
              const cards: any[] = data?.[etapa.key] ?? [];
              const total = cards.reduce((s: number, o: any) => s + (o.valor_estimado || 0), 0);
              if (cards.length === 0) return null;
              return (
                <div key={etapa.key} className={`flex items-center gap-2 px-3 py-2 rounded-xl ${etapa.headerBg}`}>
                  <div className="h-1.5 w-1.5 rounded-full" style={{ background: etapa.accentColor }} />
                  <span className={`text-[11px] font-bold ${etapa.headerText}`}>{etapa.label}</span>
                  <span className={`text-[11px] font-semibold ${etapa.headerText} opacity-70`}>{cards.length} · {fmtK(total)}</span>
                </div>
              );
            })}
            {totalCartoes > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#E8F9F0]">
                <CreditCard className="h-3.5 w-3.5 text-[#1A7F4B]" />
                <span className="text-[11px] font-bold text-[#1A7F4B]">{totalCartoes.toLocaleString("pt-BR")} cartões projetados</span>
              </div>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="flex gap-3">
            {ETAPAS.map((e) => <Skeleton key={e.key} className="h-96 w-56 flex-shrink-0 rounded-2xl" />)}
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
                  className={`flex-shrink-0 w-64 rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.06)] ${etapa.colBg} flex flex-col overflow-hidden`}
                >
                  <div className={`px-4 py-3 ${etapa.headerBg}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${etapa.headerText}`}>
                        {etapa.label}
                      </span>
                      <span className={`text-[11px] font-semibold ${etapa.headerText} opacity-70 tabular-nums`}>
                        {cards.length}
                      </span>
                    </div>
                    <div className={`text-[12px] font-bold mt-0.5 ${etapa.headerText}`}>{fmt(colTotal)}</div>
                    {colCartoes > 0 && (
                      <div className={`flex items-center gap-1 text-[10px] mt-0.5 ${etapa.headerText} opacity-70`}>
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
                          className="bg-white rounded-xl shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden hover:shadow-[0_0_0_1px_rgba(0,87,255,0.2),0_4px_8px_rgba(0,87,255,0.06)] transition-all cursor-pointer group"
                        >
                          {/* Mini progress bar top */}
                          {progressPct > 0 && (
                            <div className="h-0.5 w-full" style={{ background: `rgba(0,0,0,0.04)` }}>
                              <div
                                className="h-full rounded-full transition-all"
                                style={{ width: `${progressPct}%`, background: etapa.accentColor }}
                              />
                            </div>
                          )}
                          <div className="p-3">
                            <Link href={`/oportunidades/${op.id}`}>
                              <p className="text-[12px] font-semibold text-[#1C1C1E] truncate group-hover:text-[#0057FF] transition-colors">
                                {op.titulo}
                              </p>
                              <p className="text-[11px] text-[#8E8E93] mt-0.5 truncate">{op.empresa_nome}</p>
                              <div className="flex items-center justify-between mt-2">
                                <p className="text-[12px] font-bold text-[#1C1C1E]">{fmt(op.valor_estimado)}</p>
                                {op.num_cartoes > 0 && (
                                  <span className="flex items-center gap-1 text-[10px] text-[#8E8E93]">
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
                                  className={`text-[10px] px-1.5 py-0.5 rounded-lg ${e.headerBg} ${e.headerText} hover:opacity-80 transition-opacity font-medium`}
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
                        <Target className="h-5 w-5 text-[#C7C7CC] mb-1.5" />
                        <p className="text-[11px] text-[#C7C7CC]">Vazio</p>
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
