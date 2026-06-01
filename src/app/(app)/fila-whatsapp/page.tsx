"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Topbar } from "@/components/layout/Topbar";
import { Skeleton } from "@/components/ui/skeleton";
import { Phone, CheckCircle, Clock, ExternalLink, X, Loader2 } from "lucide-react";
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
      toast.success("Mensagem aprovada!");
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
      <div className="flex-1 px-8 pt-4 pb-8">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((c) => {
              const aprovado = !!c.whatsapp_aprovado_em;
              const rejeitado = c.whatsapp_status === "rejeitado";
              return (
                <div key={c.id} className="surface-card rounded-2xl p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-xl tint-emerald flex items-center justify-center flex-shrink-0">
                        <Phone className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[14px] font-bold text-[#0F172A] truncate">{c.empresa_nome}</p>
                        <p className="text-[12px] text-[#64748B] mt-0.5 font-mono">{c.contato_whatsapp || "Sem telefone"}</p>
                      </div>
                    </div>
                    {aprovado ? (
                      <span className="text-[11px] font-bold px-2 py-1 rounded-md tint-emerald text-emerald-700 flex items-center gap-1 flex-shrink-0">
                        <CheckCircle className="h-3 w-3" />Aprovado
                      </span>
                    ) : rejeitado ? (
                      <span className="text-[11px] font-bold px-2 py-1 rounded-md tint-rose text-rose-700 flex items-center gap-1 flex-shrink-0">
                        <X className="h-3 w-3" />Rejeitado
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold px-2 py-1 rounded-md tint-amber text-amber-700 flex items-center gap-1 flex-shrink-0">
                        <Clock className="h-3 w-3" />Pendente
                      </span>
                    )}
                  </div>

                  {c.mensagem_whatsapp && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                      <p className="text-[13px] text-emerald-950 whitespace-pre-line leading-relaxed">{c.mensagem_whatsapp}</p>
                    </div>
                  )}

                  {!aprovado && !rejeitado && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => aprovarMutation.mutate(c.id)}
                        disabled={aprovarMutation.isPending}
                        className="h-9 px-4 rounded-xl text-white text-[12px] font-bold flex items-center gap-1.5 disabled:opacity-60 active:scale-[0.98]"
                        style={{ background: "linear-gradient(135deg,#10B981,#059669)", boxShadow: "0 4px 12px rgba(16,185,129,0.3)" }}
                      >
                        <CheckCircle className="h-3.5 w-3.5" />Aprovar
                      </button>
                      <button
                        onClick={() => rejeitarMutation.mutate(c.id)}
                        disabled={rejeitarMutation.isPending}
                        className="h-9 px-4 rounded-xl bg-white border border-[rgba(15,23,42,0.1)] text-[12px] font-semibold text-rose-600 hover:bg-rose-50 hover:border-rose-200 active:scale-[0.98] flex items-center gap-1.5 disabled:opacity-60"
                      >
                        <X className="h-3.5 w-3.5" />Rejeitar
                      </button>
                    </div>
                  )}

                  {aprovado && waLink(c) && (
                    <a
                      href={waLink(c)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-white border border-emerald-200 text-[12px] font-bold text-emerald-700 hover:bg-emerald-50"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />Abrir no WhatsApp
                    </a>
                  )}
                </div>
              );
            })}
            {items.length === 0 && (
              <div className="surface-card rounded-2xl py-16 text-center">
                <div className="h-16 w-16 rounded-2xl tint-emerald flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-8 w-8 text-emerald-600" />
                </div>
                <p className="text-[15px] font-bold text-[#0F172A]">Fila vazia</p>
                <p className="text-[13px] text-[#64748B] mt-1">Sem mensagens pendentes no momento</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
