"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { User, Building2, Mail, Phone, CreditCard, Briefcase } from "lucide-react";

interface Props { initial?: Record<string, any>; contatoId?: number; }

const inputCls = "w-full h-9 px-3.5 rounded-xl border border-[rgba(0,0,0,0.1)] bg-[#F9F9FB] text-[13px] text-[#1C1C1E] placeholder-[#C7C7CC] outline-none focus:border-[#0057FF] focus:ring-2 focus:ring-[#0057FF]/10 transition-all";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function getInitials(nome: string) {
  const parts = nome.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (parts[0]?.[0] ?? "?").toUpperCase();
}

const GRADIENT_COLORS = [
  ["#0057FF", "#6B8EFF"],
  ["#AF52DE", "#DA8FFF"],
  ["#1A7F4B", "#34C759"],
  ["#FF9500", "#FFCC44"],
  ["#FF3B30", "#FF6B6B"],
];

function getGradient(name: string) {
  const idx = (name.charCodeAt(0) || 0) % GRADIENT_COLORS.length;
  return GRADIENT_COLORS[idx];
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
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
      {/* LEFT: form */}
      <div className="bg-white rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_2px_12px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[rgba(0,0,0,0.06)] bg-gradient-to-r from-white to-[#F9FAFF]">
          <p className="text-[15px] font-bold text-[#1C1C1E]">{contatoId ? "Editar contato" : "Novo contato"}</p>
          <p className="text-[12px] text-[#8E8E93] mt-0.5">Dados de contato e vínculo com empresa</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="p-6 space-y-5">
          {/* Avatar + nome preview header */}
          {form.nome && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-[#EEF3FF] to-[#F5F8FF]">
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center text-white text-[14px] font-bold flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${g1}, ${g2})` }}
              >
                {getInitials(form.nome)}
              </div>
              <div>
                <p className="text-[14px] font-bold text-[#1C1C1E]">{form.nome}</p>
                {form.cargo && <p className="text-[12px] text-[#8E8E93]">{form.cargo}</p>}
              </div>
            </div>
          )}

          {/* Dados principais */}
          <div>
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl mb-4 bg-gradient-to-r from-[#EEF3FF] to-[#F5F8FF]">
              <div className="h-6 w-6 rounded-lg flex items-center justify-center flex-shrink-0 text-[#0057FF] bg-[#0057FF]/10">
                <User className="h-3.5 w-3.5" />
              </div>
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#0057FF]">Dados pessoais</span>
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

          {/* Vínculo */}
          <div>
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl mb-4 bg-gradient-to-r from-[#E8F9F0] to-[#F0FDF8]">
              <div className="h-6 w-6 rounded-lg flex items-center justify-center flex-shrink-0 text-[#1A7F4B] bg-[#1A7F4B]/10">
                <Building2 className="h-3.5 w-3.5" />
              </div>
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#1A7F4B]">Empresa vinculada</span>
            </div>
            <Field label="Empresa">
              <Select value={form.empresa_id} onValueChange={(v) => set("empresa_id", v)}>
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
          </div>

          <div className="flex gap-3 pt-2 border-t border-[rgba(0,0,0,0.05)]">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="h-9 px-6 bg-[#0057FF] text-white rounded-xl text-[13px] font-semibold hover:bg-[#0047D4] disabled:opacity-60 transition-colors shadow-[0_2px_8px_rgba(0,87,255,0.3)]"
            >
              {mutation.isPending ? "Salvando…" : "Salvar contato"}
            </button>
            <button type="button" onClick={() => router.back()} className="h-9 px-4 rounded-xl text-[13px] text-[#8E8E93] hover:text-[#3A3A3C] hover:bg-[rgba(0,0,0,0.04)] transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      </div>

      {/* RIGHT: empresa info + summary */}
      <div className="space-y-4">
        {/* Empresa info */}
        <div className="bg-white rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_2px_12px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-[#E8F9F0] to-[#F0FDF8] border-b border-[rgba(26,127,74,0.08)]">
            <p className="text-[11px] font-bold text-[#1A7F4B] uppercase tracking-wider">Empresa selecionada</p>
          </div>
          <div className="p-4">
            {selectedEmpresa ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#EEF3FF] flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-5 w-5 text-[#0057FF]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-bold text-[#1C1C1E] truncate">{selectedEmpresa.nome}</p>
                    {selectedEmpresa.segmento && (
                      <p className="text-[12px] text-[#8E8E93]">{selectedEmpresa.segmento}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2 pt-1 border-t border-[rgba(0,0,0,0.05)]">
                  {selectedEmpresa.tipo_cartao && (
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-3.5 w-3.5 text-[#0057FF] flex-shrink-0" />
                      <span className="text-[12px] text-[#636366]">{selectedEmpresa.tipo_cartao}</span>
                    </div>
                  )}
                  {selectedEmpresa.porte && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-3.5 w-3.5 text-[#8E8E93] flex-shrink-0" />
                      <span className="text-[12px] text-[#636366]">Porte: {selectedEmpresa.porte}</span>
                    </div>
                  )}
                  {selectedEmpresa.cidade && (
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] text-[#636366]">📍 {selectedEmpresa.cidade}{selectedEmpresa.estado ? `, ${selectedEmpresa.estado}` : ""}</span>
                    </div>
                  )}
                  {selectedEmpresa.num_funcionarios > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] text-[#636366]">👥 {selectedEmpresa.num_funcionarios} funcionários</span>
                    </div>
                  )}
                </div>
                <div className={`text-[11px] font-semibold px-2 py-1 rounded-lg inline-block ${
                  selectedEmpresa.status === "cliente" ? "bg-[#E8F9F0] text-[#1C7C4A]" :
                  selectedEmpresa.status === "prospect" ? "bg-[#EEF3FF] text-[#0057FF]" :
                  "bg-[#F2F2F7] text-[#8E8E93]"
                }`}>
                  {selectedEmpresa.status}
                </div>
              </div>
            ) : (
              <div className="py-6 text-center">
                <Building2 className="h-8 w-8 text-[#E5E5EA] mx-auto mb-2" />
                <p className="text-[12px] text-[#8E8E93]">Selecione uma empresa para ver os detalhes</p>
              </div>
            )}
          </div>
        </div>

        {/* Resumo do contato */}
        <div className="bg-white rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_2px_12px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-[#EEF3FF] to-[#F5F8FF] border-b border-[rgba(0,87,255,0.08)]">
            <p className="text-[11px] font-bold text-[#0057FF] uppercase tracking-wider">Resumo do contato</p>
          </div>
          <div className="p-4 space-y-3">
            {form.nome ? (
              <>
                <div className="flex items-start gap-2.5">
                  <div
                    className="h-9 w-9 rounded-full flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${g1}, ${g2})` }}
                  >
                    {getInitials(form.nome)}
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-[#1C1C1E]">{form.nome}</p>
                    {form.cargo && <p className="text-[11px] text-[#8E8E93]">{form.cargo}</p>}
                  </div>
                </div>
                {form.email && (
                  <div className="flex items-center gap-2 text-[12px] text-[#636366]">
                    <Mail className="h-3.5 w-3.5 text-[#8E8E93]" />
                    {form.email}
                  </div>
                )}
                {form.telefone && (
                  <div className="flex items-center gap-2 text-[12px] text-[#636366]">
                    <Phone className="h-3.5 w-3.5 text-[#8E8E93]" />
                    {form.telefone}
                  </div>
                )}
                {selectedEmpresa && (
                  <div className="flex items-center gap-2 mt-1 pt-2 border-t border-[rgba(0,0,0,0.05)]">
                    <Building2 className="h-3.5 w-3.5 text-[#0057FF] flex-shrink-0" />
                    <span className="text-[12px] font-medium text-[#0057FF]">{selectedEmpresa.nome}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="py-4 text-center">
                <User className="h-8 w-8 text-[#E5E5EA] mx-auto mb-2" />
                <p className="text-[12px] text-[#8E8E93]">Preencha o nome para ver o resumo</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
