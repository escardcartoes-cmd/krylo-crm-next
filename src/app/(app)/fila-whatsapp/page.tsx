"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Topbar } from "@/components/layout/Topbar";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function FilaWhatsAppPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["cadencias-whatsapp"],
    queryFn: () => api.get("/api/cadencias").then((r) =>
      r.data.items.filter((c: any) => c.canal_whatsapp)
    ),
  });

  const aprovarMutation = useMutation({
    mutationFn: (cid: number) => api.post(`/api/whatsapp/${cid}/aprovar`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cadencias-whatsapp"] });
      toast.success("Mensagem aprovada");
    },
    onError: () => toast.error("Erro ao aprovar"),
  });

  const rejeitarMutation = useMutation({
    mutationFn: (cid: number) => api.post(`/api/whatsapp/${cid}/rejeitar`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cadencias-whatsapp"] });
      toast.success("Mensagem rejeitada");
    },
    onError: () => toast.error("Erro ao rejeitar"),
  });

  const items: any[] = data ?? [];
  const pendentes = items.filter(c => !c.whatsapp_aprovado_em && c.whatsapp_status !== "rejeitado").length;
  const aprovados = items.filter(c => c.whatsapp_aprovado_em).length;

  function waLink(c: any) {
    const fone = String(c.contato_whatsapp || "").replace(/\D/g, "");
    const msg = encodeURIComponent(c.mensagem_whatsapp || "");
    return fone ? `https://wa.me/55${fone}?text=${msg}` : "";
  }

  return (
    <>
      <Topbar
        title="Fila WhatsApp"
        subtitle={`${pendentes} pendente${pendentes !== 1 ? "s" : ""} · ${aprovados} aprovado${aprovados !== 1 ? "s" : ""}`}
      />
      <div className="flex-1 px-8 pt-4 pb-8 space-y-4">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="surface-card rounded-xl py-16 text-center">
            <p className="text-[14px] text-[#475569]">Fila vazia.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((c) => {
              const aprovado = !!c.whatsapp_aprovado_em;
              const rejeitado = c.whatsapp_status === "rejeitado";
              const status = aprovado
                ? { bg: "bg-emerald-100", text: "text-emerald-700", label: "Aprovado" }
                : rejeitado
                  ? { bg: "bg-rose-100", text: "text-rose-700", label: "Rejeitado" }
                  : { bg: "bg-amber-100", text: "text-amber-700", label: "Pendente" };
              return (
                <div key={c.id} className="surface-card rounded-xl p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[14px] font-medium text-[#0F172A] truncate">{c.empresa_nome}</p>
                      <p className="text-[12px] text-[#64748B] mt-0.5 font-mono">{c.contato_whatsapp || "Sem telefone"}</p>
                    </div>
                    <span className={`inline-flex items-center text-[11px] font-medium px-1.5 py-0.5 rounded flex-shrink-0 ${status.bg} ${status.text}`}>
                      {status.label}
                    </span>
                  </div>

                  {c.mensagem_whatsapp && (
                    <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-lg px-4 py-3">
                      <p className="text-[13px] text-[#334155] whitespace-pre-line leading-relaxed">{c.mensagem_whatsapp}</p>
                    </div>
                  )}

                  {!aprovado && !rejeitado && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => aprovarMutation.mutate(c.id)}
                        disabled={aprovarMutation.isPending}
                        className="h-8 px-3.5 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[13px] font-medium disabled:opacity-60 transition-colors"
                      >
                        Aprovar
                      </button>
                      <button
                        onClick={() => rejeitarMutation.mutate(c.id)}
                        disabled={rejeitarMutation.isPending}
                        className="h-8 px-3.5 rounded-lg bg-white border border-[#CBD5E1] text-[13px] font-medium text-[#475569] hover:bg-[#F8FAFC] disabled:opacity-60 transition-colors"
                      >
                        Rejeitar
                      </button>
                    </div>
                  )}

                  {aprovado && waLink(c) && (
                    <a
                      href={waLink(c)} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-white border border-[#CBD5E1] text-[13px] font-medium text-[#475569] hover:bg-[#F8FAFC]"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />Abrir no WhatsApp
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
