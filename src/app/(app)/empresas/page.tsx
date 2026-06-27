"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Topbar } from "@/components/layout/Topbar";
import { ButtonLink } from "@/components/ui/button-link";
import { exportCSV } from "@/lib/export";
import { Search, MapPin, ChevronRight, Download } from "lucide-react";
import Link from "next/link";

const STATUS: Record<string, { bg: string; text: string }> = {
  prospect: { bg: "bg-sky-100",     text: "text-sky-700" },
  cliente:  { bg: "bg-emerald-100", text: "text-emerald-700" },
  inativo:  { bg: "bg-slate-100",   text: "text-slate-600" },
  perdido:  { bg: "bg-rose-100",    text: "text-rose-700" },
};

const STATUS_LABEL: Record<string, string> = {
  prospect: "Prospect", cliente: "Cliente", inativo: "Inativo", perdido: "Perdido",
};

export default function EmpresasPage() {
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");

  const { data, isLoading } = useQuery({
    queryKey: ["empresas", search],
    queryFn: () => api.get("/api/empresas", { params: { q: search, per_page: 100 } }).then((r) => r.data),
  });

  const allItems: any[] = data?.items ?? [];
  const items = allItems.filter((e) => statusFilter === "todos" || e.status === statusFilter);

  const counts: Record<string, number> = {
    todos: allItems.length,
    prospect: allItems.filter(e => e.status === "prospect").length,
    cliente: allItems.filter(e => e.status === "cliente").length,
    inativo: allItems.filter(e => e.status === "inativo").length,
    perdido: allItems.filter(e => e.status === "perdido").length,
  };

  const filters = [
    { value: "todos", label: "Todos" },
    { value: "cliente", label: "Clientes" },
    { value: "prospect", label: "Prospects" },
    { value: "inativo", label: "Inativos" },
    { value: "perdido", label: "Perdidos" },
  ];

  const handleExport = () => {
    exportCSV("empresas.csv", items, [
      { key: "nome", label: "Nome" },
      { key: "cnpj", label: "CNPJ" },
      { key: "segmento", label: "Segmento" },
      { key: "porte", label: "Porte" },
      { key: "status", label: "Status" },
      { key: "tipo_cartao", label: "Tipo de Cartão" },
      { key: "nome_private_label", label: "Programa" },
      { key: "valor_mensal", label: "Receita mensal" },
      { key: "num_funcionarios", label: "Funcionários" },
      { key: "cidade", label: "Cidade" },
      { key: "estado", label: "Estado" },
      { key: "telefone", label: "Telefone" },
      { key: "email", label: "E-mail" },
    ]);
  };

  return (
    <>
      <Topbar
        title="Empresas"
        actions={
          <>
            <button onClick={handleExport} disabled={items.length === 0}
              className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg text-[13px] font-medium text-[#475569] bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] hover:border-[#94A3B8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <Download className="h-3.5 w-3.5" />Exportar
            </button>
            <ButtonLink href="/empresas/nova" size="sm">Nova empresa</ButtonLink>
          </>
        }
      />
      <div className="flex-1 px-8 pt-4 pb-8 space-y-4">

        {/* Filters + search in one row */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-1">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`h-8 px-3 rounded-lg text-[13px] font-medium transition-colors ${
                  statusFilter === f.value
                    ? "bg-[#0F172A] text-white"
                    : "text-[#475569] hover:bg-[#F1F5F9]"
                }`}
              >
                {f.label}
                <span className={`ml-1.5 text-[11px] tabular-nums ${
                  statusFilter === f.value ? "text-white/60" : "text-[#94A3B8]"
                }`}>{counts[f.value] ?? 0}</span>
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#94A3B8]" />
            <input
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-white border border-[#CBD5E1] text-[13px] text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15 transition-colors"
              placeholder="Buscar por nome, CNPJ, cidade…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setSearch(q)}
            />
          </div>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="surface-card rounded-xl divide-y divide-[#F1F5F9]">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-[64px] px-5 py-4 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="surface-card rounded-xl py-16 text-center">
            <p className="text-[14px] text-[#475569]">Nenhuma empresa encontrada.</p>
            <ButtonLink href="/empresas/nova" size="sm" className="mt-4">Cadastrar empresa</ButtonLink>
          </div>
        ) : (
          <div className="surface-card rounded-xl overflow-hidden">
            <ul className="divide-y divide-[#F1F5F9]">
              {items.map((emp) => {
                const st = STATUS[emp.status] ?? STATUS.inativo;
                return (
                  <li key={emp.id}>
                    <Link href={`/empresas/${emp.id}`}
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#F8FAFC] group">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-[14px] font-medium text-[#0F172A] truncate">{emp.nome}</p>
                          <span className={`inline-flex items-center text-[11px] font-medium px-1.5 py-0.5 rounded ${st.bg} ${st.text}`}>
                            {STATUS_LABEL[emp.status] ?? emp.status}
                          </span>
                          {emp.cliente_ativo ? (
                            <span className="inline-flex items-center text-[11px] font-medium px-1.5 py-0.5 rounded bg-violet-100 text-violet-700">
                              Cartão ativo
                            </span>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-[12px] text-[#64748B]">
                          {emp.cnpj && <span className="font-mono">{emp.cnpj}</span>}
                          {emp.segmento && <span>{emp.segmento}</span>}
                          {emp.cidade && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3 w-3" />{emp.cidade}{emp.estado ? `/${emp.estado}` : ""}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-[12px] text-[#64748B]">
                        {emp.num_oportunidades > 0 && (
                          <span className="text-[#4F46E5] font-medium tabular-nums">{emp.num_oportunidades} op</span>
                        )}
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
