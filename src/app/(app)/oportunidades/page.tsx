"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Topbar } from "@/components/layout/Topbar";
import { ButtonLink } from "@/components/ui/button-link";
import { exportCSV } from "@/lib/export";
import { Search, ChevronRight, Download } from "lucide-react";
import Link from "next/link";

function fmt(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);
}

const ETAPA_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  prospect:   { bg: "bg-slate-100",   text: "text-slate-700",   label: "Prospect" },
  contato:    { bg: "bg-sky-100",     text: "text-sky-700",     label: "Contato" },
  proposta:   { bg: "bg-amber-100",   text: "text-amber-700",   label: "Proposta" },
  negociacao: { bg: "bg-orange-100",  text: "text-orange-700",  label: "Negociação" },
  fechado:    { bg: "bg-emerald-100", text: "text-emerald-700", label: "Implantação" },
  perdido:    { bg: "bg-rose-100",    text: "text-rose-700",    label: "Perdido" },
};

const ETAPA_OPTIONS = [
  { value: "todas",      label: "Todas" },
  { value: "prospect",   label: "Prospect" },
  { value: "contato",    label: "Contato" },
  { value: "proposta",   label: "Proposta" },
  { value: "negociacao", label: "Negociação" },
  { value: "fechado",    label: "Implantação" },
  { value: "perdido",    label: "Perdido" },
];

export default function OportunidadesPage() {
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [etapaFilter, setEtapaFilter] = useState("todas");

  const { data, isLoading } = useQuery({
    queryKey: ["oportunidades", search],
    queryFn: () => api.get("/api/oportunidades", { params: { q: search, per_page: 100 } }).then((r) => r.data),
  });

  const allItems: any[] = data?.items ?? [];
  const items = allItems.filter((o) => etapaFilter === "todas" || o.etapa === etapaFilter);

  const counts: Record<string, number> = {
    todas: allItems.length,
    ...Object.fromEntries(
      ETAPA_OPTIONS.filter(o => o.value !== "todas").map(o => [
        o.value,
        allItems.filter(i => i.etapa === o.value).length,
      ])
    ),
  };

  const handleExport = () => {
    exportCSV("oportunidades.csv", items, [
      { key: "titulo", label: "Título" },
      { key: "empresa_nome", label: "Empresa" },
      { key: "etapa", label: "Etapa" },
      { key: "valor_estimado", label: "Valor Estimado" },
      { key: "num_cartoes", label: "Nº Cartões" },
      { key: "valor_mensal", label: "Valor Mensal" },
      { key: "responsavel", label: "Responsável" },
      { key: "previsao_fechamento", label: "Previsão" },
    ]);
  };

  return (
    <>
      <Topbar
        title="Oportunidades"
        actions={
          <>
            <ButtonLink href="/pipeline" variant="outline" size="sm">Pipeline</ButtonLink>
            <button onClick={handleExport} disabled={items.length === 0}
              className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg text-[13px] font-medium text-[#475569] bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] hover:border-[#94A3B8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <Download className="h-3.5 w-3.5" />Exportar
            </button>
            <ButtonLink href="/oportunidades/nova" size="sm">Nova oportunidade</ButtonLink>
          </>
        }
      />
      <div className="flex-1 px-8 pt-4 pb-8 space-y-4">

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-1 flex-wrap">
            {ETAPA_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => setEtapaFilter(o.value)}
                className={`h-8 px-3 rounded-lg text-[13px] font-medium transition-colors ${
                  etapaFilter === o.value
                    ? "bg-[#0F172A] text-white"
                    : "text-[#475569] hover:bg-[#F1F5F9]"
                }`}
              >
                {o.label}
                <span className={`ml-1.5 text-[11px] tabular-nums ${
                  etapaFilter === o.value ? "text-white/60" : "text-[#94A3B8]"
                }`}>{counts[o.value] ?? 0}</span>
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#94A3B8]" />
            <input
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-white border border-[#CBD5E1] text-[13px] text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15 transition-colors"
              placeholder="Buscar por título ou empresa…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setSearch(q)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="surface-card rounded-xl divide-y divide-[#F1F5F9]">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-[64px] px-5 py-4 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="surface-card rounded-xl py-16 text-center">
            <p className="text-[14px] text-[#475569]">Nenhuma oportunidade encontrada.</p>
            <ButtonLink href="/oportunidades/nova" size="sm" className="mt-4">Criar oportunidade</ButtonLink>
          </div>
        ) : (
          <div className="surface-card rounded-xl overflow-hidden">
            <ul className="divide-y divide-[#F1F5F9]">
              {items.map((op) => {
                const st = ETAPA_STYLES[op.etapa] ?? { bg: "bg-slate-100", text: "text-slate-700", label: op.etapa };
                return (
                  <li key={op.id}>
                    <Link href={`/oportunidades/${op.id}`}
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#F8FAFC] group">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-[14px] font-medium text-[#0F172A] truncate">{op.titulo}</p>
                          <span className={`inline-flex items-center text-[11px] font-medium px-1.5 py-0.5 rounded ${st.bg} ${st.text}`}>
                            {st.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-[12px] text-[#64748B]">
                          {op.empresa_nome && <span className="truncate">{op.empresa_nome}</span>}
                          {op.num_cartoes > 0 && (
                            <span className="tabular-nums">{op.num_cartoes.toLocaleString("pt-BR")} cartões</span>
                          )}
                          {op.responsavel && <span>{op.responsavel}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-[13px] font-medium text-[#0F172A] tabular-nums">{fmt(op.valor_estimado)}</p>
                          {op.valor_mensal > 0 && op.num_cartoes > 0 && (
                            <p className="text-[11px] text-[#94A3B8] tabular-nums">R$ {op.valor_mensal}/cartão</p>
                          )}
                        </div>
                        <ChevronRight className="h-4 w-4 text-[#CBD5E1] group-hover:text-[#64748B]" />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
