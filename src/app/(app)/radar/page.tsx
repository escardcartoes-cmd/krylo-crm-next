"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Topbar } from "@/components/layout/Topbar";
import { Skeleton } from "@/components/ui/skeleton";
import { Radar } from "lucide-react";

function fmt(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);
}

const ETAPA_STYLES: Record<string, { bg: string; text: string }> = {
  prospect:   { bg: "bg-[#F2F2F7]", text: "text-[#8E8E93]" },
  contato:    { bg: "bg-[#EBF0FF]", text: "text-[#0057FF]" },
  proposta:   { bg: "bg-[#FFF9EB]", text: "text-[#B07C00]" },
  negociacao: { bg: "bg-[#FFF3EB]", text: "text-[#C25A00]" },
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
      <Topbar title="Radar de Mercado" subtitle="Oportunidades ativas no radar comercial" />
      <div className="px-7 pt-4 pb-7">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)}
          </div>
        ) : oportunidades.length === 0 ? (
          <div className="text-center py-16">
            <div className="h-12 w-12 rounded-2xl bg-[#F2F2F7] flex items-center justify-center mx-auto mb-3">
              <Radar className="h-6 w-6 text-[#C7C7CC]" />
            </div>
            <p className="text-[13px] font-semibold text-[#1C1C1E] mb-1">Nenhuma oportunidade ativa no radar</p>
            <p className="text-[12px] text-[#8E8E93]">Crie oportunidades para acompanhar aqui</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {oportunidades.map((o: any) => {
              const etapaStyle = ETAPA_STYLES[o.etapa] ?? { bg: "bg-[#F2F2F7]", text: "text-[#8E8E93]" };
              return (
                <div
                  key={o.id}
                  className="bg-white rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_0_0_1px_rgba(0,87,255,0.2),0_4px_12px_rgba(0,87,255,0.08)] transition-all px-5 py-4"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-[#1C1C1E] truncate">{o.titulo}</p>
                      <p className="text-[12px] text-[#8E8E93] mt-0.5">{o.empresa_nome}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-lg flex-shrink-0 ${etapaStyle.bg} ${etapaStyle.text}`}>
                      {o.etapa}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-[#8E8E93]">{o.responsavel || "Sem responsável"}</span>
                    <span className="font-semibold text-[#1C1C1E]">{fmt(o.valor_estimado)}</span>
                  </div>
                  {o.score_fechamento != null && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] text-[#8E8E93]">Score fechamento</span>
                        <span className="text-[11px] font-semibold text-[#0057FF]">{o.score_fechamento}%</span>
                      </div>
                      <div className="h-1.5 bg-[#F2F2F7] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#0057FF] rounded-full transition-all"
                          style={{ width: `${o.score_fechamento}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
