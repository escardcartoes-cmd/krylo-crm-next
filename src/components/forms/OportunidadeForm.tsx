"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Target, CreditCard, DollarSign, ArrowRight, TrendingUp, User, Calendar } from "lucide-react";

interface Props { initial?: Record<string, any>; opId?: number; }

const ETAPAS = [
  { value: "prospect",   label: "Prospecção",    desc: "Lead identificado, sem contato" },
  { value: "contato",    label: "Contato feito",  desc: "Primeiro contato realizado" },
  { value: "proposta",   label: "Proposta",       desc: "Proposta comercial enviada" },
  { value: "negociacao", label: "Negociação",     desc: "Em negociação de condições" },
  { value: "fechado",    label: "Implantação",    desc: "Contrato assinado, em implantação" },
  { value: "perdido",    label: "Perdido",        desc: "Negociação encerrada" },
];

const ETAPA_COLORS: Record<string, { bg: string; text: string }> = {
  prospect:   { bg: "bg-[#F2F2F7]",  text: "text-[#8E8E93]" },
  contato:    { bg: "bg-[#EEF3FF]",  text: "text-[#0057FF]" },
  proposta:   { bg: "bg-[#FFF8E8]",  text: "text-[#B07D00]" },
  negociacao: { bg: "bg-[#FFF3E8]",  text: "text-[#C05000]" },
  fechado:    { bg: "bg-[#E8F9F0]",  text: "text-[#1A7F4B]" },
  perdido:    { bg: "bg-[#FFF1F0]",  text: "text-[#FF3B30]" },
};

const inputCls = "w-full h-9 px-3.5 rounded-xl border border-[rgba(0,0,0,0.1)] bg-[#F9F9FB] text-[13px] text-[#1C1C1E] placeholder-[#C7C7CC] outline-none focus:border-[#0057FF] focus:ring-2 focus:ring-[#0057FF]/10 transition-all";

function Field({ label, children, span2 }: { label: string; children: React.ReactNode; span2?: boolean }) {
  return (
    <div className={span2 ? "sm:col-span-2" : ""}>
      <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function SectionHeader({ icon: Icon, label, color }: { icon: React.ComponentType<{className?: string}>; label: string; color: "blue" | "green" | "purple" }) {
  const styles = {
    blue:   { wrap: "bg-gradient-to-r from-[#EEF3FF] to-[#F5F8FF]", icon: "text-[#0057FF] bg-[#0057FF]/10", text: "text-[#0057FF]" },
    green:  { wrap: "bg-gradient-to-r from-[#E8F9F0] to-[#F0FDF8]", icon: "text-[#1A7F4B] bg-[#1A7F4B]/10", text: "text-[#1A7F4B]" },
    purple: { wrap: "bg-gradient-to-r from-[#F5EEFF] to-[#FAF5FF]", icon: "text-[#AF52DE] bg-[#AF52DE]/10", text: "text-[#AF52DE]" },
  }[color];
  return (
    <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl mb-4 ${styles.wrap}`}>
      <div className={`h-6 w-6 rounded-lg flex items-center justify-center flex-shrink-0 ${styles.icon}`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <span className={`text-[12px] font-bold uppercase tracking-wider ${styles.text}`}>{label}</span>
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
      <div className="bg-white rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_2px_12px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[rgba(0,0,0,0.06)] bg-gradient-to-r from-white to-[#F9FAFF]">
          <p className="text-[15px] font-bold text-[#1C1C1E]">{opId ? "Editar oportunidade" : "Nova oportunidade de cartão"}</p>
          <p className="text-[12px] text-[#8E8E93] mt-0.5">Preencha os dados da negociação</p>
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
                  <SelectTrigger className="h-9 rounded-xl border border-[rgba(0,0,0,0.1)] bg-[#F9F9FB] text-[13px]">
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
                  <SelectTrigger className="h-9 rounded-xl border border-[rgba(0,0,0,0.1)] bg-[#F9F9FB] text-[13px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ETAPAS.map(e => (
                      <SelectItem key={e.value} value={e.value}>
                        {e.label} <span className="text-[#8E8E93]">— {e.desc}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </div>

          <div>
            <SectionHeader icon={CreditCard} label="Projeção de cartões" color="green" />
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
                <input className={`${inputCls} font-semibold`} type="number" min="0" step="0.01" value={form.valor_estimado} onChange={e => set("valor_estimado", e.target.value)} placeholder="Calculado automaticamente" />
                {form.num_cartoes && form.valor_mensal && (
                  <p className="text-[11px] text-[#0057FF] mt-1 font-medium">
                    {form.num_cartoes} cartões × R$ {form.valor_mensal} = R$ {(parseInt(form.num_cartoes||"0")*parseFloat(form.valor_mensal||"0")).toFixed(2)}/mês
                  </p>
                )}
              </Field>
            </div>
          </div>

          <div>
            <SectionHeader icon={User} label="Detalhes" color="purple" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Responsável">
                <input className={inputCls} value={form.responsavel} onChange={e => set("responsavel", e.target.value)} placeholder="Nome do executivo" />
              </Field>
              <Field label="Previsão de implantação">
                <input className={inputCls} type="date" value={form.previsao_fechamento} onChange={e => set("previsao_fechamento", e.target.value)} />
              </Field>
              <Field label="Notas" span2>
                <textarea className={`${inputCls} h-20 py-2.5 resize-none`} value={form.notas} onChange={e => set("notas", e.target.value)} placeholder="Observações, condições especiais, histórico…" />
              </Field>
            </div>
          </div>

          <div className="flex gap-3 pt-2 border-t border-[rgba(0,0,0,0.05)]">
            <button type="submit" disabled={mutation.isPending} className="h-9 px-6 bg-[#0057FF] text-white rounded-xl text-[13px] font-semibold hover:bg-[#0047D4] disabled:opacity-60 transition-colors shadow-[0_2px_8px_rgba(0,87,255,0.3)]">
              {mutation.isPending ? "Salvando…" : "Salvar oportunidade"}
            </button>
            <button type="button" onClick={() => router.back()} className="h-9 px-4 rounded-xl text-[13px] text-[#8E8E93] hover:text-[#3A3A3C] hover:bg-[rgba(0,0,0,0.04)] transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      </div>

      {/* RIGHT: revenue calculator + next steps */}
      <div className="space-y-4">
        {/* Revenue calculator */}
        <div className="bg-white rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_2px_12px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-[#E8F9F0] to-[#F0FDF8] border-b border-[rgba(26,127,74,0.08)]">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-[#1A7F4B]" />
              <p className="text-[11px] font-bold text-[#1A7F4B] uppercase tracking-wider">Calculadora de Receita</p>
            </div>
          </div>
          <div className="p-4">
            {receitaMensal > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-[#8E8E93]">Cartões projetados</span>
                  <span className="font-semibold text-[#1C1C1E]">{numCartoes.toLocaleString("pt-BR")}</span>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-[#8E8E93]">Receita por cartão/mês</span>
                  <span className="font-semibold text-[#1C1C1E]">{fmt(receitaCartao)}</span>
                </div>

                <div className="my-2 h-px bg-[rgba(0,0,0,0.06)]" />

                <div className="rounded-xl bg-gradient-to-br from-[#E8F9F0] to-[#D4F5E5] p-3">
                  <p className="text-[10px] font-bold text-[#1A7F4B] uppercase tracking-wider mb-1">Receita mensal</p>
                  <p className="text-[22px] font-extrabold text-[#1A7F4B] tracking-[-0.5px]">{fmt(receitaMensal)}</p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-[#EEF3FF] to-[#D6E4FF] p-3">
                  <p className="text-[10px] font-bold text-[#0057FF] uppercase tracking-wider mb-1">Receita anual (12 meses)</p>
                  <p className="text-[22px] font-extrabold text-[#0057FF] tracking-[-0.5px]">{fmt(receitaAnual)}</p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#8E8E93] pt-1">
                  <span>ROI por cartão/ano</span>
                  <span className="font-semibold text-[#1C1C1E]">{fmt(receitaCartao * 12)}</span>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center">
                <DollarSign className="h-8 w-8 text-[#E5E5EA] mx-auto mb-2" />
                <p className="text-[12px] text-[#8E8E93]">Informe o número de cartões e a receita por cartão para ver a projeção</p>
              </div>
            )}
          </div>
        </div>

        {/* Status pill + empresa preview */}
        <div className="bg-white rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_2px_12px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-[#F5EEFF] to-[#FAF5FF] border-b border-[rgba(175,82,222,0.08)]">
            <p className="text-[11px] font-bold text-[#AF52DE] uppercase tracking-wider">Status da oportunidade</p>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              {ETAPAS.map(e => (
                <span
                  key={e.value}
                  className={`text-[11px] font-semibold px-2 py-1 rounded-lg transition-all ${
                    e.value === form.etapa
                      ? `${etapaInfo.bg} ${etapaInfo.text} shadow-sm ring-1 ring-current/20`
                      : "bg-[#F2F2F7] text-[#C7C7CC]"
                  }`}
                >
                  {e.label}
                </span>
              ))}
            </div>
            {selectedEmpresa && (
              <div className="flex items-center gap-2 pt-2 border-t border-[rgba(0,0,0,0.05)]">
                <div className="h-7 w-7 rounded-lg bg-[#EEF3FF] flex items-center justify-center flex-shrink-0">
                  <ArrowRight className="h-3.5 w-3.5 text-[#0057FF]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold text-[#1C1C1E] truncate">{selectedEmpresa.nome}</p>
                  {selectedEmpresa.segmento && <p className="text-[11px] text-[#8E8E93]">{selectedEmpresa.segmento}</p>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Próximos passos */}
        <div className="bg-white rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_2px_12px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-[#EEF3FF] to-[#F5F8FF] border-b border-[rgba(0,87,255,0.08)]">
            <p className="text-[11px] font-bold text-[#0057FF] uppercase tracking-wider">Próximos passos — {ETAPAS.find(e => e.value === form.etapa)?.label}</p>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              {proximosPassos.map((passo, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="h-5 w-5 rounded-full bg-[#EEF3FF] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[9px] font-bold text-[#0057FF]">{i + 1}</span>
                  </div>
                  <p className="text-[12px] text-[#3A3A3C] leading-snug">{passo}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
