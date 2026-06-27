"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Props { initial?: Record<string, any>; empresaId?: number; }

const TIPOS_CARTAO = [
  "Private Label", "Co-branded", "Benefícios", "Refeição",
  "Alimentação", "Vale-transporte", "Multi-benefícios", "Corporativo",
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

export function EmpresaForm({ initial = {}, empresaId }: Props) {
  const router = useRouter();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    nome:               initial.nome ?? "",
    cnpj:               initial.cnpj ?? "",
    segmento:           initial.segmento ?? "",
    porte:              initial.porte ?? "",
    status:             initial.status ?? "prospect",
    telefone:           initial.telefone ?? "",
    email:              initial.email ?? "",
    cidade:             initial.cidade ?? "",
    estado:             initial.estado ?? "",
    tipo_cartao:        initial.tipo_cartao ?? "",
    nome_private_label: initial.nome_private_label ?? "",
    num_funcionarios:   String(initial.num_funcionarios ?? ""),
    valor_mensal:       String(initial.valor_mensal ?? ""),
    produtos_ativos:    initial.produtos_ativos ?? "",
    cliente_ativo:      initial.cliente_ativo ? "1" : "0",
  });

  const set = (k: string, v: string | null) => setForm(p => ({ ...p, [k]: v ?? "" }));

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        ...form,
        num_funcionarios: form.num_funcionarios ? parseInt(form.num_funcionarios) : null,
        valor_mensal: form.valor_mensal ? parseFloat(form.valor_mensal) : null,
        cliente_ativo: form.cliente_ativo === "1" ? 1 : 0,
      };
      return empresaId
        ? api.put(`/api/empresas/${empresaId}`, payload).then(r => r.data)
        : api.post("/api/empresas", payload).then(r => r.data);
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["empresas"] });
      if (empresaId) qc.invalidateQueries({ queryKey: ["empresa", String(empresaId)] });
      toast.success(empresaId ? "Empresa atualizada" : "Empresa criada");
      router.push(`/empresas/${data.id ?? empresaId}`);
    },
    onError: (err: any) => toast.error(err.response?.data?.error ?? "Erro ao salvar"),
  });

  return (
    <div className="surface-card rounded-xl max-w-3xl">
      <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="p-6 space-y-8">

        {/* Dados básicos */}
        <div>
          <SectionTitle>Dados da empresa</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3.5">
            <Field label="Razão social" required span2>
              <input className={inputCls} value={form.nome} onChange={e => set("nome", e.target.value)} required placeholder="Nome legal da empresa" />
            </Field>
            <Field label="CNPJ">
              <input className={inputCls} value={form.cnpj} onChange={e => set("cnpj", e.target.value)} placeholder="00.000.000/0000-00" />
            </Field>
            <Field label="Status">
              <Select value={form.status} onValueChange={v => set("status", v)}>
                <SelectTrigger className="h-9 rounded-lg border-[#CBD5E1] bg-white text-[13px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="prospect">Prospect</SelectItem>
                  <SelectItem value="cliente">Cliente</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                  <SelectItem value="perdido">Perdido</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Segmento">
              <input className={inputCls} value={form.segmento} onChange={e => set("segmento", e.target.value)} placeholder="Varejo, Saúde, Indústria…" />
            </Field>
            <Field label="Porte">
              <Select value={form.porte} onValueChange={v => set("porte", v)}>
                <SelectTrigger className="h-9 rounded-lg border-[#CBD5E1] bg-white text-[13px]"><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  {["MEI","ME","EPP","Médio","Grande"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Nº de funcionários">
              <input className={inputCls} type="number" min="0" value={form.num_funcionarios} onChange={e => set("num_funcionarios", e.target.value)} placeholder="150" />
            </Field>
            <Field label="Telefone">
              <input className={inputCls} value={form.telefone} onChange={e => set("telefone", e.target.value)} placeholder="(11) 99999-9999" />
            </Field>
            <Field label="E-mail">
              <input className={inputCls} type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="contato@empresa.com.br" />
            </Field>
            <Field label="Cidade">
              <input className={inputCls} value={form.cidade} onChange={e => set("cidade", e.target.value)} placeholder="São Paulo" />
            </Field>
            <Field label="Estado">
              <input className={`${inputCls} uppercase`} value={form.estado} onChange={e => set("estado", e.target.value.toUpperCase())} placeholder="SP" maxLength={2} />
            </Field>
          </div>
        </div>

        {/* Programa de cartão */}
        <div>
          <SectionTitle>Programa de cartão</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3.5">
            <Field label="Tipo de cartão">
              <Select value={form.tipo_cartao} onValueChange={v => set("tipo_cartao", v)}>
                <SelectTrigger className="h-9 rounded-lg border-[#CBD5E1] bg-white text-[13px]"><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  {TIPOS_CARTAO.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Nome do programa">
              <input className={inputCls} value={form.nome_private_label} onChange={e => set("nome_private_label", e.target.value)} placeholder="Cartão Saúde ABC" />
            </Field>
            <Field label="Receita mensal (R$)">
              <input className={inputCls} type="number" min="0" step="0.01" value={form.valor_mensal} onChange={e => set("valor_mensal", e.target.value)} placeholder="0,00" />
            </Field>
            <Field label="Cliente com cartão ativo">
              <Select value={form.cliente_ativo} onValueChange={v => set("cliente_ativo", v)}>
                <SelectTrigger className="h-9 rounded-lg border-[#CBD5E1] bg-white text-[13px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Não</SelectItem>
                  <SelectItem value="1">Sim</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Produtos ativos" span2>
              <input className={inputCls} value={form.produtos_ativos} onChange={e => set("produtos_ativos", e.target.value)} placeholder="Refeição, Alimentação, Multi-benefícios" />
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
            {mutation.isPending ? "Salvando…" : empresaId ? "Salvar alterações" : "Criar empresa"}
          </button>
        </div>
      </form>
    </div>
  );
}
