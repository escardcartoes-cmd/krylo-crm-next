"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Topbar } from "@/components/layout/Topbar";
import { Skeleton } from "@/components/ui/skeleton";
import { Radar } from "lucide-react";
import Link from "next/link";

function fmt(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);
}

const ETAPA_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  prospect:   { bg: "bg-[#F1F5F9]", text: "text-[#64748B]",  label: "Prospecção" },
  contato:    { bg: "tint-blue",    text: "text-[#4F46E5]",  label: "Contato" },
  proposta:   { bg: "tint-amber",   text: "text-amber-700",  label: "Proposta" },
  negociacao: { bg: "bg-orange-50", text: "text-orange-700", label: "Negociação" },
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
        title="Radar de Mercado"
        subtitle={`${oportunidades.length} oportunidade${oportunidades.length !== 1 ? "s" : ""} ativa${oportunidades.length !== 1 ? "s" : ""}`}
      />
      <div className="flex-1 px-8 pt-4 pb-8 space-y-5">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
          </div>
        ) : oportunidades.length === 0 ? (
          <div className="surface-card rounded-2xl py-16 text-center">
            <div className="h-16 w-16 rounded-2xl tint-violet flex items-center justify-center mx-auto mb-4">
              <Radar className="h-8 w-8 text-violet-600" />
            </div>
            <p className="text-[15px] font-bold text-[#0F172A]">Nenhuma oportunidade ativa no radar</p>
            <p className="text-[13px] text-[#64748B] mt-1">Crie oportunidades para acompanhar aqui</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {oportunidades.map((o: any) => {
              const etapaStyle = ETAPA_STYLES[o.etapa] ?? { bg: "bg-[#F1F5F9]", text: "text-[#64748B]", label: o.etapa };
              return (
                <Link
                  key={o.id}
                  href={`/oportunidades/${o.id}`}
                  className="surface-card surface-card-hover rounded-2xl px-5 py-4 transition-all"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                      <p className="text-[14px] font-bold text-[#0F172A] truncate">{o.titulo}</p>
                      <p className="text-[12px] text-[#64748B] mt-0.5 truncate">{o.empresa_nome}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0 ${etapaStyle.bg} ${etapaStyle.text}`}>
                      {etapaStyle.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-[#64748B]">{o.responsavel || "Sem responsável"}</span>
                    <span className="font-bold text-[#0F172A]">{fmt(o.valor_estimado)}</span>
                  </div>
                  {o.score_fechamento != null && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] text-[#64748B] font-semibold">Score fechamento</span>
                        <span className="text-[11px] font-bold text-[#4F46E5]">{o.score_fechamento}%</span>
                      </div>
                      <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${o.score_fechamento}%`,
                            background: "linear-gradient(90deg,#4F46E5,#7C3AED)",
                          }}
                        />
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
