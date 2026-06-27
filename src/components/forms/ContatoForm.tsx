"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Props { initial?: Record<string, any>; contatoId?: number; }

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
      toast.success(contatoId ? "Contato atualizado" : "Contato criado");
      router.push("/contatos");
    },
    onError: (err: any) => toast.error(err.response?.data?.error ?? "Erro ao salvar"),
  });

  function set(k: string, v: string | null) { setForm((p) => ({ ...p, [k]: v ?? "" })); }

  return (
    <div className="surface-card rounded-xl max-w-3xl">
      <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="p-6 space-y-8">

        <div>
          <SectionTitle>Dados do contato</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3.5">
            <Field label="Nome completo" required span2>
              <input className={inputCls} value={form.nome} onChange={(e) => set("nome", e.target.value)} required placeholder="Nome completo" />
            </Field>
            <Field label="Cargo">
              <input className={inputCls} value={form.cargo} onChange={(e) => set("cargo", e.target.value)} placeholder="Diretor Comercial" />
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
          <SectionTitle>Empresa</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3.5">
            <Field label="Empresa vinculada" span2>
              <Select value={form.empresa_id} onValueChange={(v) => set("empresa_id", v)}>
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
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#F1F5F9]">
          <button type="button" onClick={() => router.back()}
            className="h-9 px-4 rounded-lg text-[13px] text-[#475569] hover:bg-[#F1F5F9] transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={mutation.isPending}
            className="h-9 px-4 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[13px] font-medium transition-colors disabled:opacity-60">
            {mutation.isPending ? "Salvando…" : contatoId ? "Salvar alterações" : "Criar contato"}
          </button>
        </div>
      </form>
    </div>
  );
}
