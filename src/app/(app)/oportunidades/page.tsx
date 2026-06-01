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
  prospect:   { bg: "bg-[#F1F5F9]",   text: "text-[#64748B]",  label: "Prospecção" },
  contato:    { bg: "tint-blue",      text: "text-[#4F46E5]",  label: "Contato" },
  proposta:   { bg: "tint-amber",     text: "text-amber-700",  label: "Proposta" },
  negociacao: { bg: "bg-orange-50",   text: "text-orange-700", label: "Negociação" },
  fechado:    { bg: "tint-emerald",   text: "text-emerald-700",label: "Implantação" },
  perdido:    { bg: "tint-rose",      text: "text-rose-700",   label: "Perdido" },
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
        subtitle={data ? `${data.total} oportunidade${data.total !== 1 ? "s" : ""}` : "Oportunidades em negociação"}
        actions={
          <>
            <ButtonLink href="/pipeline" variant="outline" size="sm">Ver Pipeline</ButtonLink>
            <ButtonLink href="/oportunidades/nova" size="sm">+ Nova oportunidade</ButtonLink>
          </>
        }
      />
      <div className="flex-1 px-8 pt-4 pb-8 space-y-5">

        {/* Stat pills */}
        {!isLoading && items.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl tint-blue">
              <DollarSign className="h-3.5 w-3.5 text-[#4F46E5]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#4F46E5]">Pipeline</span>
              <span className="text-[13px] font-extrabold text-[#4F46E5]">{fmt(totalPipeline)}</span>
            </div>
            {totalCartoes > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl tint-emerald">
                <CreditCard className="h-3.5 w-3.5 text-emerald-700" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Cartões</span>
                <span className="text-[13px] font-extrabold text-emerald-700">{totalCartoes.toLocaleString("pt-BR")}</span>
              </div>
            )}
          </div>
        )}

        {/* Search */}
        <div className="flex gap-2.5">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
            <input
              className="w-full h-10 pl-10 pr-3.5 rounded-xl bg-white border border-[rgba(15,23,42,0.08)] text-[13px] text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 transition-all shadow-sm"
              placeholder="Buscar por título ou empresa…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setSearch(q)}
            />
          </div>
          <button onClick={() => setSearch(q)}
            className="h-10 px-5 rounded-xl text-white text-[13px] font-semibold transition-all active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg,#4F46E5,#6366F1)",
              boxShadow: "0 4px 12px rgba(79,70,229,0.3)",
            }}>Buscar</button>
          {search && (
            <button onClick={() => { setQ(""); setSearch(""); }}
              className="h-10 px-4 rounded-xl text-[13px] font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-white/60 transition-colors">
              Limpar
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => <div key={i} className="h-[78px] surface-card rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((op: any) => {
              const etapaStyle = ETAPA_STYLES[op.etapa] ?? { bg: "bg-[#F1F5F9]", text: "text-[#64748B]", label: op.etapa };
              return (
                <Link
                  key={op.id}
                  href={`/oportunidades/${op.id}`}
                  className="surface-card surface-card-hover flex items-center gap-4 px-5 py-4 rounded-2xl group transition-all"
                >
                  <div className="h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 tint-violet">
                    <Target className="h-5 w-5 text-violet-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-[#0F172A] truncate">{op.titulo}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {op.empresa_nome && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded-md bg-[#F1F5F9] text-[#475569]">
                          {op.empresa_nome}
                        </span>
                      )}
                      {op.num_cartoes > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.5 rounded-md tint-emerald text-emerald-700">
                          <CreditCard className="h-3 w-3" />
                          {op.num_cartoes.toLocaleString("pt-BR")} cartões
                        </span>
                      )}
                      {op.responsavel && (
                        <span className="text-[11px] text-[#94A3B8]">{op.responsavel}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-[14px] font-bold text-[#0F172A]">{fmt(op.valor_estimado)}</p>
                      {op.valor_mensal > 0 && op.num_cartoes > 0 && (
                        <p className="text-[11px] text-[#94A3B8] mt-0.5">R$ {op.valor_mensal}/cartão</p>
                      )}
                    </div>
                    <span className={`text-[11px] font-bold px-2 py-1 rounded-md ${etapaStyle.bg} ${etapaStyle.text}`}>
                      {etapaStyle.label}
                    </span>
                    <ChevronRight className="h-4 w-4 text-[#CBD5E1] group-hover:text-[#4F46E5] transition-colors" />
                  </div>
                </Link>
              );
            })}
            {items.length === 0 && (
              <div className="surface-card rounded-2xl py-16 text-center">
                <div className="h-16 w-16 rounded-2xl tint-violet flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-violet-600" />
                </div>
                <p className="text-[15px] font-bold text-[#0F172A]">Nenhuma oportunidade encontrada</p>
                <p className="text-[13px] text-[#64748B] mt-1 mb-5">Crie sua primeira oportunidade para começar</p>
                <ButtonLink href="/oportunidades/nova" size="sm">+ Criar oportunidade</ButtonLink>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
