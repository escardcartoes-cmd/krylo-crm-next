"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Topbar } from "@/components/layout/Topbar";
import { ButtonLink } from "@/components/ui/button-link";
import { Search, Building2, MapPin, ChevronRight, CreditCard, Users } from "lucide-react";
import Link from "next/link";

const STATUS_STYLE: Record<string, string> = {
  prospect:  "bg-[#EEF3FF] text-[#0057FF]",
  cliente:   "bg-[#E8F9F0] text-[#1C7C4A]",
  inativo:   "bg-[#F2F2F7] text-[#8E8E93]",
  perdido:   "bg-[#FFF1F0] text-[#FF3B30]",
};

const STATUS_LABEL: Record<string, string> = {
  prospect: "Prospect",
  cliente:  "Cliente",
  inativo:  "Inativo",
  perdido:  "Perdido",
};

export default function EmpresasPage() {
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["empresas", search],
    queryFn: () => api.get("/api/empresas", { params: { q: search, per_page: 100 } }).then((r) => r.data),
  });

  const items: any[] = data?.items ?? [];
  const prospects = items.filter(e => e.status === "prospect").length;
  const clientes  = items.filter(e => e.status === "cliente").length;
  const inativos  = items.filter(e => e.status === "inativo" || e.status === "perdido").length;

  return (
    <>
      <Topbar
        title="Empresas"
        subtitle={data ? `${data.total} empresa${data.total !== 1 ? "s" : ""}` : ""}
        actions={<ButtonLink href="/empresas/nova" size="sm">+ Nova empresa</ButtonLink>}
      />
      <div className="flex-1 px-7 pt-4 pb-7">

        {/* Stat pills */}
        {!isLoading && data && items.length > 0 && (
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.07)] text-[12px] font-semibold text-[#1C1C1E]">
              <Building2 className="h-3.5 w-3.5 text-[#8E8E93]" />
              <span>{data.total} total</span>
            </div>
            {prospects > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EEF3FF] text-[12px] font-semibold text-[#0057FF]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0057FF]" />
                {prospects} prospect{prospects !== 1 ? "s" : ""}
              </div>
            )}
            {clientes > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E8F9F0] text-[12px] font-semibold text-[#1C7C4A]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#34C759]" />
                {clientes} cliente{clientes !== 1 ? "s" : ""}
              </div>
            )}
            {inativos > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F2F2F7] text-[12px] font-semibold text-[#8E8E93]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#C7C7CC]" />
                {inativos} inativo{inativos !== 1 ? "s" : ""}
              </div>
            )}
          </div>
        )}

        {/* Search */}
        <div className="flex gap-2 mb-5">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#C7C7CC]" />
            <input
              className="w-full h-9 pl-9 pr-3 rounded-xl bg-white border border-[rgba(0,0,0,0.08)] text-[13px] text-[#1C1C1E] placeholder-[#C7C7CC] outline-none focus:border-[#0057FF] focus:ring-2 focus:ring-[#0057FF]/10 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
              placeholder="Buscar por nome, CNPJ, cidade…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setSearch(q)}
            />
          </div>
          <button
            onClick={() => setSearch(q)}
            className="h-9 px-4 rounded-xl bg-white border border-[rgba(0,0,0,0.08)] text-[13px] font-medium text-[#3A3A3C] hover:bg-[#F2F2F7] transition-colors shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
          >Buscar</button>
          {search && (
            <button
              onClick={() => { setQ(""); setSearch(""); }}
              className="h-9 px-4 rounded-xl text-[13px] font-medium text-[#8E8E93] hover:text-[#3A3A3C] hover:bg-[rgba(0,0,0,0.04)] transition-colors"
            >Limpar</button>
          )}
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-[72px] bg-white rounded-2xl animate-pulse shadow-[0_0_0_1px_rgba(0,0,0,0.06)]" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((emp: any) => (
              <Link
                key={emp.id}
                href={`/empresas/${emp.id}`}
                className="flex items-center gap-4 px-5 py-4 bg-white rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.06)] hover:shadow-[0_0_0_1px_rgba(0,87,255,0.2),0_4px_16px_rgba(0,87,255,0.08)] transition-all group"
              >
                {/* Icon / avatar */}
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#EEF3FF] to-[#D6E4FF] flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-5 w-5 text-[#0057FF]" />
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[14px] font-semibold text-[#1C1C1E] truncate">{emp.nome}</p>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-lg flex-shrink-0 ${STATUS_STYLE[emp.status] ?? "bg-[#F2F2F7] text-[#8E8E93]"}`}>
                      {STATUS_LABEL[emp.status] ?? emp.status}
                    </span>
                    {emp.cliente_ativo ? (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-lg bg-[#EEF3FF] text-[#0057FF] flex items-center gap-1 flex-shrink-0">
                        <CreditCard className="h-2.5 w-2.5" />Cartão ativo
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-[12px] text-[#8E8E93]">
                    {emp.segmento && <span>{emp.segmento}</span>}
                    {emp.porte && <span className="flex-shrink-0">· {emp.porte}</span>}
                    {emp.cidade && (
                      <span className="flex items-center gap-1 flex-shrink-0">
                        · <MapPin className="h-3 w-3" />{emp.cidade}{emp.estado ? `, ${emp.estado}` : ""}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right stats */}
                <div className="flex items-center gap-3 text-[12px] flex-shrink-0">
                  {emp.num_funcionarios > 0 && (
                    <div className="flex items-center gap-1 text-[#8E8E93]">
                      <Users className="h-3.5 w-3.5" />
                      <span>{emp.num_funcionarios.toLocaleString("pt-BR")}</span>
                    </div>
                  )}
                  {emp.num_contatos > 0 && (
                    <span className="text-[#8E8E93]">{emp.num_contatos} contato{emp.num_contatos !== 1 ? "s" : ""}</span>
                  )}
                  {emp.num_oportunidades > 0 && (
                    <span className="font-semibold text-[#0057FF] bg-[#EEF3FF] px-2 py-0.5 rounded-lg">{emp.num_oportunidades} op.</span>
                  )}
                  <ChevronRight className="h-4 w-4 text-[#C7C7CC] group-hover:text-[#0057FF] transition-colors" />
                </div>
              </Link>
            ))}
            {items.length === 0 && (
              <div className="text-center py-20">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#EEF3FF] to-[#D6E4FF] flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-8 w-8 text-[#0057FF]" />
                </div>
                <p className="text-[15px] font-bold text-[#3A3A3C]">Nenhuma empresa encontrada</p>
                <p className="text-[13px] text-[#8E8E93] mt-1 mb-5">Cadastre a primeira empresa do CRM</p>
                <ButtonLink href="/empresas/nova" size="sm">Criar empresa</ButtonLink>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
