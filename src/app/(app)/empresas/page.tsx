"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Topbar } from "@/components/layout/Topbar";
import { ButtonLink } from "@/components/ui/button-link";
import { Search, Building2, MapPin, ChevronRight, CreditCard, Users as UsersIcon } from "lucide-react";
import Link from "next/link";

const STATUS: Record<string, { bg: string; text: string; dot: string }> = {
  prospect: { bg: "bg-sky-50", text: "text-sky-700", dot: "bg-sky-500" },
  cliente:  { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  inativo:  { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
  perdido:  { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
};

export default function EmpresasPage() {
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["empresas", search],
    queryFn: () => api.get("/api/empresas", { params: { q: search, per_page: 100 } }).then((r) => r.data),
  });

  const items: any[] = data?.items ?? [];
  const counts = {
    total: data?.total ?? 0,
    cliente:  items.filter(e => e.status === "cliente").length,
    prospect: items.filter(e => e.status === "prospect").length,
    inativo:  items.filter(e => e.status === "inativo").length,
  };

  return (
    <>
      <Topbar
        title="Empresas"
        subtitle={data ? `${data.total} ${data.total === 1 ? "empresa cadastrada" : "empresas cadastradas"}` : "Empresas cadastradas"}
        actions={<ButtonLink href="/empresas/nova" size="sm">+ Nova empresa</ButtonLink>}
      />
      <div className="flex-1 px-8 pt-4 pb-8 space-y-5">

        {/* Stat pills */}
        {!isLoading && counts.total > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { label: "Total",     value: counts.total,    bg: "tint-blue",    color: "text-[#4F46E5]" },
              { label: "Clientes",  value: counts.cliente,  bg: "tint-emerald", color: "text-emerald-700" },
              { label: "Prospects", value: counts.prospect, bg: "tint-sky",     color: "text-sky-700" },
              { label: "Inativos",  value: counts.inativo,  bg: "bg-slate-100", color: "text-slate-600" },
            ].map(s => (
              <div key={s.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${s.bg}`}>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${s.color}`}>{s.label}</span>
                <span className={`text-[13px] font-extrabold ${s.color}`}>{s.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Search row */}
        <div className="flex gap-2.5">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
            <input
              className="w-full h-10 pl-10 pr-3.5 rounded-xl bg-white border border-[rgba(15,23,42,0.08)] text-[13px] text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 transition-all shadow-sm"
              placeholder="Buscar por nome, CNPJ, cidade…"
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

        {/* List */}
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => <div key={i} className="h-[78px] surface-card rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((emp) => {
              const st = STATUS[emp.status] ?? STATUS.inativo;
              return (
                <Link key={emp.id} href={`/empresas/${emp.id}`}
                  className="surface-card surface-card-hover flex items-center gap-4 px-5 py-4 rounded-2xl group transition-all">
                  <div className="h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 tint-blue">
                    <Building2 className="h-5 w-5 text-[#4F46E5]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[14px] font-bold text-[#0F172A] truncate">{emp.nome}</p>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${st.bg} ${st.text}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                        {emp.status}
                      </span>
                      {emp.cliente_ativo ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-violet-50 text-violet-700">
                          <CreditCard className="h-2.5 w-2.5" />Cartão ativo
                        </span>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[12px] text-[#64748B]">
                      {emp.cnpj && <span className="font-mono">{emp.cnpj}</span>}
                      {emp.segmento && <span>· {emp.segmento}</span>}
                      {emp.cidade && (
                        <span className="flex items-center gap-1">
                          · <MapPin className="h-3 w-3" />{emp.cidade}{emp.estado ? `, ${emp.estado}` : ""}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-[12px] text-[#64748B] flex-shrink-0">
                    {emp.num_funcionarios > 0 && (
                      <span className="flex items-center gap-1">
                        <UsersIcon className="h-3 w-3" />{emp.num_funcionarios}
                      </span>
                    )}
                    {emp.num_oportunidades > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-[#EEF2FF] text-[#4F46E5] font-bold">
                        {emp.num_oportunidades} op
                      </span>
                    )}
                    <ChevronRight className="h-4 w-4 text-[#CBD5E1] group-hover:text-[#4F46E5] transition-colors" />
                  </div>
                </Link>
              );
            })}
            {items.length === 0 && (
              <div className="surface-card rounded-2xl py-16 text-center">
                <div className="h-16 w-16 rounded-2xl tint-blue flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-8 w-8 text-[#4F46E5]" />
                </div>
                <p className="text-[15px] font-bold text-[#0F172A]">Nenhuma empresa encontrada</p>
                <p className="text-[13px] text-[#64748B] mt-1 mb-5">Cadastre a primeira empresa do CRM</p>
                <ButtonLink href="/empresas/nova" size="sm">+ Criar empresa</ButtonLink>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
