"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Topbar } from "@/components/layout/Topbar";
import { ButtonLink } from "@/components/ui/button-link";
import { Search, User, Mail, Phone, Building2, ChevronRight } from "lucide-react";
import Link from "next/link";

const GRADIENT_PAIRS: [string, string][] = [
  ["#4F46E5", "#7C3AED"],
  ["#7C3AED", "#A855F7"],
  ["#0EA5E9", "#22D3EE"],
  ["#10B981", "#34D399"],
  ["#F59E0B", "#FBBF24"],
  ["#EF4444", "#F87171"],
];

function getGradient(name: string): [string, string] {
  const idx = (name?.charCodeAt(0) ?? 0) % GRADIENT_PAIRS.length;
  return GRADIENT_PAIRS[idx];
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
        subtitle={data ? `${data.total} ${data.total === 1 ? "contato" : "contatos"}` : "Contatos cadastrados"}
        actions={<ButtonLink href="/contatos/novo" size="sm">+ Novo contato</ButtonLink>}
      />
      <div className="flex-1 px-8 pt-4 pb-8 space-y-5">

        {/* Search row */}
        <div className="flex gap-2.5">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
            <input
              className="w-full h-10 pl-10 pr-3.5 rounded-xl bg-white border border-[rgba(15,23,42,0.08)] text-[13px] text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 transition-all shadow-sm"
              placeholder="Buscar por nome, e-mail ou cargo…"
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
            {items.map((c: any) => {
              const [g1, g2] = getGradient(c.nome ?? "");
              return (
                <Link
                  key={c.id}
                  href={`/contatos/${c.id}/editar`}
                  className="surface-card surface-card-hover flex items-center gap-4 px-5 py-4 rounded-2xl group transition-all"
                >
                  <div
                    className="h-11 w-11 rounded-full flex items-center justify-center text-white text-[14px] font-bold flex-shrink-0 shadow-sm"
                    style={{ background: `linear-gradient(135deg, ${g1}, ${g2})` }}
                  >
                    {getInitials(c.nome)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[14px] font-bold text-[#0F172A] truncate">{c.nome}</p>
                      {c.cargo && (
                        <span className="text-[11px] font-semibold text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-md flex-shrink-0">{c.cargo}</span>
                      )}
                    </div>
                    {c.empresa_nome && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md tint-blue text-[#4F46E5]">
                          <Building2 className="h-3 w-3" />
                          {c.empresa_nome}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-[12px] text-[#64748B] flex-shrink-0">
                    {c.email && (
                      <span className="hidden sm:flex items-center gap-1">
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
                    <ChevronRight className="h-4 w-4 text-[#CBD5E1] group-hover:text-[#4F46E5] transition-colors" />
                  </div>
                </Link>
              );
            })}
            {items.length === 0 && (
              <div className="surface-card rounded-2xl py-16 text-center">
                <div className="h-16 w-16 rounded-2xl tint-blue flex items-center justify-center mx-auto mb-4">
                  <User className="h-8 w-8 text-[#4F46E5]" />
                </div>
                <p className="text-[15px] font-bold text-[#0F172A]">Nenhum contato encontrado</p>
                <p className="text-[13px] text-[#64748B] mt-1 mb-5">Comece adicionando o primeiro contato</p>
                <ButtonLink href="/contatos/novo" size="sm">+ Criar contato</ButtonLink>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
