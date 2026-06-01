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

function Field({ label, children, span2 }: { label: string; children: React.ReactNode; span2?: boolean }) {
  return (
    <div className={span2 ? "sm:col-span-2" : ""}>
      <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full h-9 px-3.5 rounded-xl border border-[rgba(0,0,0,0.1)] bg-[#F9F9FB] text-[13px] text-[#1C1C1E] placeholder-[#C7C7CC] outline-none focus:border-[#0057FF] focus:ring-2 focus:ring-[#0057FF]/10 transition-all";

const STATUS_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  prospect: { label: "Prospect", bg: "bg-[#EEF3FF]", text: "text-[#0057FF]" },
  cliente:  { label: "Cliente",  bg: "bg-[#E8F9F0]", text: "text-[#1C7C4A]" },
  inativo:  { label: "Inativo",  bg: "bg-[#F2F2F7]", text: "text-[#8E8E93]" },
  perdido:  { label: "Perdido",  bg: "bg-[#FFF1F0]", text: "text-[#FF3B30]" },
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
      <div className="bg-white rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_2px_12px_rgba(0,0,0,0.05)] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[rgba(0,0,0,0.06)] bg-gradient-to-r from-white to-[#F9FAFF]">
          <p className="text-[15px] font-bold text-[#1C1C1E]">{empresaId ? "Editar empresa" : "Nova empresa"}</p>
          <p className="text-[12px] text-[#8E8E93] mt-0.5">Dados cadastrais e programa de cartão</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="p-6 space-y-6">

          {/* Dados básicos */}
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
                  <SelectTrigger className="h-9 rounded-xl border border-[rgba(0,0,0,0.1)] bg-[#F9F9FB] text-[13px]"><SelectValue /></SelectTrigger>
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
                  <SelectTrigger className="h-9 rounded-xl border border-[rgba(0,0,0,0.1)] bg-[#F9F9FB] text-[13px]"><SelectValue placeholder="Selecionar" /></SelectTrigger>
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

          {/* Programa de cartão */}
          <div>
            <SectionHeader icon={CreditCard} label="Programa de cartão" color="green" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Tipo de cartão">
                <Select value={form.tipo_cartao} onValueChange={v => set("tipo_cartao", v)}>
                  <SelectTrigger className="h-9 rounded-xl border border-[rgba(0,0,0,0.1)] bg-[#F9F9FB] text-[13px]"><SelectValue placeholder="Selecionar tipo" /></SelectTrigger>
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
                  <SelectTrigger className="h-9 rounded-xl border border-[rgba(0,0,0,0.1)] bg-[#F9F9FB] text-[13px]"><SelectValue /></SelectTrigger>
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

          <div className="flex gap-3 pt-2 border-t border-[rgba(0,0,0,0.05)]">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="h-9 px-6 bg-[#0057FF] text-white rounded-xl text-[13px] font-semibold hover:bg-[#0047D4] disabled:opacity-60 transition-colors shadow-[0_2px_8px_rgba(0,87,255,0.3)]"
            >
              {mutation.isPending ? "Salvando…" : "Salvar empresa"}
            </button>
            <button type="button" onClick={() => router.back()} className="h-9 px-4 rounded-xl text-[13px] text-[#8E8E93] hover:text-[#3A3A3C] hover:bg-[rgba(0,0,0,0.04)] transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      </div>

      {/* RIGHT: preview + tips */}
      <div className="space-y-4">
        {/* Live preview card */}
        <div className="bg-white rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_2px_12px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-[#EEF3FF] to-[#F5F8FF] border-b border-[rgba(0,87,255,0.08)]">
            <p className="text-[11px] font-bold text-[#0057FF] uppercase tracking-wider">Preview do cadastro</p>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#EEF3FF] to-[#D6E4FF] flex items-center justify-center flex-shrink-0">
                <Building2 className="h-5 w-5 text-[#0057FF]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-bold text-[#1C1C1E] truncate">
                  {form.nome || <span className="text-[#C7C7CC] font-normal">Nome da empresa</span>}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {form.segmento && (
                    <span className="text-[11px] text-[#8E8E93]">{form.segmento}</span>
                  )}
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-lg ${statusInfo.bg} ${statusInfo.text}`}>
                    {statusInfo.label}
                  </span>
                  {form.porte && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-lg bg-[#F2F2F7] text-[#636366]">{form.porte}</span>
                  )}
                </div>
              </div>
            </div>

            {(form.telefone || form.email || form.cidade) && (
              <div className="space-y-2 pt-1 border-t border-[rgba(0,0,0,0.05)]">
                {form.telefone && (
                  <div className="flex items-center gap-2 text-[12px] text-[#636366]">
                    <Phone className="h-3.5 w-3.5 text-[#8E8E93]" />
                    {form.telefone}
                  </div>
                )}
                {form.email && (
                  <div className="flex items-center gap-2 text-[12px] text-[#636366]">
                    <Mail className="h-3.5 w-3.5 text-[#8E8E93]" />
                    {form.email}
                  </div>
                )}
                {form.cidade && (
                  <div className="flex items-center gap-2 text-[12px] text-[#636366]">
                    <MapPin className="h-3.5 w-3.5 text-[#8E8E93]" />
                    {form.cidade}{form.estado ? `, ${form.estado}` : ""}
                  </div>
                )}
              </div>
            )}

            {(form.tipo_cartao || receita > 0) && (
              <div className="rounded-xl bg-gradient-to-r from-[#0057FF] to-[#338BFF] p-3 text-white">
                <div className="flex items-center gap-1.5 mb-2">
                  <CreditCard className="h-3.5 w-3.5 text-white/70" />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">Programa</p>
                </div>
                {form.tipo_cartao && <p className="text-[13px] font-bold">{form.tipo_cartao}</p>}
                {form.nome_private_label && <p className="text-[12px] text-white/80 mt-0.5">{form.nome_private_label}</p>}
                {receita > 0 && (
                  <p className="text-[16px] font-extrabold mt-1">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(receita)}<span className="text-[11px] font-normal text-white/70">/mês</span>
                  </p>
                )}
              </div>
            )}

            {!form.nome && !form.tipo_cartao && (
              <div className="py-4 text-center text-[12px] text-[#C7C7CC]">
                Preencha o formulário para ver o preview
              </div>
            )}
          </div>
        </div>

        {/* Tips card */}
        <div className="bg-white rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_2px_12px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-[#FFF8E8] to-[#FFFDF5] border-b border-[rgba(255,149,0,0.1)]">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-3.5 w-3.5 text-[#FF9500]" />
              <p className="text-[11px] font-bold text-[#B07D00] uppercase tracking-wider">Dicas de preenchimento</p>
            </div>
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
                <p className="text-[12px] text-[#636366] leading-snug">{tip.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
