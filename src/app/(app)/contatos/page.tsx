"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Topbar } from "@/components/layout/Topbar";
import { ButtonLink } from "@/components/ui/button-link";
import { Search, User, Mail, Phone, Building2, ChevronRight } from "lucide-react";
import Link from "next/link";

const GRADIENT_PAIRS = [
  ["#0057FF", "#6B8EFF"],
  ["#AF52DE", "#DA8FFF"],
  ["#1A7F4B", "#34C759"],
  ["#FF9500", "#FFCC44"],
  ["#FF3B30", "#FF6B6B"],
  ["#00C7BE", "#34C7C7"],
];

function getGradient(name: string): [string, string] {
  const idx = (name?.charCodeAt(0) ?? 0) % GRADIENT_PAIRS.length;
  return GRADIENT_PAIRS[idx] as [string, string];
}

function getInitials(name: string) {
  const parts = (name ?? "").trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (parts[0]?.[0] ?? "?").toUpperCase();
}

export default function ContatosPage() {
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["contatos", search],
    queryFn: () => api.get("/api/contatos", { params: { q: search, per_page: 100 } }).then((r) => r.data),
  });

  const items: any[] = data?.items ?? [];

  return (
    <>
      <Topbar
        title="Contatos"
        subtitle={data ? `${data.total} contato${data.total !== 1 ? "s" : ""}` : ""}
        actions={<ButtonLink href="/contatos/novo" size="sm">+ Novo contato</ButtonLink>}
      />
      <div className="px-7 pt-4 pb-7">
        {/* Search bar */}
        <div className="flex gap-2 mb-5">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8E8E93]" />
            <input
              className="w-full h-9 pl-9 pr-3 rounded-xl bg-white border border-[rgba(0,0,0,0.08)] text-[13px] text-[#1C1C1E] placeholder-[#C7C7CC] outline-none focus:border-[#0057FF] focus:ring-2 focus:ring-[#0057FF]/10 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
              placeholder="Buscar por nome, e-mail ou cargo…"
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
            {items.map((c: any) => {
              const [g1, g2] = getGradient(c.nome ?? "");
              return (
                <Link
                  key={c.id}
                  href={`/contatos/${c.id}/editar`}
                  className="flex items-center gap-4 px-5 py-4 bg-white rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.06)] hover:shadow-[0_0_0_1px_rgba(0,87,255,0.2),0_4px_12px_rgba(0,87,255,0.08)] transition-all group"
                >
                  {/* Avatar */}
                  <div
                    className="h-11 w-11 rounded-full flex items-center justify-center text-white text-[14px] font-bold flex-shrink-0 shadow-sm"
                    style={{ background: `linear-gradient(135deg, ${g1}, ${g2})` }}
                  >
                    {getInitials(c.nome)}
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[14px] font-semibold text-[#1C1C1E]">{c.nome}</p>
                      {c.cargo && (
                        <span className="text-[11px] text-[#8E8E93] bg-[#F2F2F7] px-2 py-0.5 rounded-lg flex-shrink-0">{c.cargo}</span>
                      )}
                    </div>
                    {c.empresa_nome && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-[#EEF3FF] text-[#0057FF]">
                          <Building2 className="h-3 w-3" />
                          {c.empresa_nome}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Contact info */}
                  <div className="flex items-center gap-4 text-[12px] text-[#8E8E93] flex-shrink-0">
                    {c.email && (
                      <span className="flex items-center gap-1 hidden sm:flex">
                        <Mail className="h-3 w-3" />
                        {c.email}
                      </span>
                    )}
                    {c.telefone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {c.telefone}
                      </span>
                    )}
                    <ChevronRight className="h-4 w-4 text-[#C7C7CC] group-hover:text-[#0057FF] transition-colors" />
                  </div>
                </Link>
              );
            })}
            {items.length === 0 && (
              <div className="text-center py-20">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#EEF3FF] to-[#D6E4FF] flex items-center justify-center mx-auto mb-4">
                  <User className="h-8 w-8 text-[#0057FF]" />
                </div>
                <p className="text-[15px] font-bold text-[#3A3A3C]">Nenhum contato encontrado</p>
                <p className="text-[13px] text-[#8E8E93] mt-1 mb-5">Comece adicionando o primeiro contato</p>
                <ButtonLink href="/contatos/novo" size="sm">Criar primeiro contato</ButtonLink>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
