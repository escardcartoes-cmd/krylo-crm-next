"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Topbar } from "@/components/layout/Topbar";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot, Loader2, Users, Database, Send } from "lucide-react";
import { toast } from "sonner";

const FUNIL = [
  { key: "prospectado",       label: "Prospectado",       tint: "tint-blue",    text: "text-[#4F46E5]" },
  { key: "email_enviado",     label: "Email Enviado",     tint: "tint-sky",     text: "text-sky-700" },
  { key: "whatsapp_enviado",  label: "WhatsApp",          tint: "tint-emerald", text: "text-emerald-700" },
  { key: "reuniao",           label: "Reunião",           tint: "tint-amber",   text: "text-amber-700" },
  { key: "fechou",            label: "Fechou",            tint: "tint-violet",  text: "text-violet-700" },
];

const STATS = [
  { label: "Leads com Cadência",  key: "leads_com_cadencia", tint: "tint-blue",    icon: Users,    color: "text-[#4F46E5]" },
  { label: "Ecossistema de Leads", key: "ecosistema_leads",   tint: "tint-violet",  icon: Database, color: "text-violet-600" },
  { label: "Cadências Criadas",   key: "cadencias_criadas",  tint: "tint-emerald", icon: Send,     color: "text-emerald-600" },
];

export default function SDREvolutivoPage() {
  const [running, setRunning] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["sdr-stats"],
    queryFn: () => api.get("/api/sdr/stats").then((r) => r.data),
  });

  async function executarSDR() {
    setRunning(true);
    try {
      const r = await api.post("/api/sdr/rodar");
      toast.success(r.data.mensagem ?? "SDR iniciado!");
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? "Erro ao executar SDR");
    } finally {
      setRunning(false);
    }
  }

  return (
    <>
      <Topbar
        title="SDR Evolutivo"
        subtitle="Disparo automático de cadências para leads importados"
        actions={
          <button
            className="h-8 px-3.5 rounded-xl text-white text-[12px] font-semibold transition-all active:scale-[0.98] disabled:opacity-60 flex items-center gap-1.5"
            onClick={executarSDR}
            disabled={running}
            style={{
              background: "linear-gradient(135deg,#4F46E5,#6366F1)",
              boxShadow: "0 4px 12px rgba(79,70,229,0.3)",
            }}
          >
            {running ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Executando…</> : "Executar Agora"}
          </button>
        }
      />
      <div className="flex-1 px-8 pt-4 pb-8 space-y-5">

        {/* Top stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {STATS.map((s) => (
            <div key={s.key} className="surface-card rounded-2xl p-5 relative overflow-hidden">
              <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-60 blur-2xl ${s.tint}`} />
              <div className="relative">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 ${s.tint}`}>
                  <s.icon className={`h-[18px] w-[18px] ${s.color}`} />
                </div>
                <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-[0.06em]">{s.label}</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-[28px] font-extrabold text-[#0F172A] tracking-[-0.8px] mt-0.5 leading-none">{data?.[s.key] ?? 0}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Funil SDR */}
        <div className="surface-card rounded-2xl px-5 py-5">
          <p className="text-[12px] font-bold text-[#475569] uppercase tracking-[0.08em] mb-4">Funil SDR</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {FUNIL.map((f) => (
              <div key={f.key} className={`rounded-xl p-4 text-center ${f.tint}`}>
                {isLoading ? (
                  <Skeleton className="h-8 w-8 mx-auto mb-1" />
                ) : (
                  <p className={`text-[28px] font-extrabold tracking-[-0.5px] ${f.text}`}>{data?.[f.key] ?? 0}</p>
                )}
                <p className={`text-[11px] font-bold mt-1 ${f.text}`}>{f.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Última execução */}
        <div className="surface-card rounded-2xl px-5 py-5">
          <p className="text-[12px] font-bold text-[#475569] uppercase tracking-[0.08em] mb-4">Última execução</p>
          <div className="flex flex-col items-center py-10 text-center">
            <div className="h-16 w-16 rounded-2xl tint-blue flex items-center justify-center mb-4">
              <Bot className="h-8 w-8 text-[#4F46E5]" />
            </div>
            <p className="text-[15px] font-bold text-[#0F172A]">Nenhuma execução registrada</p>
            <p className="text-[13px] text-[#64748B] mt-1">Clique em &quot;Executar Agora&quot; para começar</p>
          </div>
        </div>
      </div>
    </>
  );
}
