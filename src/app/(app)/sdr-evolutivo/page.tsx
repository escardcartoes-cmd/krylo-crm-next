"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Topbar } from "@/components/layout/Topbar";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot, Loader2 } from "lucide-react";
import { toast } from "sonner";

const FUNIL = [
  { key: "prospectado",       label: "Prospectado",       bg: "bg-[#EBF0FF]", text: "text-[#0057FF]" },
  { key: "email_enviado",     label: "Email Enviado",     bg: "bg-[#E8F8F5]", text: "text-[#0E7C6B]" },
  { key: "whatsapp_enviado",  label: "WhatsApp Enviado",  bg: "bg-[#EDFAF3]", text: "text-[#1A7F4B]" },
  { key: "reuniao",           label: "Reunião",           bg: "bg-[#FFF9EB]", text: "text-[#B07C00]" },
  { key: "fechou",            label: "Fechou",            bg: "bg-[#F0FBF5]", text: "text-[#15803D]" },
];

const STATS = [
  { label: "Leads com Cadência", key: "leads_com_cadencia" },
  { label: "Ecosistema de Leads", key: "ecosistema_leads" },
  { label: "Cadências Criadas", key: "cadencias_criadas" },
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
            className="h-9 px-4 bg-[#0057FF] text-white rounded-xl text-[13px] font-semibold hover:bg-[#0046CC] disabled:opacity-60 transition-colors flex items-center gap-2"
            onClick={executarSDR}
            disabled={running}
          >
            {running ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Executando…</> : "Executar Agora"}
          </button>
        }
      />
      <div className="px-7 pt-4 pb-7 space-y-4">
        {/* Top stats */}
        <div className="grid grid-cols-3 gap-3">
          {STATS.map((s) => (
            <div
              key={s.key}
              className="bg-white rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)] px-5 py-4"
            >
              {isLoading ? (
                <Skeleton className="h-9 w-16 mb-1" />
              ) : (
                <p className="text-[28px] font-bold text-[#1C1C1E] leading-none mb-1">{data?.[s.key] ?? 0}</p>
              )}
              <p className="text-[12px] text-[#8E8E93]">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Funil SDR */}
        <div className="bg-white rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)] px-5 py-4">
          <p className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-4">Funil SDR</p>
          <div className="flex gap-3 flex-wrap">
            {FUNIL.map((f) => (
              <div
                key={f.key}
                className={`flex-1 min-w-24 rounded-xl p-4 text-center ${f.bg}`}
              >
                {isLoading ? (
                  <Skeleton className="h-8 w-8 mx-auto mb-1" />
                ) : (
                  <p className={`text-[24px] font-bold ${f.text}`}>{data?.[f.key] ?? 0}</p>
                )}
                <p className={`text-[11px] font-semibold mt-1 ${f.text}`}>{f.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Última execução */}
        <div className="bg-white rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)] px-5 py-4">
          <p className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-4">Última execução</p>
          <div className="flex flex-col items-center py-8 text-center">
            <div className="h-12 w-12 rounded-2xl bg-[#F2F2F7] flex items-center justify-center mb-3">
              <Bot className="h-6 w-6 text-[#C7C7CC]" />
            </div>
            <p className="text-[13px] font-semibold text-[#1C1C1E] mb-1">Nenhuma execução registrada</p>
            <p className="text-[12px] text-[#8E8E93]">Clique em "Executar Agora" para começar</p>
          </div>
        </div>
      </div>
    </>
  );
}
