"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Target, CreditCard, DollarSign, ArrowRight, TrendingUp, User } from "lucide-react";

interface Props { initial?: Record<string, any>; opId?: number; }

const ETAPAS = [
  { value: "prospect",   label: "Prospecção",    desc: "Lead identificado, sem contato" },
  { value: "contato",    label: "Contato feito", desc: "Primeiro contato realizado" },
  { value: "proposta",   label: "Proposta",      desc: "Proposta comercial enviada" },
  { value: "negociacao", label: "Negociação",    desc: "Em negociação de condições" },
  { value: "fechado",    label: "Implantação",   desc: "Contrato assinado, em implantação" },
  { value: "perdido",    label: "Perdido",       desc: "Negociação encerrada" },
];

const ETAPA_COLORS: Record<string, { bg: string; text: string }> = {
  prospect:   { bg: "bg-[#F1F5F9]",  text: "text-[#64748B]" },
  contato:    { bg: "tint-blue",     text: "text-[#4F46E5]" },
  proposta:   { bg: "tint-amber",    text: "text-amber-700" },
  negociacao: { bg: "bg-orange-50",  text: "text-orange-700" },
  fechado:    { bg: "tint-emerald",  text: "text-emerald-700" },
  perdido:    { bg: "tint-rose",     text: "text-rose-700" },
};

const inputCls = "w-full h-10 pl-3.5 pr-3.5 rounded-xl bg-white border border-[rgba(15,23,42,0.08)] text-[13px] text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 transition-all shadow-sm";
const selectTriggerCls = "h-10 rounded-xl border border-[rgba(15,23,42,0.08)] bg-white text-[13px] shadow-sm";

function Field({ label, children, span2 }: { label: string; children: React.ReactNode; span2?: boolean }) {
  return (
    <div className={span2 ? "sm:col-span-2" : ""}>
      <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const SECTION_STYLES = {
  blue:    { wrap: "tint-blue",    color: "text-[#4F46E5]" },
  emerald: { wrap: "tint-emerald", color: "text-emerald-700" },
  violet:  { wrap: "tint-violet",  color: "text-violet-700" },
} as const;

function SectionHeader({ icon: Icon, label, color }: {
  icon: React.ComponentType<{className?: string}>;
  label: string;
  color: keyof typeof SECTION_STYLES;
}) {
  const s = SECTION_STYLES[color];
  return (
    <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl ${s.wrap} mb-4`}>
      <Icon className={`h-4 w-4 ${s.color}`} />
      <span className={`text-[12px] font-bold uppercase tracking-wider ${s.color}`}>{label}</span>
    </div>
  );
}

function fmt(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

export function OportunidadeForm({ initial = {}, opId }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const qc = useQueryClient();

  const { data: empresasData } = useQuery({
    queryKey: ["empresas", ""],
    queryFn: () => api.get("/api/empresas", { params: { per_page: 200 } }).then(r => r.data),
  });

  const [form, setForm] = useState({
    titulo:              initial.titulo ?? "",
    empresa_id:          String(initial.empresa_id ?? params.get("empresa_id") ?? ""),
    etapa:               initial.etapa ?? "prospect",
    num_cartoes:         String(initial.num_cartoes ?? ""),
    valor_estimado:      String(initial.valor_estimado ?? ""),
    valor_mensal:        String(initial.valor_mensal ?? ""),
    responsavel:         initial.responsavel ?? "",
    previsao_fechamento: initial.previsao_fechamento ?? "",
    notas:               initial.notas ?? "",
  });

  const set = (k: string, v: string | null) => setForm(p => ({ ...p, [k]: v ?? "" }));

  function calcValor(cartoes: string, valorMensal: string) {
    const n = parseInt(cartoes) || 0;
    const m = parseFloat(valorMensal) || 0;
    if (n > 0 && m > 0) {
      set("valor_estimado", String(n * m));
    }
  }

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        ...form,
        empresa_id: form.empresa_id || null,
        num_cartoes: parseInt(form.num_cartoes) || 0,
        valor_estimado: parseFloat(form.valor_estimado) || 0,
        valor_mensal: parseFloat(form.valor_mensal) || 0,
      };
      return opId
        ? api.put(`/api/oportunidades/${opId}`, payload).then(r => r.data)
        : api.post("/api/oportunidades", payload).then(r => r.data);
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["oportunidades"] });
      toast.success(opId ? "Oportunidade atualizada!" : "Oportunidade criada!");
      router.push(`/oportunidades/${data.id ?? opId}`);
    },
    onError: (err: any) => toast.error(err.response?.data?.error ?? "Erro ao salvar"),
  });

  const numCartoes = parseInt(form.num_cartoes) || 0;
  const receitaCartao = parseFloat(form.valor_mensal) || 0;
  const receitaMensal = numCartoes * receitaCartao;
  const receitaAnual = receitaMensal * 12;
  const selectedEmpresa = empresasData?.items?.find((e: any) => String(e.id) === form.empresa_id);
  const etapaInfo = ETAPA_COLORS[form.etapa] ?? ETAPA_COLORS.prospect;

  const PROXIMOS_PASSOS: Record<string, string[]> = {
    prospect:   ["Identificar decisor", "Pesquisar empresa", "Agendar primeiro contato"],
    contato:    ["Qualificar necessidade", "Mapear concorrentes", "Apresentar solução"],
    proposta:   ["Enviar proposta formal", "Agendar reunião de revisão", "Calcular ROI para cliente"],
    negociacao: ["Definir condições finais", "Enviar contrato", "Alinhar prazo de implantação"],
    fechado:    ["Assinar contrato", "Iniciar onboarding", "Acompanhar primeiro mês"],
    perdido:    ["Registrar motivo de perda", "Marcar para futuro contato", "Analisar lições aprendidas"],
  };
  const proximosPassos = PROXIMOS_PASSOS[form.etapa] ?? [];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
      {/* LEFT: form */}
      <div className="surface-card rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-[rgba(15,23,42,0.05)]">
          <p className="text-[17px] font-extrabold text-[#0F172A] tracking-[-0.3px]">{opId ? "Editar oportunidade" : "Nova oportunidade de cartão"}</p>
          <p className="text-[13px] text-[#64748B] mt-0.5">Preencha os dados da negociação</p>
        </div>

        <form onSubmit={e => { e.preventDefault(); mutation.mutate(); }} className="p-6 space-y-6">

          <div>
            <SectionHeader icon={Target} label="Identificação" color="blue" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Título *" span2>
                <input className={inputCls} value={form.titulo} onChange={e => set("titulo", e.target.value)} required placeholder="Ex: Implantação Private Label ABC" />
              </Field>
              <Field label="Empresa" span2>
                <Select value={form.empresa_id} onValueChange={v => set("empresa_id", v)}>
                  <SelectTrigger className={selectTriggerCls}>
                    <SelectValue placeholder="Selecionar empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {empresasData?.items?.map((e: any) => (
                      <SelectItem key={e.id} value={String(e.id)}>{e.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Etapa" span2>
                <Select value={form.etapa} onValueChange={v => set("etapa", v)}>
                  <SelectTrigger className={selectTriggerCls}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ETAPAS.map(e => (
                      <SelectItem key={e.value} value={e.value}>
                        {e.label} <span className="text-[#94A3B8]">— {e.desc}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </div>

          <div>
            <SectionHeader icon={CreditCard} label="Projeção de cartões" color="emerald" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nº de cartões projetados">
                <input
                  className={inputCls} type="number" min="0" value={form.num_cartoes}
                  onChange={e => { set("num_cartoes", e.target.value); calcValor(e.target.value, form.valor_mensal); }}
                  placeholder="Ex: 500"
                />
              </Field>
              <Field label="Receita por cartão/mês (R$)">
                <input
                  className={inputCls} type="number" min="0" step="0.01" value={form.valor_mensal}
                  onChange={e => { set("valor_mensal", e.target.value); calcValor(form.num_cartoes, e.target.value); }}
                  placeholder="Ex: 3.50"
                />
              </Field>
              <Field label="Receita mensal estimada (R$)" span2>
                <input className={`${inputCls} font-bold`} type="number" min="0" step="0.01" value={form.valor_estimado} onChange={e => set("valor_estimado", e.target.value)} placeholder="Calculado automaticamente" />
                {form.num_cartoes && form.valor_mensal && (
                  <p className="text-[11px] text-[#4F46E5] mt-1.5 font-semibold">
                    {form.num_cartoes} cartões × R$ {form.valor_mensal} = R$ {(parseInt(form.num_cartoes||"0")*parseFloat(form.valor_mensal||"0")).toFixed(2)}/mês
                  </p>
                )}
              </Field>
            </div>
          </div>

          <div>
            <SectionHeader icon={User} label="Detalhes" color="violet" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Responsável">
                <input className={inputCls} value={form.responsavel} onChange={e => set("responsavel", e.target.value)} placeholder="Nome do executivo" />
              </Field>
              <Field label="Previsão de implantação">
                <input className={inputCls} type="date" value={form.previsao_fechamento} onChange={e => set("previsao_fechamento", e.target.value)} />
              </Field>
              <Field label="Notas" span2>
                <textarea
                  className="w-full px-3.5 py-2.5 h-24 rounded-xl bg-white border border-[rgba(15,23,42,0.08)] text-[13px] text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 transition-all shadow-sm resize-none"
                  value={form.notas} onChange={e => set("notas", e.target.value)} placeholder="Observações, condições especiais, histórico…" />
              </Field>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-[rgba(15,23,42,0.05)]">
            <button type="submit" disabled={mutation.isPending}
              className="h-10 px-6 rounded-xl text-white text-[13px] font-semibold transition-all active:scale-[0.98] disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg,#4F46E5,#6366F1)",
                boxShadow: "0 4px 12px rgba(79,70,229,0.3)",
              }}>
              {mutation.isPending ? "Salvando…" : "Salvar oportunidade"}
            </button>
            <button type="button" onClick={() => router.back()}
              className="h-10 px-4 rounded-xl bg-white text-[#334155] border border-[rgba(15,23,42,0.1)] text-[13px] font-semibold hover:bg-[#F8FAFC] transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      </div>

      {/* RIGHT */}
      <div className="space-y-4 xl:sticky xl:top-4 h-fit">
        {/* Revenue calculator */}
        <div className="surface-card rounded-2xl overflow-hidden">
          <div className="px-4 py-3 tint-emerald flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-700" />
            <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Calculadora de Receita</p>
          </div>
          <div className="p-4">
            {receitaMensal > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-[#64748B]">Cartões projetados</span>
                  <span className="font-bold text-[#0F172A]">{numCartoes.toLocaleString("pt-BR")}</span>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-[#64748B]">Receita por cartão/mês</span>
                  <span className="font-bold text-[#0F172A]">{fmt(receitaCartao)}</span>
                </div>

                <div className="my-2 h-px bg-[rgba(15,23,42,0.06)]" />

                <div className="rounded-xl tint-emerald p-3">
                  <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1">Receita mensal</p>
                  <p className="text-[22px] font-extrabold text-emerald-700 tracking-[-0.5px]">{fmt(receitaMensal)}</p>
                </div>
                <div
                  className="rounded-xl p-3 text-white"
                  style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)" }}
                >
                  <p className="text-[10px] font-bold text-white/70 uppercase tracking-wider mb-1">Receita anual (12 meses)</p>
                  <p className="text-[22px] font-extrabold tracking-[-0.5px]">{fmt(receitaAnual)}</p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-1">
                  <span>ROI por cartão/ano</span>
                  <span className="font-bold text-[#0F172A]">{fmt(receitaCartao * 12)}</span>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center">
                <DollarSign className="h-8 w-8 text-[#CBD5E1] mx-auto mb-2" />
                <p className="text-[12px] text-[#64748B]">Informe o número de cartões e a receita por cartão para ver a projeção</p>
              </div>
            )}
          </div>
        </div>

        {/* Status pill + empresa preview */}
        <div className="surface-card rounded-2xl overflow-hidden">
          <div className="px-4 py-3 tint-violet">
            <p className="text-[11px] font-bold text-violet-700 uppercase tracking-wider">Status da oportunidade</p>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              {ETAPAS.map(e => (
                <span
                  key={e.value}
                  className={`text-[11px] font-bold px-2 py-1 rounded-md transition-all ${
                    e.value === form.etapa
                      ? `${etapaInfo.bg} ${etapaInfo.text} ring-1 ring-current/20 shadow-sm`
                      : "bg-[#F1F5F9] text-[#CBD5E1]"
                  }`}
                >
                  {e.label}
                </span>
              ))}
            </div>
            {selectedEmpresa && (
              <div className="flex items-center gap-2 pt-3 border-t border-[rgba(15,23,42,0.05)]">
                <div className="h-8 w-8 rounded-lg tint-blue flex items-center justify-center flex-shrink-0">
                  <ArrowRight className="h-4 w-4 text-[#4F46E5]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-[#0F172A] truncate">{selectedEmpresa.nome}</p>
                  {selectedEmpresa.segmento && <p className="text-[11px] text-[#64748B]">{selectedEmpresa.segmento}</p>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Próximos passos */}
        <div className="surface-card rounded-2xl overflow-hidden">
          <div className="px-4 py-3 tint-blue">
            <p className="text-[11px] font-bold text-[#4F46E5] uppercase tracking-wider">
              Próximos passos — {ETAPAS.find(e => e.value === form.etapa)?.label}
            </p>
          </div>
          <div className="p-4">
            <div className="space-y-2.5">
              {proximosPassos.map((passo, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="h-5 w-5 rounded-full tint-blue flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[9px] font-extrabold text-[#4F46E5]">{i + 1}</span>
                  </div>
                  <p className="text-[12px] text-[#475569] leading-snug">{passo}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
