"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Topbar } from "@/components/layout/Topbar";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

function fmt(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);
}

const inputCls = "w-full h-9 px-3 rounded-lg border border-[#CBD5E1] bg-white text-[13px] text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15 transition-colors";

export default function MetasPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    nome: "", valor_meta: "", data_inicio: "", data_fim: "", tipo: "receita",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["metas"],
    queryFn: () => api.get("/api/metas").then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: () => api.post("/api/metas", {
      ...form, valor_meta: parseFloat(form.valor_meta) || 0, ativo: 1,
    }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["metas"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Meta criada e ativada");
      setForm({ nome: "", valor_meta: "", data_inicio: "", data_fim: "", tipo: "receita" });
    },
    onError: (err: any) => toast.error(err.response?.data?.error ?? "Erro ao criar"),
  });

  const ativarMutation = useMutation({
    mutationFn: (id: number) => api.put(`/api/metas/${id}`, { ativo: 1 }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["metas"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Meta ativada");
    },
  });

  const items: any[] = data?.items ?? [];
  const ativa = items.find(m => m.ativo);

  return (
    <>
      <Topbar
        title="Metas"
        subtitle={ativa ? `Meta ativa: ${ativa.nome} — ${fmt(ativa.valor_meta)}` : "Nenhuma meta ativa"}
      />

      <div className="flex-1 px-8 pt-4 pb-8">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-4">

          <div className="space-y-2">
            {isLoading ? (
              <div className="surface-card rounded-xl divide-y divide-[#F1F5F9]">
                {[...Array(3)].map((_, i) => <div key={i} className="h-16 animate-pulse" />)}
              </div>
            ) : items.length === 0 ? (
              <div className="surface-card rounded-xl py-16 text-center">
                <p className="text-[14px] text-[#475569]">Nenhuma meta cadastrada.</p>
              </div>
            ) : (
              <div className="surface-card rounded-xl overflow-hidden">
                <ul className="divide-y divide-[#F1F5F9]">
                  {items.map(meta => (
                    <li key={meta.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#F8FAFC]">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-[14px] font-medium text-[#0F172A] truncate">{meta.nome}</p>
                          {meta.ativo ? (
                            <span className="inline-flex items-center text-[11px] font-medium px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">Ativa</span>
                          ) : (
                            <span className="inline-flex items-center text-[11px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">Inativa</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-[12px] text-[#64748B]">
                          <span>{meta.tipo}</span>
                          {meta.data_inicio && (
                            <span className="tabular-nums">{meta.data_inicio}{meta.data_fim ? ` → ${meta.data_fim}` : ""}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[16px] font-semibold text-[#0F172A] tabular-nums">{fmt(meta.valor_meta)}</p>
                        {!meta.ativo && (
                          <button onClick={() => ativarMutation.mutate(meta.id)} disabled={ativarMutation.isPending}
                            className="text-[12px] text-[#4F46E5] hover:underline mt-0.5">
                            Ativar
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="surface-card rounded-xl p-6 h-fit xl:sticky xl:top-4">
            <h3 className="text-[13px] font-semibold text-[#0F172A] pb-3 border-b border-[#F1F5F9] mb-4">Nova meta</h3>

            <form onSubmit={e => { e.preventDefault(); createMutation.mutate(); }} className="space-y-3.5">
              <div>
                <label className="text-[12px] font-medium text-[#334155] mb-1.5 block">Nome</label>
                <input className={inputCls} value={form.nome} onChange={e => setForm(p => ({...p, nome: e.target.value}))} required placeholder="Meta Q2 2026" />
              </div>
              <div>
                <label className="text-[12px] font-medium text-[#334155] mb-1.5 block">Valor da meta (R$)</label>
                <input className={inputCls} type="number" min="0" step="100" value={form.valor_meta}
                  onChange={e => setForm(p => ({...p, valor_meta: e.target.value}))} required placeholder="100000" />
              </div>
              <div>
                <label className="text-[12px] font-medium text-[#334155] mb-1.5 block">Tipo</label>
                <select className={inputCls} value={form.tipo} onChange={e => setForm(p => ({...p, tipo: e.target.value}))}>
                  <option value="receita">Receita (R$)</option>
                  <option value="cartoes">Cartões emitidos</option>
                  <option value="clientes">Novos clientes</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-medium text-[#334155] mb-1.5 block">Início</label>
                  <input className={inputCls} type="date" value={form.data_inicio} onChange={e => setForm(p => ({...p, data_inicio: e.target.value}))} />
                </div>
                <div>
                  <label className="text-[12px] font-medium text-[#334155] mb-1.5 block">Fim</label>
                  <input className={inputCls} type="date" value={form.data_fim} onChange={e => setForm(p => ({...p, data_fim: e.target.value}))} />
                </div>
              </div>
              <button type="submit" disabled={createMutation.isPending}
                className="w-full h-9 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[13px] font-medium flex items-center justify-center gap-2 disabled:opacity-60 transition-colors">
                {createMutation.isPending ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Criando…</> : "Criar e ativar meta"}
              </button>
              <p className="text-[12px] text-[#94A3B8] text-center">Criar uma nova meta desativa as anteriores.</p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
