"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Topbar } from "@/components/layout/Topbar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Edit, UserX, UserCheck, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

const PERFIS = [
  { value: "admin",        label: "Admin",        bg: "tint-violet",  text: "text-violet-700" },
  { value: "gerente",      label: "Gerente",      bg: "tint-blue",    text: "text-[#4F46E5]" },
  { value: "vendedor",     label: "Vendedor",     bg: "tint-emerald", text: "text-emerald-700" },
  { value: "visualizador", label: "Visualizador", bg: "bg-[#F1F5F9]", text: "text-[#64748B]" },
];

const inputCls = "w-full h-10 pl-3.5 pr-3.5 rounded-xl bg-white border border-[rgba(15,23,42,0.08)] text-[13px] text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 transition-all shadow-sm";

const EMPTY = { nome: "", email: "", usuario: "", senha: "", perfil: "vendedor", ativo: 1 };

export default function UsuariosPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(EMPTY);

  const { data, isLoading } = useQuery({
    queryKey: ["usuarios"],
    queryFn: () => api.get("/api/usuarios").then(r => r.data),
  });

  const items: any[] = data?.items ?? [];
  const ativos = items.filter(u => u.ativo).length;
  const inativos = items.length - ativos;

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload: any = { ...form, ativo: form.ativo ? 1 : 0 };
      if (editing && !payload.senha) delete payload.senha;
      return editing
        ? api.put(`/api/usuarios/${editing.id}`, payload).then(r => r.data)
        : api.post("/api/usuarios", payload).then(r => r.data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["usuarios"] });
      toast.success(editing ? "Usuário atualizado!" : "Usuário criado!");
      setOpen(false);
      setEditing(null);
      setForm(EMPTY);
    },
    onError: (err: any) => toast.error(err.response?.data?.error ?? "Erro ao salvar"),
  });

  const deleteMutation = useMutation({
    mutationFn: (uid: number) => api.delete(`/api/usuarios/${uid}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["usuarios"] }); toast.success("Usuário desativado"); },
    onError: (err: any) => toast.error(err.response?.data?.error ?? "Erro"),
  });

  const reactivateMutation = useMutation({
    mutationFn: (uid: number) => api.put(`/api/usuarios/${uid}`, { ativo: 1 }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["usuarios"] }); toast.success("Usuário reativado"); },
  });

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  }

  function openEdit(u: any) {
    setEditing(u);
    setForm({
      nome: u.nome ?? "", email: u.email ?? "", usuario: u.usuario ?? "",
      senha: "", perfil: u.perfil ?? "vendedor", ativo: u.ativo ? 1 : 0,
    });
    setOpen(true);
  }

  function set(k: string, v: string | number | null) { setForm((p: any) => ({ ...p, [k]: v ?? "" })); }

  function gradientFor(name: string) {
    const colors = [
      "linear-gradient(135deg,#4F46E5,#A855F7)",
      "linear-gradient(135deg,#10B981,#059669)",
      "linear-gradient(135deg,#F59E0B,#EF4444)",
      "linear-gradient(135deg,#3B82F6,#06B6D4)",
      "linear-gradient(135deg,#EC4899,#8B5CF6)",
    ];
    const idx = (name?.charCodeAt(0) ?? 0) % colors.length;
    return colors[idx];
  }

  return (
    <>
      <Topbar
        title="Usuários"
        subtitle={`${ativos} ativo${ativos !== 1 ? "s" : ""} · ${inativos} inativo${inativos !== 1 ? "s" : ""}`}
        actions={
          <button
            onClick={openCreate}
            className="h-8 px-3.5 rounded-xl text-white text-[12px] font-bold transition-all active:scale-[0.98] flex items-center gap-1.5"
            style={{ background: "linear-gradient(135deg,#4F46E5,#6366F1)", boxShadow: "0 4px 12px rgba(79,70,229,0.3)" }}
          >
            <Plus className="h-3.5 w-3.5" />Novo usuário
          </button>
        }
      />

      <div className="flex-1 px-8 pt-4 pb-8 space-y-3">
        {isLoading ? (
          <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-[72px] w-full rounded-2xl" />)}</div>
        ) : (
          <div className="space-y-2">
            {items.map(u => {
              const perfil = PERFIS.find(p => p.value === u.perfil) ?? { label: u.perfil, bg: "bg-[#F1F5F9]", text: "text-[#64748B]" };
              return (
                <div key={u.id} className={`surface-card flex items-center gap-4 px-5 py-4 rounded-2xl ${!u.ativo ? "opacity-60" : ""}`}>
                  <div
                    className="h-11 w-11 rounded-full flex items-center justify-center text-white text-[14px] font-bold flex-shrink-0"
                    style={{ background: gradientFor(u.nome), boxShadow: "0 4px 12px rgba(79,70,229,0.2)" }}
                  >
                    {u.nome?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-[#0F172A]">{u.nome}</p>
                    <p className="text-[12px] text-[#64748B] mt-0.5">{u.email} · <span className="font-mono">@{u.usuario}</span></p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${perfil.bg} ${perfil.text}`}>{perfil.label}</span>
                    {!u.ativo && <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-rose-50 text-rose-700">Inativo</span>}
                    <button onClick={() => openEdit(u)}
                      className="h-8 w-8 rounded-lg hover:bg-[rgba(79,70,229,0.08)] text-[#64748B] hover:text-[#4F46E5] flex items-center justify-center transition-colors"
                      title="Editar">
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    {u.ativo ? (
                      <button onClick={() => deleteMutation.mutate(u.id)} disabled={deleteMutation.isPending}
                        className="h-8 w-8 rounded-lg hover:bg-rose-50 text-[#64748B] hover:text-rose-600 flex items-center justify-center transition-colors"
                        title="Desativar">
                        <UserX className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <button onClick={() => reactivateMutation.mutate(u.id)} disabled={reactivateMutation.isPending}
                        className="h-8 w-8 rounded-lg hover:bg-emerald-50 text-[#64748B] hover:text-emerald-600 flex items-center justify-center transition-colors"
                        title="Reativar">
                        <UserCheck className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {items.length === 0 && (
              <div className="surface-card rounded-2xl py-16 text-center">
                <div className="h-16 w-16 rounded-2xl tint-blue flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-[#4F46E5]" />
                </div>
                <p className="text-[15px] font-bold text-[#0F172A]">Nenhum usuário cadastrado</p>
                <p className="text-[13px] text-[#64748B] mt-1 mb-5">Adicione membros da equipe para começar</p>
                <button onClick={openCreate}
                  className="h-9 px-4 rounded-xl text-white text-[12px] font-bold mx-auto inline-flex items-center gap-1.5"
                  style={{ background: "linear-gradient(135deg,#4F46E5,#6366F1)" }}>
                  <Plus className="h-3.5 w-3.5" />Criar primeiro usuário
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal create/edit */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar usuário" : "Novo usuário"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={e => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5 block">Nome *</label>
              <input className={inputCls} value={form.nome} onChange={e => set("nome", e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5 block">Usuário *</label>
                <input className={inputCls} value={form.usuario} onChange={e => set("usuario", e.target.value)} required autoComplete="off" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5 block">E-mail *</label>
                <input className={inputCls} type="email" value={form.email} onChange={e => set("email", e.target.value)} required />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5 block">
                Senha {editing ? <span className="normal-case font-normal text-[#94A3B8]">(deixe vazio para manter)</span> : "*"}
              </label>
              <input className={inputCls} type="password" value={form.senha} onChange={e => set("senha", e.target.value)} required={!editing} minLength={6} autoComplete="new-password" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5 block">Perfil *</label>
              <Select value={form.perfil} onValueChange={v => set("perfil", v)}>
                <SelectTrigger className="h-10 rounded-xl border border-[rgba(15,23,42,0.08)] bg-white text-[13px] shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERFIS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <button type="button" onClick={() => setOpen(false)}
                className="h-9 px-4 rounded-xl text-[12px] font-medium text-[#64748B] hover:bg-[#F8FAFC]">Cancelar</button>
              <button type="submit" disabled={saveMutation.isPending}
                className="h-9 px-4 rounded-xl text-white text-[12px] font-bold flex items-center gap-1.5 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#4F46E5,#6366F1)", boxShadow: "0 4px 12px rgba(79,70,229,0.3)" }}>
                {saveMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {editing ? "Salvar" : "Criar usuário"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
