"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Topbar } from "@/components/layout/Topbar";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const inputCls = "w-full h-9 px-3 rounded-lg border border-[#CBD5E1] bg-white text-[13px] text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15 transition-colors";

export default function ConfiguracoesPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState<any>({
    nome_empresa: "", nome_plataforma: "",
    cor_primaria: "#4F46E5", cor_secundaria: "#7C3AED",
    logo_url: "",
  });

  const { data: tenant, isLoading } = useQuery({
    queryKey: ["tenant"],
    queryFn: () => api.get("/api/tenant").then(r => r.data),
  });

  useEffect(() => {
    if (tenant) {
      setForm({
        nome_empresa:    tenant.nome_empresa    ?? "",
        nome_plataforma: tenant.nome_plataforma ?? "",
        cor_primaria:    tenant.cor_primaria    ?? "#4F46E5",
        cor_secundaria:  tenant.cor_secundaria  ?? "#7C3AED",
        logo_url:        tenant.logo_url        ?? "",
      });
    }
  }, [tenant]);

  const mutation = useMutation({
    mutationFn: () => api.put("/api/tenant", form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenant"] });
      toast.success("Configurações salvas");
    },
    onError: (err: any) => toast.error(err.response?.data?.error ?? "Erro ao salvar"),
  });

  const set = (k: string, v: string) => setForm((p: any) => ({ ...p, [k]: v }));

  return (
    <>
      <Topbar title="Configurações" />

      <div className="flex-1 px-8 pt-4 pb-8">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">

          <div className="surface-card rounded-xl p-6">
            <form onSubmit={e => { e.preventDefault(); mutation.mutate(); }} className="space-y-6">

              <div>
                <h3 className="text-[13px] font-semibold text-[#0F172A] pb-3 border-b border-[#F1F5F9] mb-4">Identificação</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3.5">
                  <div>
                    <label className="text-[12px] font-medium text-[#334155] mb-1.5 block">Nome da empresa</label>
                    <input className={inputCls} value={form.nome_empresa} onChange={e => set("nome_empresa", e.target.value)} placeholder="Escard Cartões" disabled={isLoading} />
                  </div>
                  <div>
                    <label className="text-[12px] font-medium text-[#334155] mb-1.5 block">Nome da plataforma</label>
                    <input className={inputCls} value={form.nome_plataforma} onChange={e => set("nome_plataforma", e.target.value)} placeholder="Krylo CRM" disabled={isLoading} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[12px] font-medium text-[#334155] mb-1.5 block">URL do logo (opcional)</label>
                    <input className={inputCls} type="url" value={form.logo_url} onChange={e => set("logo_url", e.target.value)} placeholder="https://…/logo.png" disabled={isLoading} />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[13px] font-semibold text-[#0F172A] pb-3 border-b border-[#F1F5F9] mb-4">Identidade visual</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[12px] font-medium text-[#334155] mb-1.5 block">Cor primária</label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={form.cor_primaria} onChange={e => set("cor_primaria", e.target.value)} className="h-9 w-12 rounded-lg border border-[#CBD5E1] cursor-pointer" />
                      <input className={`${inputCls} font-mono uppercase`} value={form.cor_primaria} onChange={e => set("cor_primaria", e.target.value)} placeholder="#4F46E5" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[12px] font-medium text-[#334155] mb-1.5 block">Cor secundária</label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={form.cor_secundaria} onChange={e => set("cor_secundaria", e.target.value)} className="h-9 w-12 rounded-lg border border-[#CBD5E1] cursor-pointer" />
                      <input className={`${inputCls} font-mono uppercase`} value={form.cor_secundaria} onChange={e => set("cor_secundaria", e.target.value)} placeholder="#7C3AED" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-[#F1F5F9]">
                <button type="submit" disabled={mutation.isPending}
                  className="h-9 px-4 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[13px] font-medium flex items-center gap-2 disabled:opacity-60 transition-colors">
                  {mutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Salvar
                </button>
              </div>
            </form>
          </div>

          <div className="h-fit xl:sticky xl:top-4 space-y-4">
            <div className="surface-card rounded-xl p-5">
              <h3 className="text-[13px] font-semibold text-[#0F172A] pb-3 border-b border-[#F1F5F9] mb-4">Preview</h3>
              <div className="border border-[#E2E8F0] rounded-lg p-5">
                <div className="h-10 w-10 rounded-lg flex items-center justify-center text-white text-[16px] font-medium mb-3"
                  style={{ background: form.cor_primaria }}>
                  {form.nome_plataforma?.[0]?.toUpperCase() ?? "K"}
                </div>
                <p className="text-[15px] font-medium text-[#0F172A]">{form.nome_plataforma || "Sua plataforma"}</p>
                <p className="text-[12px] text-[#64748B] mt-0.5">{form.nome_empresa || "Sua empresa"}</p>
              </div>
            </div>

            <div className="surface-card rounded-xl p-5">
              <h3 className="text-[13px] font-semibold text-[#0F172A] pb-3 border-b border-[#F1F5F9] mb-4">Plano</h3>
              <p className="text-[14px] font-medium text-[#0F172A] capitalize">{tenant?.plano ?? "starter"}</p>
              <p className="text-[12px] text-[#64748B] mt-1">Tenant ID: <span className="tabular-nums">{tenant?.id}</span> · Slug: {tenant?.slug}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
