"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Building2, CreditCard, Lightbulb, MapPin, Phone, Mail } from "lucide-react";

interface Props { initial?: Record<string, any>; empresaId?: number; }

const TIPOS_CARTAO = [
  "Private Label",
  "Co-branded",
  "Benefícios",
  "Refeição",
  "Alimentação",
  "Vale-transporte",
  "Multi-benefícios",
  "Corporativo",
];

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

function Field({ label, children, span2 }: { label: string; children: React.ReactNode; span2?: boolean }) {
  return (
    <div className={span2 ? "sm:col-span-2" : ""}>
      <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full h-10 pl-3.5 pr-3.5 rounded-xl bg-white border border-[rgba(15,23,42,0.08)] text-[13px] text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 transition-all shadow-sm";
const selectTriggerCls = "h-10 rounded-xl border border-[rgba(15,23,42,0.08)] bg-white text-[13px] shadow-sm";

const STATUS_LABELS: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  prospect: { label: "Prospect", bg: "tint-sky",     text: "text-sky-700",     dot: "bg-sky-500" },
  cliente:  { label: "Cliente",  bg: "tint-emerald", text: "text-emerald-700", dot: "bg-emerald-500" },
  inativo:  { label: "Inativo",  bg: "bg-[#F1F5F9]", text: "text-[#64748B]",   dot: "bg-slate-400" },
  perdido:  { label: "Perdido",  bg: "tint-rose",    text: "text-rose-700",    dot: "bg-rose-500" },
};

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
      toast.success(empresaId ? "Empresa atualizada!" : "Empresa criada!");
      router.push(`/empresas/${data.id ?? empresaId}`);
    },
    onError: (err: any) => toast.error(err.response?.data?.error ?? "Erro ao salvar"),
  });

  const statusInfo = STATUS_LABELS[form.status] ?? STATUS_LABELS.prospect;
  const receita = form.valor_mensal ? parseFloat(form.valor_mensal) : 0;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
      {/* LEFT: form */}
      <div className="surface-card rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-[rgba(15,23,42,0.05)]">
          <p className="text-[17px] font-extrabold text-[#0F172A] tracking-[-0.3px]">{empresaId ? "Editar empresa" : "Nova empresa"}</p>
          <p className="text-[13px] text-[#64748B] mt-0.5">Dados cadastrais e programa de cartão</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="p-6 space-y-6">

          <div>
            <SectionHeader icon={Building2} label="Dados da empresa" color="blue" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Razão social *" span2>
                <input className={inputCls} value={form.nome} onChange={e => set("nome", e.target.value)} required placeholder="Nome da empresa" />
              </Field>
              <Field label="CNPJ">
                <input className={inputCls} value={form.cnpj} onChange={e => set("cnpj", e.target.value)} placeholder="00.000.000/0000-00" />
              </Field>
              <Field label="Status">
                <Select value={form.status} onValueChange={v => set("status", v)}>
                  <SelectTrigger className={selectTriggerCls}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prospect">Prospect</SelectItem>
                    <SelectItem value="cliente">Cliente</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                    <SelectItem value="perdido">Perdido</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Segmento">
                <input className={inputCls} value={form.segmento} onChange={e => set("segmento", e.target.value)} placeholder="Ex: Varejo, Saúde, Indústria…" />
              </Field>
              <Field label="Porte">
                <Select value={form.porte} onValueChange={v => set("porte", v)}>
                  <SelectTrigger className={selectTriggerCls}><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  <SelectContent>
                    {["MEI","ME","EPP","Médio","Grande"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Nº de funcionários">
                <input className={inputCls} type="number" min="0" value={form.num_funcionarios} onChange={e => set("num_funcionarios", e.target.value)} placeholder="Ex: 150" />
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

          <div>
            <SectionHeader icon={CreditCard} label="Programa de cartão" color="emerald" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Tipo de cartão">
                <Select value={form.tipo_cartao} onValueChange={v => set("tipo_cartao", v)}>
                  <SelectTrigger className={selectTriggerCls}><SelectValue placeholder="Selecionar tipo" /></SelectTrigger>
                  <SelectContent>
                    {TIPOS_CARTAO.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Nome do programa / bandeira">
                <input className={inputCls} value={form.nome_private_label} onChange={e => set("nome_private_label", e.target.value)} placeholder="Ex: Cartão Saúde ABC" />
              </Field>
              <Field label="Receita mensal (R$)">
                <input className={inputCls} type="number" min="0" step="0.01" value={form.valor_mensal} onChange={e => set("valor_mensal", e.target.value)} placeholder="0,00" />
              </Field>
              <Field label="Cliente com cartão ativo">
                <Select value={form.cliente_ativo} onValueChange={v => set("cliente_ativo", v)}>
                  <SelectTrigger className={selectTriggerCls}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Sim — cartão ativo</SelectItem>
                    <SelectItem value="0">Não</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Produtos ativos" span2>
                <input className={inputCls} value={form.produtos_ativos} onChange={e => set("produtos_ativos", e.target.value)} placeholder="Ex: Refeição, Alimentação, Multi-benefícios" />
              </Field>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-[rgba(15,23,42,0.05)]">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="h-10 px-6 rounded-xl text-white text-[13px] font-semibold transition-all active:scale-[0.98] disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg,#4F46E5,#6366F1)",
                boxShadow: "0 4px 12px rgba(79,70,229,0.3)",
              }}
            >
              {mutation.isPending ? "Salvando…" : "Salvar empresa"}
            </button>
            <button type="button" onClick={() => router.back()}
              className="h-10 px-4 rounded-xl bg-white text-[#334155] border border-[rgba(15,23,42,0.1)] text-[13px] font-semibold hover:bg-[#F8FAFC] transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      </div>

      {/* RIGHT: preview + tips */}
      <div className="space-y-4 xl:sticky xl:top-4 h-fit">
        {/* Live preview card */}
        <div className="surface-card rounded-2xl overflow-hidden">
          <div className="px-4 py-3 tint-blue">
            <p className="text-[11px] font-bold text-[#4F46E5] uppercase tracking-wider">Preview do cadastro</p>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-11 w-11 rounded-xl tint-blue flex items-center justify-center flex-shrink-0">
                <Building2 className="h-5 w-5 text-[#4F46E5]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-bold text-[#0F172A] truncate">
                  {form.nome || <span className="text-[#94A3B8] font-normal">Nome da empresa</span>}
                </p>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  {form.segmento && (
                    <span className="text-[11px] text-[#64748B]">{form.segmento}</span>
                  )}
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${statusInfo.bg} ${statusInfo.text}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.dot}`} />
                    {statusInfo.label}
                  </span>
                  {form.porte && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#F1F5F9] text-[#64748B]">{form.porte}</span>
                  )}
                </div>
              </div>
            </div>

            {(form.telefone || form.email || form.cidade) && (
              <div className="space-y-2 pt-2 border-t border-[rgba(15,23,42,0.05)]">
                {form.telefone && (
                  <div className="flex items-center gap-2 text-[12px] text-[#475569]">
                    <Phone className="h-3.5 w-3.5 text-[#94A3B8]" />
                    {form.telefone}
                  </div>
                )}
                {form.email && (
                  <div className="flex items-center gap-2 text-[12px] text-[#475569]">
                    <Mail className="h-3.5 w-3.5 text-[#94A3B8]" />
                    {form.email}
                  </div>
                )}
                {form.cidade && (
                  <div className="flex items-center gap-2 text-[12px] text-[#475569]">
                    <MapPin className="h-3.5 w-3.5 text-[#94A3B8]" />
                    {form.cidade}{form.estado ? `, ${form.estado}` : ""}
                  </div>
                )}
              </div>
            )}

            {(form.tipo_cartao || receita > 0) && (
              <div
                className="rounded-xl p-3 text-white relative overflow-hidden"
                style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)" }}
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <CreditCard className="h-3.5 w-3.5 text-white/70" />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">Programa</p>
                </div>
                {form.tipo_cartao && <p className="text-[13px] font-bold">{form.tipo_cartao}</p>}
                {form.nome_private_label && <p className="text-[12px] text-white/80 mt-0.5">{form.nome_private_label}</p>}
                {receita > 0 && (
                  <p className="text-[18px] font-extrabold mt-1 tracking-[-0.3px]">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(receita)}<span className="text-[11px] font-normal text-white/70">/mês</span>
                  </p>
                )}
              </div>
            )}

            {!form.nome && !form.tipo_cartao && (
              <div className="py-4 text-center text-[12px] text-[#94A3B8]">
                Preencha o formulário para ver o preview
              </div>
            )}
          </div>
        </div>

        {/* Tips card */}
        <div className="surface-card rounded-2xl overflow-hidden">
          <div className="px-4 py-3 tint-amber flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-700" />
            <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Dicas de preenchimento</p>
          </div>
          <div className="p-4 space-y-3">
            {[
              { icon: "🏢", text: "Use a razão social completa para facilitar buscas futuras" },
              { icon: "💳", text: "Selecione o tipo de cartão correto — isso impacta o pipeline" },
              { icon: "💰", text: "Informe a receita mensal para acompanhamento do MRR" },
              { icon: "📍", text: "Cidade e estado ajudam a segmentar por região" },
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="text-[14px] flex-shrink-0">{tip.icon}</span>
                <p className="text-[12px] text-[#475569] leading-snug">{tip.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
