"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Topbar } from "@/components/layout/Topbar";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Phone } from "lucide-react";

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  pendente:   { bg: "bg-[#FFF9EB]", text: "text-[#B07C00]" },
  enviado:    { bg: "bg-[#EBF0FF]", text: "text-[#0057FF]" },
  respondido: { bg: "bg-[#EDFAF3]", text: "text-[#1A7F4B]" },
  cancelado:  { bg: "bg-[#F2F2F7]", text: "text-[#8E8E93]" },
};

export default function CadenciasPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["cadencias"],
    queryFn: () => api.get("/api/cadencias").then((r) => r.data),
  });

  return (
    <>
      <Topbar title="Cadências SDR" />
      <div className="px-7 pt-4 pb-7">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-[68px] w-full rounded-2xl" />)}
          </div>
        ) : (
          <div className="space-y-2">
            {(data?.items ?? []).map((c: any) => {
              const statusStyle = STATUS_STYLES[c.status] ?? STATUS_STYLES.pendente;
              return (
                <div
                  key={c.id}
                  className="flex items-center gap-4 px-5 py-4 bg-white rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)]"
                >
                  {/* Canal icons */}
                  <div className="flex items-center gap-1.5 flex-shrink-0 w-10">
                    {c.canal_email && (
                      <div className="h-7 w-7 rounded-lg bg-[#EBF0FF] flex items-center justify-center">
                        <Mail className="h-3.5 w-3.5 text-[#0057FF]" />
                      </div>
                    )}
                    {c.canal_whatsapp && (
                      <div className="h-7 w-7 rounded-lg bg-[#EDFAF3] flex items-center justify-center">
                        <Phone className="h-3.5 w-3.5 text-[#1A7F4B]" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#1C1C1E] truncate">{c.empresa_nome}</p>
                    <p className="text-[12px] text-[#8E8E93] mt-0.5">
                      Etapa: {c.etapa} · {c.data_acao}
                    </p>
                  </div>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-lg flex-shrink-0 ${statusStyle.bg} ${statusStyle.text}`}>
                    {c.status || "pendente"}
                  </span>
                </div>
              );
            })}
            {data?.items?.length === 0 && (
              <div className="text-center py-16">
                <div className="h-12 w-12 rounded-2xl bg-[#F2F2F7] flex items-center justify-center mx-auto mb-3">
                  <Mail className="h-6 w-6 text-[#C7C7CC]" />
                </div>
                <p className="text-[13px] font-semibold text-[#1C1C1E] mb-1">Nenhuma cadência ativa</p>
                <p className="text-[12px] text-[#8E8E93]">Execute o SDR Evolutivo para gerar cadências</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
