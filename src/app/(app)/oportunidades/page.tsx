"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Topbar } from "@/components/layout/Topbar";
import { ButtonLink } from "@/components/ui/button-link";
import { Search, Target, CreditCard, ChevronRight, DollarSign } from "lucide-react";
import Link from "next/link";

function fmt(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);
}

const ETAPA_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  prospect:   { bg: "bg-[#F2F2F7]",  text: "text-[#8E8E93]",  label: "Prospecção" },
  contato:    { bg: "bg-[#EBF0FF]",  text: "text-[#0057FF]",  label: "Contato" },
  proposta:   { bg: "bg-[#FFF9EB]",  text: "text-[#B07C00]",  label: "Proposta" },
  negociacao: { bg: "bg-[#FFF3EB]",  text: "text-[#C25A00]",  label: "Negociação" },
  fechado:    { bg: "bg-[#EDFAF3]",  text: "text-[#1A7F4B]",  label: "Implantação" },
  perdido:    { bg: "bg-[#FFEBEB]",  text: "text-[#CC0000]",  label: "Perdido" },
};

export default function OportunidadesPage() {
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["oportunidades", search],
    queryFn: () => api.get("/api/oportunidades", { params: { q: search, per_page: 100 } }).then((r) => r.data),
  });

  const items: any[] = data?.items ?? [];
  const totalPipeline = items.reduce((s, o) => s + (o.valor_estimado || 0), 0);
  const totalCartoes = items.reduce((s, o) => s + (o.num_cartoes || 0), 0);

  return (
    <>
      <Topbar
        title="Oportunidades"
        subtitle={data ? `${data.total} oportunidade${data.total !== 1 ? "s" : ""}` : ""}
        actions={
          <>
            <ButtonLink href="/pipeline" variant="outline" size="sm">Ver Pipeline</ButtonLink>
            <ButtonLink href="/oportunidades/nova" size="sm">+ Nova oportunidade</ButtonLink>
          </>
        }
      />
      <div className="px-7 pt-4 pb-7">

        {/* Stat pills */}
        {!isLoading && items.length > 0 && (
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EEF3FF] text-[12px] font-semibold text-[#0057FF]">
              <DollarSign className="h-3.5 w-3.5" />
              {fmt(totalPipeline)} no pipeline
            </div>
            {totalCartoes > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E8F9F0] text-[12px] font-semibold text-[#1A7F4B]">
                <CreditCard className="h-3.5 w-3.5" />
                {totalCartoes.toLocaleString("pt-BR")} cartões projetados
              </div>
            )}
          </div>
        )}

        {/* Search */}
        <div className="flex gap-2 mb-5">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8E8E93]" />
            <input
              className="w-full h-9 pl-9 pr-3 rounded-xl bg-white border border-[rgba(0,0,0,0.08)] text-[13px] text-[#1C1C1E] placeholder-[#C7C7CC] outline-none focus:border-[#0057FF] focus:ring-2 focus:ring-[#0057FF]/10 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
              placeholder="Buscar por título ou empresa…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setSearch(q)}
            />
          </div>
          <button
            onClick={() => setSearch(q)}
            className="h-9 px-4 rounded-xl bg-white border border-[rgba(0,0,0,0.08)] text-[13px] font-medium text-[#3A3A3C] hover:bg-[#F2F2F7] transition-colors shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
          >
            Buscar
          </button>
          {search && (
            <button
              onClick={() => { setQ(""); setSearch(""); }}
              className="h-9 px-4 rounded-xl text-[13px] font-medium text-[#8E8E93] hover:text-[#3A3A3C] hover:bg-[rgba(0,0,0,0.04)] transition-colors"
            >
              Limpar
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => <div key={i} className="h-[72px] bg-white rounded-2xl animate-pulse shadow-[0_0_0_1px_rgba(0,0,0,0.06)]" />)}
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((op: any) => {
              const etapaStyle = ETAPA_STYLES[op.etapa] ?? { bg: "bg-[#F2F2F7]", text: "text-[#8E8E93]", label: op.etapa };
              return (
                <Link
                  key={op.id}
                  href={`/oportunidades/${op.id}`}
                  className="flex items-center gap-4 px-5 py-4 bg-white rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.06)] hover:shadow-[0_0_0_1px_rgba(0,87,255,0.2),0_4px_12px_rgba(0,87,255,0.08)] transition-all group"
                >
                  {/* Icon */}
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#EBF0FF] to-[#D6E4FF] flex items-center justify-center flex-shrink-0">
                    <Target className="h-5 w-5 text-[#0057FF]" />
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-[#1C1C1E] truncate">{op.titulo}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {op.empresa_nome && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-lg bg-[#F2F2F7] text-[#636366]">
                          {op.empresa_nome}
                        </span>
                      )}
                      {op.num_cartoes > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded-lg bg-[#E8F9F0] text-[#1A7F4B]">
                          <CreditCard className="h-3 w-3" />
                          {op.num_cartoes.toLocaleString("pt-BR")} cartões
                        </span>
                      )}
                      {op.responsavel && (
                        <span className="text-[11px] text-[#8E8E93]">{op.responsavel}</span>
                      )}
                    </div>
                  </div>

                  {/* Right: value + stage */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-[14px] font-bold text-[#1C1C1E]">{fmt(op.valor_estimado)}</p>
                      {op.valor_mensal > 0 && op.num_cartoes > 0 && (
                        <p className="text-[11px] text-[#8E8E93] mt-0.5">R$ {op.valor_mensal}/cartão</p>
                      )}
                    </div>
                    <span className={`text-[11px] font-semibold px-2 py-1 rounded-lg ${etapaStyle.bg} ${etapaStyle.text}`}>
                      {etapaStyle.label}
                    </span>
                    <ChevronRight className="h-4 w-4 text-[#C7C7CC] group-hover:text-[#0057FF] transition-colors" />
                  </div>
                </Link>
              );
            })}
            {items.length === 0 && (
              <div className="text-center py-20">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#EBF0FF] to-[#D6E4FF] flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-[#0057FF]" />
                </div>
                <p className="text-[15px] font-bold text-[#3A3A3C]">Nenhuma oportunidade encontrada</p>
                <p className="text-[13px] text-[#8E8E93] mt-1 mb-5">Crie sua primeira oportunidade para começar</p>
                <ButtonLink href="/oportunidades/nova" size="sm">Criar primeira oportunidade</ButtonLink>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
