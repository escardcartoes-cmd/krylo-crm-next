"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Topbar } from "@/components/layout/Topbar";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight } from "lucide-react";

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pendente:   { bg: "bg-amber-100",   text: "text-amber-700",   label: "Pendente" },
  enviado:    { bg: "bg-sky-100",     text: "text-sky-700",     label: "Enviado" },
  respondido: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Respondido" },
  cancelado:  { bg: "bg-slate-100",   text: "text-slate-600",   label: "Cancelado" },
};

export default function CadenciasPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["cadencias"],
    queryFn: () => api.get("/api/cadencias").then((r) => r.data),
  });

  const items: any[] = data?.items ?? [];

  return (
    <>
      <Topbar title="Cadências" />
      <div className="flex-1 px-8 pt-4 pb-8 space-y-4">
        {isLoading ? (
          <div className="surface-card rounded-xl divide-y divide-[#F1F5F9]">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-[60px]" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="surface-card rounded-xl py-16 text-center">
            <p className="text-[14px] text-[#475569]">Nenhuma cadência ativa.</p>
          </div>
        ) : (
          <div className="surface-card rounded-xl overflow-hidden">
            <ul className="divide-y divide-[#F1F5F9]">
              {items.map((c) => {
                const st = STATUS_STYLES[c.status] ?? STATUS_STYLES.pendente;
                const canais = [c.canal_email && "Email", c.canal_whatsapp && "WhatsApp"].filter(Boolean).join(" · ");
                const href = c.empresa_id ? `/empresas/${c.empresa_id}` : "#";
                return (
                  <li key={c.id}>
                    <Link href={href} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#F8FAFC] transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-medium text-[#0F172A] truncate">{c.empresa_nome}</p>
                        <div className="flex items-center gap-3 mt-0.5 text-[12px] text-[#64748B]">
                          <span>Etapa {c.etapa}</span>
                          {canais && <span>{canais}</span>}
                          {c.data_acao && <span className="tabular-nums">{c.data_acao}</span>}
                        </div>
                      </div>
                      <span className={`inline-flex items-center text-[11px] font-medium px-1.5 py-0.5 rounded ${st.bg} ${st.text}`}>
                        {st.label}
                      </span>
                      <ChevronRight className="h-4 w-4 text-[#94A3B8] flex-shrink-0" />
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
