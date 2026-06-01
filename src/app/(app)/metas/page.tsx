"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Topbar } from "@/components/layout/Topbar";
import { Goal, Loader2, CheckCircle2, Target, Calendar } from "lucide-react";
import { toast } from "sonner";

function fmt(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);
}

const inputCls = "w-full h-10 pl-3.5 pr-3.5 rounded-xl bg-white border border-[rgba(15,23,42,0.08)] text-[13px] text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 transition-all shadow-sm";

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
      ...form,
      valor_meta: parseFloat(form.valor_meta) || 0,
      ativo: 1,
    }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["metas"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Meta criada e ativada!");
      setForm({ nome: "", valor_meta: "", data_inicio: "", data_fim: "", tipo: "receita" });
    },
    onError: (err: any) => toast.error(err.response?.data?.error ?? "Erro ao criar"),
  });

  const ativarMutation = useMutation({
    mutationFn: (id: number) => api.put(`/api/metas/${id}`, { ativo: 1 }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["metas"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Meta ativada!");
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
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6">

          {/* List */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Goal className="h-4 w-4 text-[#4F46E5]" />
              <p className="text-[12px] font-bold uppercase tracking-wider text-[#475569]">Histórico de metas</p>
            </div>

            {isLoading ? (
              <div className="space-y-2">{[...Array(3)].map((_,i) => <div key={i} className="h-20 surface-card rounded-2xl animate-pulse" />)}</div>
            ) : items.length === 0 ? (
              <div className="surface-card rounded-2xl py-16 text-center">
                <div className="h-16 w-16 rounded-2xl tint-blue flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-[#4F46E5]" />
                </div>
                <p className="text-[15px] font-bold text-[#0F172A]">Nenhuma meta cadastrada</p>
                <p className="text-[13px] text-[#64748B] mt-1">Crie sua primeira meta de receita usando o formulário ao lado</p>
              </div>
            ) : (
              items.map(meta => (
                <div key={meta.id} className="surface-card rounded-2xl p-5 flex items-center gap-4">
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.ativo ? "tint-emerald" : "tint-blue"}`}>
                    {meta.ativo ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <Target className="h-5 w-5 text-[#4F46E5]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[14px] font-bold text-[#0F172A] truncate">{meta.nome}</p>
                      {meta.ativo ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700">ATIVA</span>
                      ) : (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">Inativa</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[12px] text-[#64748B] mt-1">
                      <span>{meta.tipo}</span>
                      {meta.data_inicio && (
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{meta.data_inicio}{meta.data_fim ? ` → ${meta.data_fim}` : ""}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[18px] font-extrabold text-[#0F172A]">{fmt(meta.valor_meta)}</p>
                    {!meta.ativo && (
                      <button onClick={() => ativarMutation.mutate(meta.id)} disabled={ativarMutation.isPending}
                        className="text-[11px] font-semibold text-[#4F46E5] hover:underline mt-1">
                        Ativar →
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Create form */}
          <div className="surface-card rounded-2xl p-6 h-fit xl:sticky xl:top-4">
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl tint-blue mb-5">
              <Target className="h-4 w-4 text-[#4F46E5]" />
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#4F46E5]">Nova meta</span>
            </div>

            <form onSubmit={e => { e.preventDefault(); createMutation.mutate(); }} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5 block">Nome *</label>
                <input className={inputCls} value={form.nome} onChange={e => setForm(p => ({...p, nome: e.target.value}))} required placeholder="Ex: Meta Q2 2026" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5 block">Valor da meta (R$) *</label>
                <input className={inputCls} type="number" min="0" step="100" value={form.valor_meta}
                  onChange={e => setForm(p => ({...p, valor_meta: e.target.value}))} required placeholder="100000" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5 block">Tipo</label>
                <select className={inputCls} value={form.tipo} onChange={e => setForm(p => ({...p, tipo: e.target.value}))}>
                  <option value="receita">Receita (R$)</option>
                  <option value="cartoes">Cartões emitidos</option>
                  <option value="clientes">Novos clientes</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5 block">Início</label>
                  <input className={inputCls} type="date" value={form.data_inicio} onChange={e => setForm(p => ({...p, data_inicio: e.target.value}))} />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5 block">Fim</label>
                  <input className={inputCls} type="date" value={form.data_fim} onChange={e => setForm(p => ({...p, data_fim: e.target.value}))} />
                </div>
              </div>
              <button type="submit" disabled={createMutation.isPending}
                className="w-full h-10 rounded-xl text-white text-[13px] font-bold flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg,#4F46E5,#6366F1)", boxShadow: "0 4px 12px rgba(79,70,229,0.3)" }}>
                {createMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" />Criando…</> : "Criar e ativar meta"}
              </button>
              <p className="text-[11px] text-[#94A3B8] text-center">Criar uma nova meta desativa as anteriores</p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
