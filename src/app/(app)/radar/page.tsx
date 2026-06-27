"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Topbar } from "@/components/layout/Topbar";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

function fmt(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);
}

const ETAPA_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  prospect:   { bg: "bg-slate-100",   text: "text-slate-700",  label: "Prospect" },
  contato:    { bg: "bg-sky-100",     text: "text-sky-700",    label: "Contato" },
  proposta:   { bg: "bg-amber-100",   text: "text-amber-700",  label: "Proposta" },
  negociacao: { bg: "bg-orange-100",  text: "text-orange-700", label: "Negociação" },
};

export default function RadarPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["radar-ops"],
    queryFn: () => api.get("/api/oportunidades", { params: { per_page: 100 } }).then((r) => r.data),
  });

  const oportunidades = (data?.items ?? []).filter(
    (o: any) => o.etapa !== "fechado" && o.etapa !== "perdido"
  );

  return (
    <>
      <Topbar
        title="Radar de mercado"
        subtitle={`${oportunidades.length} oportunidade${oportunidades.length !== 1 ? "s" : ""} ativa${oportunidades.length !== 1 ? "s" : ""}`}
      />
      <div className="flex-1 px-8 pt-4 pb-8 space-y-4">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
          </div>
        ) : oportunidades.length === 0 ? (
          <div className="surface-card rounded-xl py-16 text-center">
            <p className="text-[14px] text-[#475569]">Nenhuma oportunidade ativa.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {oportunidades.map((o: any) => {
              const st = ETAPA_STYLES[o.etapa] ?? { bg: "bg-slate-100", text: "text-slate-700", label: o.etapa };
              return (
                <Link key={o.id} href={`/oportunidades/${o.id}`}
                  className="surface-card rounded-xl p-5 hover:border-[#CBD5E1] transition-colors block">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                      <p className="text-[14px] font-medium text-[#0F172A] truncate">{o.titulo}</p>
                      {o.empresa_nome && (
                        <p className="text-[12px] text-[#64748B] mt-0.5 truncate">{o.empresa_nome}</p>
                      )}
                    </div>
                    <span className={`inline-flex items-center text-[11px] font-medium px-1.5 py-0.5 rounded flex-shrink-0 ${st.bg} ${st.text}`}>
                      {st.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-[#64748B]">{o.responsavel || "Sem responsável"}</span>
                    <span className="font-medium text-[#0F172A] tabular-nums">{fmt(o.valor_estimado)}</span>
                  </div>
                  {o.score_fechamento != null && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] text-[#64748B]">Score fechamento</span>
                        <span className="text-[11px] font-medium text-[#4F46E5] tabular-nums">{o.score_fechamento}%</span>
                      </div>
                      <div className="h-1 bg-[#F1F5F9] rounded-full overflow-hidden">
                        <div className="h-full bg-[#4F46E5]" style={{ width: `${o.score_fechamento}%` }} />
                      </div>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
