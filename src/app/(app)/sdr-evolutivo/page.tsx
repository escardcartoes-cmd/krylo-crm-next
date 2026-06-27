"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Topbar } from "@/components/layout/Topbar";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const FUNIL = [
  { key: "prospectado",      label: "Prospectado", bg: "bg-sky-100",     text: "text-sky-700" },
  { key: "email_enviado",    label: "Email",       bg: "bg-indigo-100",  text: "text-indigo-700" },
  { key: "whatsapp_enviado", label: "WhatsApp",    bg: "bg-emerald-100", text: "text-emerald-700" },
  { key: "reuniao",          label: "Reunião",     bg: "bg-amber-100",   text: "text-amber-700" },
  { key: "fechou",           label: "Fechou",      bg: "bg-violet-100",  text: "text-violet-700" },
];

const STATS = [
  { key: "leads_com_cadencia", label: "Leads com cadência" },
  { key: "ecosistema_leads",   label: "Ecossistema de leads" },
  { key: "cadencias_criadas",  label: "Cadências criadas" },
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
      toast.success(r.data.mensagem ?? "SDR iniciado");
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
        subtitle="Cadências automatizadas"
        actions={
          <button
            onClick={executarSDR} disabled={running}
            className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[13px] font-medium transition-colors disabled:opacity-60"
          >
            {running ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Executando…</> : "Executar agora"}
          </button>
        }
      />
      <div className="flex-1 px-8 pt-4 pb-8 space-y-4">

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {STATS.map((s) => (
            <div key={s.key} className="surface-card rounded-xl p-5">
              <p className="text-[12px] font-medium text-[#64748B]">{s.label}</p>
              {isLoading ? (
                <Skeleton className="h-8 w-16 mt-1" />
              ) : (
                <p className="text-[26px] font-semibold text-[#0F172A] tabular-nums mt-1 leading-none">{data?.[s.key] ?? 0}</p>
              )}
            </div>
          ))}
        </div>

        <div className="surface-card rounded-xl p-5">
          <h3 className="text-[13px] font-semibold text-[#0F172A] pb-3 border-b border-[#F1F5F9] mb-4">Funil SDR</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {FUNIL.map((f) => (
              <div key={f.key} className={`rounded-lg px-3 py-3 ${f.bg}`}>
                <p className={`text-[11px] font-medium ${f.text}`}>{f.label}</p>
                {isLoading ? (
                  <Skeleton className="h-7 w-10 mt-1" />
                ) : (
                  <p className={`text-[22px] font-semibold tabular-nums mt-0.5 leading-none ${f.text}`}>{data?.[f.key] ?? 0}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card rounded-xl p-5">
          <h3 className="text-[13px] font-semibold text-[#0F172A] pb-3 border-b border-[#F1F5F9] mb-4">Última execução</h3>
          <p className="text-[14px] text-[#94A3B8] text-center py-10">Nenhuma execução registrada.</p>
        </div>
      </div>
    </>
  );
}
