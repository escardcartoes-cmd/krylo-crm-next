"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Props { initial?: Record<string, any>; opId?: number; }

const ETAPAS = [
  { value: "prospect",   label: "Prospect" },
  { value: "contato",    label: "Contato" },
  { value: "proposta",   label: "Proposta" },
  { value: "negociacao", label: "Negociação" },
  { value: "fechado",    label: "Implantação" },
  { value: "perdido",    label: "Perdido" },
];

const inputCls = "w-full h-9 px-3 rounded-lg border border-[#CBD5E1] bg-white text-[13px] text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15 transition-colors";

function Field({ label, children, span2, required }: { label: string; children: React.ReactNode; span2?: boolean; required?: boolean }) {
  return (
    <div className={span2 ? "sm:col-span-2" : ""}>
      <label className="block text-[12px] font-medium text-[#334155] mb-1.5">
        {label}{required && <span className="text-[#DC2626] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[13px] font-semibold text-[#0F172A] pb-3 border-b border-[#F1F5F9] mb-4">{children}</h3>;
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
    if (n > 0 && m > 0) set("valor_estimado", String(n * m));
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
      toast.success(opId ? "Oportunidade atualizada" : "Oportunidade criada");
      router.push(`/oportunidades/${data.id ?? opId}`);
    },
    onError: (err: any) => toast.error(err.response?.data?.error ?? "Erro ao salvar"),
  });

  return (
    <div className="surface-card rounded-xl max-w-3xl">
      <form onSubmit={e => { e.preventDefault(); mutation.mutate(); }} className="p-6 space-y-8">

        <div>
          <SectionTitle>Identificação</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3.5">
            <Field label="Título" required span2>
              <input className={inputCls} value={form.titulo} onChange={e => set("titulo", e.target.value)} required placeholder="Ex: Implantação Private Label" />
            </Field>
            <Field label="Empresa" span2>
              <Select value={form.empresa_id} onValueChange={v => set("empresa_id", v)}>
                <SelectTrigger className="h-9 rounded-lg border-[#CBD5E1] bg-white text-[13px]">
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
                <SelectTrigger className="h-9 rounded-lg border-[#CBD5E1] bg-white text-[13px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ETAPAS.map(e => (
                    <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </div>

        <div>
          <SectionTitle>Projeção</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3.5">
            <Field label="Nº de cartões">
              <input
                className={inputCls} type="number" min="0" value={form.num_cartoes}
                onChange={e => { set("num_cartoes", e.target.value); calcValor(e.target.value, form.valor_mensal); }}
                placeholder="500"
              />
            </Field>
            <Field label="Receita por cartão/mês (R$)">
              <input
                className={inputCls} type="number" min="0" step="0.01" value={form.valor_mensal}
                onChange={e => { set("valor_mensal", e.target.value); calcValor(form.num_cartoes, e.target.value); }}
                placeholder="3,50"
              />
            </Field>
            <Field label="Receita mensal estimada (R$)" span2>
              <input className={inputCls} type="number" min="0" step="0.01" value={form.valor_estimado} onChange={e => set("valor_estimado", e.target.value)} placeholder="Calculado automaticamente" />
            </Field>
          </div>
        </div>

        <div>
          <SectionTitle>Detalhes</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3.5">
            <Field label="Responsável">
              <input className={inputCls} value={form.responsavel} onChange={e => set("responsavel", e.target.value)} placeholder="Nome do executivo" />
            </Field>
            <Field label="Previsão de implantação">
              <input className={inputCls} type="date" value={form.previsao_fechamento} onChange={e => set("previsao_fechamento", e.target.value)} />
            </Field>
            <Field label="Notas" span2>
              <textarea
                className={`${inputCls} h-24 py-2 resize-none`}
                value={form.notas} onChange={e => set("notas", e.target.value)} placeholder="Observações, condições especiais, histórico…" />
            </Field>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#F1F5F9]">
          <button type="button" onClick={() => router.back()}
            className="h-9 px-4 rounded-lg text-[13px] text-[#475569] hover:bg-[#F1F5F9] transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={mutation.isPending}
            className="h-9 px-4 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[13px] font-medium transition-colors disabled:opacity-60">
            {mutation.isPending ? "Salvando…" : opId ? "Salvar alterações" : "Criar oportunidade"}
          </button>
        </div>
      </form>
    </div>
  );
}
