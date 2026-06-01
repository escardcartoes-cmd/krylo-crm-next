"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Topbar } from "@/components/layout/Topbar";
import { Skeleton } from "@/components/ui/skeleton";
import { Phone, CheckCircle, Clock } from "lucide-react";

export default function FilaWhatsAppPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["cadencias-whatsapp"],
    queryFn: () => api.get("/api/cadencias").then((r) =>
      r.data.items.filter((c: any) => c.canal_whatsapp)
    ),
  });

  return (
    <>
      <Topbar title="Fila WhatsApp" subtitle="Mensagens pendentes de aprovação e envio" />
      <div className="px-7 pt-4 pb-7">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
          </div>
        ) : (
          <div className="space-y-2">
            {(data ?? []).map((c: any) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)] px-5 py-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-[#1C1C1E]">{c.empresa_nome}</p>
                    <p className="text-[12px] text-[#8E8E93] mt-0.5">{c.contato_whatsapp}</p>
                  </div>
                  {c.whatsapp_aprovado_em ? (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-lg bg-[#EDFAF3] text-[#1A7F4B] flex items-center gap-1 flex-shrink-0">
                      <CheckCircle className="h-3 w-3" />
                      Aprovado
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-lg bg-[#FFF9EB] text-[#B07C00] flex items-center gap-1 flex-shrink-0">
                      <Clock className="h-3 w-3" />
                      Pendente
                    </span>
                  )}
                </div>
                {c.mensagem_whatsapp && (
                  <p className="text-[13px] text-[#1C1C1E] bg-[#F9F9FB] rounded-xl px-4 py-3 whitespace-pre-line border border-[rgba(0,0,0,0.06)]">
                    {c.mensagem_whatsapp}
                  </p>
                )}
              </div>
            ))}
            {(data ?? []).length === 0 && (
              <div className="text-center py-16">
                <div className="h-12 w-12 rounded-2xl bg-[#F2F2F7] flex items-center justify-center mx-auto mb-3">
                  <Phone className="h-6 w-6 text-[#C7C7CC]" />
                </div>
                <p className="text-[13px] font-semibold text-[#1C1C1E] mb-1">Fila vazia</p>
                <p className="text-[12px] text-[#8E8E93]">Sem mensagens pendentes no momento</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
