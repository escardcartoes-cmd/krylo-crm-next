"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Topbar } from "@/components/layout/Topbar";
import { Building2, Palette, Loader2, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";

const inputCls = "w-full h-10 pl-3.5 pr-3.5 rounded-xl bg-white border border-[rgba(15,23,42,0.08)] text-[13px] text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 transition-all shadow-sm";

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
      toast.success("Configurações salvas!");
    },
    onError: (err: any) => toast.error(err.response?.data?.error ?? "Erro ao salvar"),
  });

  const set = (k: string, v: string) => setForm((p: any) => ({ ...p, [k]: v }));

  return (
    <>
      <Topbar
        title="Configurações"
        subtitle="Dados e identidade da sua empresa"
      />

      <div className="flex-1 px-8 pt-4 pb-8">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">

          {/* LEFT — form */}
          <div className="surface-card rounded-2xl p-6 space-y-6">
            <form onSubmit={e => { e.preventDefault(); mutation.mutate(); }} className="space-y-6">

              {/* Dados */}
              <div>
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl tint-blue mb-4">
                  <Building2 className="h-4 w-4 text-[#4F46E5]" />
                  <span className="text-[12px] font-bold uppercase tracking-wider text-[#4F46E5]">Identificação</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5 block">Nome da empresa</label>
                    <input className={inputCls} value={form.nome_empresa} onChange={e => set("nome_empresa", e.target.value)} placeholder="Ex: Escard Cartões" disabled={isLoading} />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5 block">Nome da plataforma</label>
                    <input className={inputCls} value={form.nome_plataforma} onChange={e => set("nome_plataforma", e.target.value)} placeholder="Krylo CRM" disabled={isLoading} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5 block">URL do logo (opcional)</label>
                    <input className={inputCls} type="url" value={form.logo_url} onChange={e => set("logo_url", e.target.value)} placeholder="https://…/logo.png" disabled={isLoading} />
                  </div>
                </div>
              </div>

              {/* Cores */}
              <div>
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl tint-violet mb-4">
                  <Palette className="h-4 w-4 text-violet-700" />
                  <span className="text-[12px] font-bold uppercase tracking-wider text-violet-700">Identidade visual</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5 block">Cor primária</label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={form.cor_primaria} onChange={e => set("cor_primaria", e.target.value)} className="h-10 w-14 rounded-xl border border-[rgba(15,23,42,0.1)] cursor-pointer" />
                      <input className={`${inputCls} font-mono uppercase`} value={form.cor_primaria} onChange={e => set("cor_primaria", e.target.value)} placeholder="#4F46E5" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5 block">Cor secundária</label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={form.cor_secundaria} onChange={e => set("cor_secundaria", e.target.value)} className="h-10 w-14 rounded-xl border border-[rgba(15,23,42,0.1)] cursor-pointer" />
                      <input className={`${inputCls} font-mono uppercase`} value={form.cor_secundaria} onChange={e => set("cor_secundaria", e.target.value)} placeholder="#7C3AED" />
                    </div>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={mutation.isPending}
                className="h-10 px-5 rounded-xl text-white text-[13px] font-bold flex items-center gap-2 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#4F46E5,#6366F1)", boxShadow: "0 4px 12px rgba(79,70,229,0.3)" }}>
                {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Salvar configurações
              </button>
            </form>
          </div>

          {/* RIGHT — preview */}
          <div className="h-fit xl:sticky xl:top-4">
            <div className="surface-card rounded-2xl p-5 mb-4">
              <p className="text-[12px] font-bold text-[#475569] uppercase tracking-wider mb-3">Preview</p>
              <div
                className="rounded-2xl p-6 text-white relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${form.cor_primaria} 0%, ${form.cor_secundaria} 100%)`,
                  boxShadow: `0 10px 40px ${form.cor_primaria}40`,
                }}
              >
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                <div className="relative">
                  <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center text-[20px] font-black mb-3">
                    {form.nome_plataforma?.[0]?.toUpperCase() ?? "K"}
                  </div>
                  <p className="text-[18px] font-extrabold">{form.nome_plataforma || "Sua plataforma"}</p>
                  <p className="text-[12px] text-white/70 mt-1">{form.nome_empresa || "Sua empresa"}</p>
                  <div className="inline-flex items-center gap-1 mt-3 px-2 py-0.5 rounded-md bg-white/20 text-[10px] font-bold uppercase tracking-wider">
                    <Sparkles className="h-2.5 w-2.5" />
                    {tenant?.plano ?? "starter"}
                  </div>
                </div>
              </div>
            </div>

            <div className="surface-card rounded-2xl p-5">
              <p className="text-[12px] font-bold text-[#475569] uppercase tracking-wider mb-2">Plano atual</p>
              <p className="text-[14px] font-bold text-[#0F172A] capitalize">{tenant?.plano ?? "starter"}</p>
              <p className="text-[12px] text-[#64748B] mt-1">Tenant ID: {tenant?.id} · Slug: {tenant?.slug}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
