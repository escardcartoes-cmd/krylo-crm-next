"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Topbar } from "@/components/layout/Topbar";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Phone } from "lucide-react";

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  pendente:   { bg: "tint-amber",    text: "text-amber-700" },
  enviado:    { bg: "tint-blue",     text: "text-[#4F46E5]" },
  respondido: { bg: "tint-emerald",  text: "text-emerald-700" },
  cancelado:  { bg: "bg-[#F1F5F9]",  text: "text-[#64748B]" },
};

export default function CadenciasPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["cadencias"],
    queryFn: () => api.get("/api/cadencias").then((r) => r.data),
  });

  const items: any[] = data?.items ?? [];

  return (
    <>
      <Topbar
        title="Cadências SDR"
        subtitle={data ? `${items.length} cadência${items.length !== 1 ? "s" : ""} ativa${items.length !== 1 ? "s" : ""}` : "Follow-ups automáticos"}
      />
      <div className="flex-1 px-8 pt-4 pb-8 space-y-5">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-[78px] w-full rounded-2xl" />)}
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((c: any) => {
              const statusStyle = STATUS_STYLES[c.status] ?? STATUS_STYLES.pendente;
              return (
                <div
                  key={c.id}
                  className="surface-card flex items-center gap-4 px-5 py-4 rounded-2xl"
                >
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {c.canal_email && (
                      <div className="h-9 w-9 rounded-xl tint-blue flex items-center justify-center">
                        <Mail className="h-4 w-4 text-[#4F46E5]" />
                      </div>
                    )}
                    {c.canal_whatsapp && (
                      <div className="h-9 w-9 rounded-xl tint-emerald flex items-center justify-center">
                        <Phone className="h-4 w-4 text-emerald-700" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-[#0F172A] truncate">{c.empresa_nome}</p>
                    <p className="text-[12px] text-[#64748B] mt-0.5">
                      Etapa: <span className="font-semibold">{c.etapa}</span> · {c.data_acao}
                    </p>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-1 rounded-md flex-shrink-0 ${statusStyle.bg} ${statusStyle.text}`}>
                    {c.status || "pendente"}
                  </span>
                </div>
              );
            })}
            {items.length === 0 && (
              <div className="surface-card rounded-2xl py-16 text-center">
                <div className="h-16 w-16 rounded-2xl tint-blue flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-[#4F46E5]" />
                </div>
                <p className="text-[15px] font-bold text-[#0F172A]">Nenhuma cadência ativa</p>
                <p className="text-[13px] text-[#64748B] mt-1">Execute o SDR Evolutivo para gerar cadências</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
