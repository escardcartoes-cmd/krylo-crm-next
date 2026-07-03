"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Topbar } from "@/components/layout/Topbar";
import { ButtonLink } from "@/components/ui/button-link";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { toast } from "sonner";

function fmt(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);
}

const ETAPAS = [
  { key: "prospect",   label: "Prospect",    bg: "bg-slate-100",   text: "text-slate-700" },
  { key: "contato",    label: "Contato",     bg: "bg-sky-100",     text: "text-sky-700" },
  { key: "proposta",   label: "Proposta",    bg: "bg-amber-100",   text: "text-amber-700" },
  { key: "negociacao", label: "Negociação",  bg: "bg-orange-100",  text: "text-orange-700" },
  { key: "fechado",    label: "Implantação", bg: "bg-emerald-100", text: "text-emerald-700" },
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
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pipeline"] }); toast.success("Movido"); },
    onError: () => toast.error("Erro ao mover"),
  });

  const totalPipeline = ETAPAS.filter(e => e.key !== "fechado").reduce((acc, e) => {
    return acc + (data?.[e.key] ?? []).reduce((s: number, o: any) => s + (o.valor_estimado || 0), 0);
  }, 0);

  return (
    <>
      <Topbar
        title="Pipeline"
        subtitle={isLoading ? undefined : `${fmt(totalPipeline)} em negociação`}
        actions={<ButtonLink href="/oportunidades/nova" size="sm">Nova oportunidade</ButtonLink>}
      />
      <div className="flex-1 px-8 pt-4 pb-8 space-y-4">

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-3">
            {ETAPAS.map((e) => <Skeleton key={e.key} className="h-96 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-3">
            {ETAPAS.map((etapa) => {
              const cards: any[] = data?.[etapa.key] ?? [];
              const colTotal = cards.reduce((s: number, o: any) => s + (o.valor_estimado || 0), 0);
              return (
                <div key={etapa.key} className="bg-white border border-[#E2E8F0] rounded-xl flex flex-col overflow-hidden">
                  <div className="px-3 py-2.5 border-b border-[#F1F5F9]">
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center text-[11px] font-medium px-1.5 py-0.5 rounded ${etapa.bg} ${etapa.text}`}>
                        {etapa.label}
                      </span>
                      <span className="text-[11px] font-medium text-[#64748B] tabular-nums">{cards.length}</span>
                    </div>
                    <p className="text-[12px] text-[#64748B] mt-1.5 tabular-nums">{fmt(colTotal)}</p>
                  </div>
                  <div className="flex-1 p-2 space-y-2 min-h-32">
                    {cards.map((op: any) => (
                      <div key={op.id} className="bg-white rounded-lg border border-[#E2E8F0] hover:border-[#CBD5E1] transition-colors">
                        <Link href={`/oportunidades/${op.id}`} className="block p-2.5">
                          <p className="text-[12px] font-medium text-[#0F172A] truncate">{op.titulo}</p>
                          {op.empresa_nome && (
                            <p className="text-[11px] text-[#64748B] mt-0.5 truncate">{op.empresa_nome}</p>
                          )}
                          <div className="flex items-center justify-between mt-1.5">
                            <p className="text-[12px] font-medium text-[#0F172A] tabular-nums">{fmt(op.valor_estimado)}</p>
                            {op.num_cartoes > 0 && (
                              <span className="text-[11px] text-[#94A3B8] tabular-nums">
                                {op.num_cartoes.toLocaleString("pt-BR")} cart.
                              </span>
                            )}
                          </div>
                        </Link>
                        <div className="px-2.5 pb-2 flex gap-1 flex-wrap">
                          {ETAPAS.filter(e => e.key !== etapa.key).map(e => (
                            <button
                              key={e.key}
                              onClick={() => moveMutation.mutate({ id: op.id, etapa: e.key })}
                              className="text-[10px] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] px-1.5 py-0.5 rounded transition-colors"
                            >
                              → {e.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
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
