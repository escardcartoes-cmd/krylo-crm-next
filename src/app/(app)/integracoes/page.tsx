"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Topbar } from "@/components/layout/Topbar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, XCircle, Loader2, ExternalLink, Send, Bot, Mail, MessageCircle } from "lucide-react";
import { toast } from "sonner";

const inputMonoCls =
  "w-full h-9 px-3 rounded-lg border border-[#CBD5E1] bg-white text-[13px] text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15 transition-colors font-mono";

const inputCls =
  "w-full h-9 px-3 rounded-lg border border-[#CBD5E1] bg-white text-[13px] text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15 transition-colors";

const WA_PROVIDERS = [
  { value: "__none__",  label: "Nenhum (envio manual pela fila)" },
  { value: "zapi",      label: "Z-API (recomendado, R$ 99/mês)" },
  { value: "meta_cloud", label: "Meta Cloud API (oficial)" },
  { value: "twilio",    label: "Twilio WhatsApp" },
  { value: "360dialog", label: "360dialog (BSP oficial)" },
  { value: "evolution", label: "Evolution API (self-hosted)" },
];

interface StatusItem { configurada: boolean; preview?: string; servico: string; }
interface StatusResp {
  anthropic: StatusItem; brevo: StatusItem; cron_token: StatusItem;
  brevo_webhook: StatusItem; whatsapp: StatusItem; email_remetente: StatusItem;
}

export default function IntegracoesPage() {
  const qc = useQueryClient();

  const { data: status, isLoading: statusLoading, refetch: refetchStatus } = useQuery<StatusResp>({
    queryKey: ["integracoes-status"],
    queryFn: () => api.get("/api/integracoes/status").then(r => r.data),
  });

  const { data: cfg, isLoading: cfgLoading } = useQuery({
    queryKey: ["integracoes"],
    queryFn: () => api.get("/api/integracoes").then(r => r.data),
  });

  const [form, setForm] = useState<any>({
    brevo_api_key: "", brevo_sender_email: "", brevo_sender_nome: "",
    whatsapp_provider: "", whatsapp_api_key: "", whatsapp_instance_id: "", whatsapp_sender_numero: "",
  });

  useEffect(() => {
    if (cfg) {
      setForm({
        brevo_api_key:         "",
        brevo_sender_email:    cfg.brevo_sender_email ?? "",
        brevo_sender_nome:     cfg.brevo_sender_nome ?? "",
        whatsapp_provider:     cfg.whatsapp_provider ?? "",
        whatsapp_api_key:      "",
        whatsapp_instance_id:  "",
        whatsapp_sender_numero: cfg.whatsapp_sender_numero ?? "",
      });
    }
  }, [cfg]);

  const saveMutation = useMutation({
    mutationFn: (payload: any) => api.put("/api/integracoes", payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["integracoes"] });
      qc.invalidateQueries({ queryKey: ["integracoes-status"] });
      toast.success("Integrações salvas");
    },
    onError: (err: any) => toast.error(err.response?.data?.error ?? "Erro ao salvar"),
  });

  const testEmail = useMutation({
    mutationFn: () => api.post("/api/integracoes/testar/email").then(r => r.data),
    onSuccess: (r: any) => toast.success(`E-mail de teste enviado para ${r.destinatario}`),
    onError: (err: any) => toast.error(err.response?.data?.error ?? "Falha no envio"),
  });

  const testIA = useMutation({
    mutationFn: () => api.post("/api/integracoes/testar/ia").then(r => r.data),
    onSuccess: (r: any) => toast.success(`Claude respondeu: ${r.resposta ?? "OK"}`),
    onError: (err: any) => toast.error(err.response?.data?.error ?? "Falha na IA"),
  });

  const testBrevoTenant = useMutation({
    mutationFn: () => api.post("/api/integracoes/brevo/testar").then(r => r.data),
    onSuccess: (r: any) =>
      r.ok
        ? toast.success(`Brevo OK · conta ${r.email} · plano ${r.plano ?? "—"}`)
        : toast.error(r.error ?? "Falhou"),
    onError: (err: any) => toast.error(err.response?.data?.error ?? "Erro"),
  });

  const set = (k: string, v: string) => setForm((p: any) => ({ ...p, [k]: v }));

  function submitBrevo(e: React.FormEvent) {
    e.preventDefault();
    const payload: any = {
      brevo_sender_email: form.brevo_sender_email,
      brevo_sender_nome: form.brevo_sender_nome,
    };
    if (form.brevo_api_key && !form.brevo_api_key.includes("•")) {
      payload.brevo_api_key = form.brevo_api_key;
    }
    saveMutation.mutate(payload);
  }

  function submitWA(e: React.FormEvent) {
    e.preventDefault();
    const payload: any = {
      whatsapp_provider: form.whatsapp_provider,
      whatsapp_sender_numero: form.whatsapp_sender_numero,
    };
    if (form.whatsapp_api_key && !form.whatsapp_api_key.includes("•")) {
      payload.whatsapp_api_key = form.whatsapp_api_key;
    }
    if (form.whatsapp_instance_id && !form.whatsapp_instance_id.includes("•")) {
      payload.whatsapp_instance_id = form.whatsapp_instance_id;
    }
    saveMutation.mutate(payload);
  }

  return (
    <>
      <Topbar
        title="Integrações"
        subtitle="Credenciais e serviços externos"
        actions={
          <button
            onClick={() => refetchStatus()}
            className="h-8 px-3.5 rounded-lg bg-white border border-[#CBD5E1] text-[13px] font-medium text-[#475569] hover:bg-[#F8FAFC] transition-colors"
          >
            Atualizar status
          </button>
        }
      />

      <div className="flex-1 px-8 pt-4 pb-8 space-y-4 max-w-4xl">

        {/* Config Brevo por tenant */}
        <form onSubmit={submitBrevo} className="surface-card rounded-xl p-6">
          <div className="flex items-center gap-3 pb-3 border-b border-[#F1F5F9] mb-4">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-[14px] font-semibold text-[#0F172A]">Brevo — Envio de email</h3>
              <p className="text-[12px] text-[#64748B] mt-0.5">
                Chave em{" "}
                <a href="https://app.brevo.com/settings/keys/api" target="_blank" rel="noopener noreferrer"
                   className="text-[#4F46E5] hover:underline inline-flex items-center gap-0.5">
                  app.brevo.com <ExternalLink className="h-3 w-3" />
                </a>{" "}· Remetente precisa estar verificado no Brevo
              </p>
            </div>
            {cfg?.brevo_api_key_configured && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-3 w-3" /> Configurada
              </span>
            )}
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="text-[12px] font-medium text-[#334155] mb-1.5 block">
                API Key {cfg?.brevo_api_key_configured && <span className="text-[#94A3B8] font-normal">(deixe vazio para manter)</span>}
              </label>
              <input
                className={inputMonoCls}
                value={form.brevo_api_key}
                onChange={e => set("brevo_api_key", e.target.value)}
                placeholder={cfg?.brevo_api_key ?? "xkeysib-..."}
                disabled={cfgLoading}
                autoComplete="off"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-medium text-[#334155] mb-1.5 block">Email remetente (verificado)</label>
                <input
                  className={inputCls}
                  type="email"
                  value={form.brevo_sender_email}
                  onChange={e => set("brevo_sender_email", e.target.value)}
                  placeholder="vendas@suaempresa.com.br"
                  disabled={cfgLoading}
                />
              </div>
              <div>
                <label className="text-[12px] font-medium text-[#334155] mb-1.5 block">Nome remetente</label>
                <input
                  className={inputCls}
                  value={form.brevo_sender_nome}
                  onChange={e => set("brevo_sender_nome", e.target.value)}
                  placeholder="Equipe Comercial"
                  disabled={cfgLoading}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#F1F5F9] gap-2 flex-wrap">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => testBrevoTenant.mutate()}
                disabled={testBrevoTenant.isPending}
                className="h-9 px-4 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[13px] font-medium text-[#475569] flex items-center gap-2 disabled:opacity-60 transition-colors"
              >
                {testBrevoTenant.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Validar chave
              </button>
              <button
                type="button"
                onClick={() => testEmail.mutate()}
                disabled={testEmail.isPending}
                className="h-9 px-4 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[13px] font-medium text-[#475569] flex items-center gap-2 disabled:opacity-60 transition-colors"
              >
                {testEmail.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                Enviar email de teste
              </button>
            </div>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="h-9 px-4 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[13px] font-medium flex items-center gap-2 disabled:opacity-60 transition-colors"
            >
              {saveMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Salvar
            </button>
          </div>
        </form>

        {/* Config WhatsApp por tenant */}
        <form onSubmit={submitWA} className="surface-card rounded-xl p-6">
          <div className="flex items-center gap-3 pb-3 border-b border-[#F1F5F9] mb-4">
            <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-[14px] font-semibold text-[#0F172A]">WhatsApp — Disparo automático</h3>
              <p className="text-[12px] text-[#64748B] mt-0.5">
                Opcional. Sem provedor, mensagens vão pra <a href="/fila-whatsapp" className="text-[#4F46E5] hover:underline">/fila-whatsapp</a> pra envio manual.
              </p>
            </div>
            {cfg?.whatsapp_api_key_configured && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-3 w-3" /> Configurada
              </span>
            )}
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="text-[12px] font-medium text-[#334155] mb-1.5 block">Provedor</label>
              <Select
                value={form.whatsapp_provider || "__none__"}
                onValueChange={v => set("whatsapp_provider", v === "__none__" ? "" : v)}
              >
                <SelectTrigger className="h-9 rounded-lg border-[#CBD5E1] bg-white text-[13px]">
                  <SelectValue placeholder="Selecionar provedor" />
                </SelectTrigger>
                <SelectContent>
                  {WA_PROVIDERS.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {form.whatsapp_provider && (
              <>
                <div>
                  <label className="text-[12px] font-medium text-[#334155] mb-1.5 block">
                    API Token {cfg?.whatsapp_api_key_configured && <span className="text-[#94A3B8] font-normal">(vazio para manter)</span>}
                  </label>
                  <input
                    className={inputMonoCls}
                    value={form.whatsapp_api_key}
                    onChange={e => set("whatsapp_api_key", e.target.value)}
                    placeholder={cfg?.whatsapp_api_key ?? "Token do provedor"}
                    disabled={cfgLoading}
                    autoComplete="off"
                  />
                </div>
                {(form.whatsapp_provider === "zapi" || form.whatsapp_provider === "evolution") && (
                  <div>
                    <label className="text-[12px] font-medium text-[#334155] mb-1.5 block">
                      {form.whatsapp_provider === "zapi" ? "Instance ID (Z-API)" : "Instance Name (Evolution)"}
                    </label>
                    <input
                      className={inputMonoCls}
                      value={form.whatsapp_instance_id}
                      onChange={e => set("whatsapp_instance_id", e.target.value)}
                      placeholder={cfg?.whatsapp_instance_id ?? "abc123..."}
                      disabled={cfgLoading}
                      autoComplete="off"
                    />
                  </div>
                )}
                <div>
                  <label className="text-[12px] font-medium text-[#334155] mb-1.5 block">Número remetente</label>
                  <input
                    className={inputCls}
                    value={form.whatsapp_sender_numero}
                    onChange={e => set("whatsapp_sender_numero", e.target.value)}
                    placeholder="5527999999999 (DDI + DDD + número)"
                    disabled={cfgLoading}
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end pt-4 mt-4 border-t border-[#F1F5F9]">
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="h-9 px-4 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[13px] font-medium flex items-center gap-2 disabled:opacity-60 transition-colors"
            >
              {saveMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Salvar
            </button>
          </div>
        </form>

        {/* Status env vars globais (read-only) */}
        <div className="surface-card rounded-xl p-6">
          <div className="pb-3 border-b border-[#F1F5F9] mb-4">
            <h3 className="text-[14px] font-semibold text-[#0F172A]">Chaves globais Krylo (fallback)</h3>
            <p className="text-[12px] text-[#64748B] mt-0.5">
              Usadas quando o tenant não tem chave própria. Editar em{" "}
              <a href="https://railway.app" target="_blank" rel="noopener noreferrer" className="text-[#4F46E5] hover:underline inline-flex items-center gap-0.5">
                Railway <ExternalLink className="h-3 w-3" />
              </a>{" "}→ Variables.
            </p>
          </div>

          {statusLoading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
            </div>
          ) : status ? (
            <div className="space-y-2">
              <EnvRow name="ANTHROPIC_API_KEY" item={status.anthropic}
                docsUrl="https://console.anthropic.com/settings/keys"
                action={
                  <button
                    onClick={() => testIA.mutate()}
                    disabled={!status.anthropic.configurada || testIA.isPending}
                    className="h-8 px-3 rounded-md bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[12px] font-medium text-[#475569] flex items-center gap-1.5 disabled:opacity-40 transition-colors"
                  >
                    {testIA.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Bot className="h-3 w-3" />}
                    Testar
                  </button>
                }
              />
              <EnvRow name="BREVO_API_KEY" item={status.brevo} />
              <EnvRow name="EMAIL_ONBOARDING" item={status.email_remetente} />
              <EnvRow name="KRYLO_WHATSAPP" item={status.whatsapp} />
              <EnvRow name="CRON_TOKEN" item={status.cron_token} />
              <EnvRow name="BREVO_WEBHOOK_SECRET" item={status.brevo_webhook} />
            </div>
          ) : (
            <p className="text-[13px] text-[#94A3B8] text-center py-6">Erro ao carregar status.</p>
          )}
        </div>
      </div>
    </>
  );
}

function EnvRow({ name, item, action, docsUrl }: {
  name: string; item: StatusItem;
  action?: React.ReactNode; docsUrl?: string;
}) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#F8FAFC] transition-colors">
      {item.configurada
        ? <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
        : <XCircle className="h-4 w-4 text-rose-500 flex-shrink-0" />}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <code className="text-[12px] font-mono text-[#0F172A] font-semibold">{name}</code>
          {item.preview && (
            <span className="text-[11px] font-mono text-[#64748B] bg-[#F1F5F9] px-1.5 py-0.5 rounded">{item.preview}</span>
          )}
        </div>
        <p className="text-[11.5px] text-[#94A3B8] mt-0.5">{item.servico}</p>
      </div>
      {docsUrl && (
        <a href={docsUrl} target="_blank" rel="noopener noreferrer"
           className="text-[11.5px] text-[#64748B] hover:text-[#0F172A] inline-flex items-center gap-1 flex-shrink-0">
          docs <ExternalLink className="h-3 w-3" />
        </a>
      )}
      {action}
    </div>
  );
}
