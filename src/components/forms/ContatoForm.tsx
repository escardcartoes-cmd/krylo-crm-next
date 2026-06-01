"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { User, Building2, Mail, Phone, CreditCard, Briefcase, MapPin } from "lucide-react";

interface Props { initial?: Record<string, any>; contatoId?: number; }

const inputCls = "w-full h-10 pl-3.5 pr-3.5 rounded-xl bg-white border border-[rgba(15,23,42,0.08)] text-[13px] text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 transition-all shadow-sm";
const selectTriggerCls = "h-10 rounded-xl border border-[rgba(15,23,42,0.08)] bg-white text-[13px] shadow-sm";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function getInitials(nome: string) {
  const parts = nome.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (parts[0]?.[0] ?? "?").toUpperCase();
}

const GRADIENT_PAIRS: [string, string][] = [
  ["#4F46E5", "#7C3AED"],
  ["#7C3AED", "#A855F7"],
  ["#0EA5E9", "#22D3EE"],
  ["#10B981", "#34D399"],
  ["#F59E0B", "#FBBF24"],
  ["#EF4444", "#F87171"],
];

function getGradient(name: string): [string, string] {
  const idx = (name?.charCodeAt(0) ?? 0) % GRADIENT_PAIRS.length;
  return GRADIENT_PAIRS[idx];
}

export function ContatoForm({ initial = {}, contatoId }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const qc = useQueryClient();

  const { data: empresasData } = useQuery({
    queryKey: ["empresas", ""],
    queryFn: () => api.get("/api/empresas", { params: { per_page: 200 } }).then((r) => r.data),
  });

  const [form, setForm] = useState({
    nome: initial.nome ?? "",
    cargo: initial.cargo ?? "",
    email: initial.email ?? "",
    telefone: initial.telefone ?? "",
    empresa_id: String(initial.empresa_id ?? params.get("empresa_id") ?? ""),
  });

  const mutation = useMutation({
    mutationFn: () =>
      contatoId
        ? api.put(`/api/contatos/${contatoId}`, { ...form, empresa_id: form.empresa_id || null }).then((r) => r.data)
        : api.post("/api/contatos", { ...form, empresa_id: form.empresa_id || null }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contatos"] });
      toast.success(contatoId ? "Contato atualizado!" : "Contato criado!");
      router.push("/contatos");
    },
    onError: (err: any) => toast.error(err.response?.data?.error ?? "Erro ao salvar"),
  });

  function set(key: string, value: string | null) { setForm((p) => ({ ...p, [key]: value ?? "" })); }

  const selectedEmpresa = empresasData?.items?.find((e: any) => String(e.id) === form.empresa_id);
  const [g1, g2] = getGradient(form.nome);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
      {/* LEFT: form */}
      <div className="surface-card rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-[rgba(15,23,42,0.05)]">
          <p className="text-[17px] font-extrabold text-[#0F172A] tracking-[-0.3px]">{contatoId ? "Editar contato" : "Novo contato"}</p>
          <p className="text-[13px] text-[#64748B] mt-0.5">Dados de contato e vínculo com empresa</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="p-6 space-y-6">

          {/* Avatar preview header */}
          {form.nome && (
            <div className="flex items-center gap-3 p-3 rounded-xl tint-blue">
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center text-white text-[14px] font-bold flex-shrink-0 shadow-sm"
                style={{ background: `linear-gradient(135deg, ${g1}, ${g2})` }}
              >
                {getInitials(form.nome)}
              </div>
              <div>
                <p className="text-[14px] font-bold text-[#0F172A]">{form.nome}</p>
                {form.cargo && <p className="text-[12px] text-[#64748B]">{form.cargo}</p>}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl tint-blue mb-4">
              <User className="h-4 w-4 text-[#4F46E5]" />
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#4F46E5]">Dados pessoais</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Field label="Nome completo *">
                  <input className={inputCls} value={form.nome} onChange={(e) => set("nome", e.target.value)} required placeholder="Nome completo" />
                </Field>
              </div>
              <Field label="Cargo">
                <input className={inputCls} value={form.cargo} onChange={(e) => set("cargo", e.target.value)} placeholder="Ex: Diretor Comercial" />
              </Field>
              <Field label="E-mail">
                <input className={inputCls} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="nome@empresa.com" />
              </Field>
              <Field label="Telefone">
                <input className={inputCls} value={form.telefone} onChange={(e) => set("telefone", e.target.value)} placeholder="(11) 99999-9999" />
              </Field>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl tint-emerald mb-4">
              <Building2 className="h-4 w-4 text-emerald-700" />
              <span className="text-[12px] font-bold uppercase tracking-wider text-emerald-700">Empresa vinculada</span>
            </div>
            <Field label="Empresa">
              <Select value={form.empresa_id} onValueChange={(v) => set("empresa_id", v)}>
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
          </div>

          <div className="flex gap-3 pt-4 border-t border-[rgba(15,23,42,0.05)]">
            <button type="submit" disabled={mutation.isPending}
              className="h-10 px-6 rounded-xl text-white text-[13px] font-semibold transition-all active:scale-[0.98] disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg,#4F46E5,#6366F1)",
                boxShadow: "0 4px 12px rgba(79,70,229,0.3)",
              }}>
              {mutation.isPending ? "Salvando…" : "Salvar contato"}
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
        {/* Empresa info */}
        <div className="surface-card rounded-2xl overflow-hidden">
          <div className="px-4 py-3 tint-emerald">
            <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Empresa selecionada</p>
          </div>
          <div className="p-4">
            {selectedEmpresa ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-11 w-11 rounded-xl tint-blue flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-5 w-5 text-[#4F46E5]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-bold text-[#0F172A] truncate">{selectedEmpresa.nome}</p>
                    {selectedEmpresa.segmento && (
                      <p className="text-[12px] text-[#64748B]">{selectedEmpresa.segmento}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2 pt-2 border-t border-[rgba(15,23,42,0.05)]">
                  {selectedEmpresa.tipo_cartao && (
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-3.5 w-3.5 text-[#4F46E5] flex-shrink-0" />
                      <span className="text-[12px] text-[#475569]">{selectedEmpresa.tipo_cartao}</span>
                    </div>
                  )}
                  {selectedEmpresa.porte && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-3.5 w-3.5 text-[#94A3B8] flex-shrink-0" />
                      <span className="text-[12px] text-[#475569]">Porte: {selectedEmpresa.porte}</span>
                    </div>
                  )}
                  {selectedEmpresa.cidade && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-[#94A3B8] flex-shrink-0" />
                      <span className="text-[12px] text-[#475569]">{selectedEmpresa.cidade}{selectedEmpresa.estado ? `, ${selectedEmpresa.estado}` : ""}</span>
                    </div>
                  )}
                  {selectedEmpresa.num_funcionarios > 0 && (
                    <div className="flex items-center gap-2 text-[12px] text-[#475569]">
                      👥 {selectedEmpresa.num_funcionarios} funcionários
                    </div>
                  )}
                </div>
                <div className={`text-[11px] font-bold px-2 py-1 rounded-md inline-block ${
                  selectedEmpresa.status === "cliente" ? "tint-emerald text-emerald-700" :
                  selectedEmpresa.status === "prospect" ? "tint-sky text-sky-700" :
                  "bg-[#F1F5F9] text-[#64748B]"
                }`}>
                  {selectedEmpresa.status}
                </div>
              </div>
            ) : (
              <div className="py-6 text-center">
                <Building2 className="h-8 w-8 text-[#CBD5E1] mx-auto mb-2" />
                <p className="text-[12px] text-[#64748B]">Selecione uma empresa para ver os detalhes</p>
              </div>
            )}
          </div>
        </div>

        {/* Resumo do contato */}
        <div className="surface-card rounded-2xl overflow-hidden">
          <div className="px-4 py-3 tint-blue">
            <p className="text-[11px] font-bold text-[#4F46E5] uppercase tracking-wider">Resumo do contato</p>
          </div>
          <div className="p-4 space-y-3">
            {form.nome ? (
              <>
                <div className="flex items-start gap-3">
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0 shadow-sm"
                    style={{ background: `linear-gradient(135deg, ${g1}, ${g2})` }}
                  >
                    {getInitials(form.nome)}
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-[#0F172A]">{form.nome}</p>
                    {form.cargo && <p className="text-[12px] text-[#64748B]">{form.cargo}</p>}
                  </div>
                </div>
                {form.email && (
                  <div className="flex items-center gap-2 text-[12px] text-[#475569]">
                    <Mail className="h-3.5 w-3.5 text-[#94A3B8]" />
                    {form.email}
                  </div>
                )}
                {form.telefone && (
                  <div className="flex items-center gap-2 text-[12px] text-[#475569]">
                    <Phone className="h-3.5 w-3.5 text-[#94A3B8]" />
                    {form.telefone}
                  </div>
                )}
                {selectedEmpresa && (
                  <div className="flex items-center gap-2 mt-1 pt-2 border-t border-[rgba(15,23,42,0.05)]">
                    <Building2 className="h-3.5 w-3.5 text-[#4F46E5] flex-shrink-0" />
                    <span className="text-[12px] font-semibold text-[#4F46E5]">{selectedEmpresa.nome}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="py-4 text-center">
                <User className="h-8 w-8 text-[#CBD5E1] mx-auto mb-2" />
                <p className="text-[12px] text-[#64748B]">Preencha o nome para ver o resumo</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
