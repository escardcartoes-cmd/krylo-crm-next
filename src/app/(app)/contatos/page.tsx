"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Topbar } from "@/components/layout/Topbar";
import { ButtonLink } from "@/components/ui/button-link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { exportCSV } from "@/lib/export";
import { Search, ChevronRight, Download, Mail, Phone, Edit, Building2 } from "lucide-react";
import Link from "next/link";

function getInitials(name: string) {
  const parts = (name ?? "").trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (parts[0]?.[0] ?? "?").toUpperCase();
}

export default function ContatosPage() {
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["contatos", search],
    queryFn: () => api.get("/api/contatos", { params: { q: search, per_page: 100 } }).then((r) => r.data),
  });

  const items: any[] = data?.items ?? [];

  const handleExport = () => {
    exportCSV("contatos.csv", items, [
      { key: "nome", label: "Nome" },
      { key: "cargo", label: "Cargo" },
      { key: "empresa_nome", label: "Empresa" },
      { key: "email", label: "E-mail" },
      { key: "telefone", label: "Telefone" },
    ]);
  };

  return (
    <>
      <Topbar
        title="Contatos"
        actions={
          <>
            <button onClick={handleExport} disabled={items.length === 0}
              className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg text-[13px] font-medium text-[#475569] bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] hover:border-[#94A3B8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <Download className="h-3.5 w-3.5" />Exportar
            </button>
            <ButtonLink href="/contatos/novo" size="sm">Novo contato</ButtonLink>
          </>
        }
      />
      <div className="flex-1 px-8 pt-4 pb-8 space-y-4">

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <p className="text-[13px] text-[#64748B]">
            {data ? `${data.total} ${data.total === 1 ? "contato" : "contatos"}` : ""}
          </p>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#94A3B8]" />
            <input
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-white border border-[#CBD5E1] text-[13px] text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15 transition-colors"
              placeholder="Buscar por nome, e-mail, cargo…"
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
            <p className="text-[14px] text-[#475569]">Nenhum contato encontrado.</p>
            <ButtonLink href="/contatos/novo" size="sm" className="mt-4">Cadastrar contato</ButtonLink>
          </div>
        ) : (
          <div className="surface-card rounded-xl overflow-hidden">
            <ul className="divide-y divide-[#F1F5F9]">
              {items.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setDetail(c)}
                    className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-[#F8FAFC] group text-left"
                  >
                    <div className="h-8 w-8 rounded-full bg-[#4F46E5] text-white text-[12px] font-medium flex items-center justify-center flex-shrink-0">
                      {getInitials(c.nome)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[14px] font-medium text-[#0F172A] truncate">{c.nome}</p>
                        {c.cargo && (
                          <span className="text-[12px] text-[#64748B]">{c.cargo}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-[12px] text-[#64748B]">
                        {c.empresa_nome && <span>{c.empresa_nome}</span>}
                        {c.email && (
                          <span className="inline-flex items-center gap-1">
                            <Mail className="h-3 w-3" />{c.email}
                          </span>
                        )}
                        {c.telefone && (
                          <span className="inline-flex items-center gap-1">
                            <Phone className="h-3 w-3" />{c.telefone}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#CBD5E1] group-hover:text-[#64748B]" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do contato</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-[#4F46E5] text-white text-[16px] font-medium flex items-center justify-center flex-shrink-0">
                  {getInitials(detail.nome)}
                </div>
                <div className="min-w-0">
                  <p className="text-[16px] font-semibold text-[#0F172A]">{detail.nome}</p>
                  {detail.cargo && (
                    <p className="text-[13px] text-[#64748B]">{detail.cargo}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-[#F1F5F9]">
                {detail.empresa_nome && (
                  <div className="flex items-center gap-2 text-[13px]">
                    <Building2 className="h-3.5 w-3.5 text-[#64748B]" />
                    {detail.empresa_id ? (
                      <Link
                        href={`/empresas/${detail.empresa_id}`}
                        className="text-[#4F46E5] hover:underline"
                      >
                        {detail.empresa_nome}
                      </Link>
                    ) : (
                      <span className="text-[#334155]">{detail.empresa_nome}</span>
                    )}
                  </div>
                )}
                {detail.email && (
                  <div className="flex items-center gap-2 text-[13px]">
                    <Mail className="h-3.5 w-3.5 text-[#64748B]" />
                    <a href={`mailto:${detail.email}`} className="text-[#4F46E5] hover:underline">{detail.email}</a>
                  </div>
                )}
                {detail.telefone && (
                  <div className="flex items-center gap-2 text-[13px]">
                    <Phone className="h-3.5 w-3.5 text-[#64748B]" />
                    <a href={`tel:${detail.telefone}`} className="text-[#4F46E5] hover:underline">{detail.telefone}</a>
                  </div>
                )}
                {detail.criado_em && (
                  <p className="text-[12px] text-[#94A3B8] pt-1">Criado em {detail.criado_em}</p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            {detail && (
              <Link
                href={`/contatos/${detail.id}/editar`}
                className="h-9 px-4 rounded-lg text-[13px] text-[#475569] hover:bg-[#F1F5F9] transition-colors inline-flex items-center gap-1.5"
                onClick={() => setDetail(null)}
              >
                <Edit className="h-3.5 w-3.5" />Editar
              </Link>
            )}
            <button
              type="button"
              onClick={() => setDetail(null)}
              className="h-9 px-4 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[13px] font-medium transition-colors"
            >
              Fechar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
