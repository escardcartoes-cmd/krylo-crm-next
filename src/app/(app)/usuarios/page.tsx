"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Topbar } from "@/components/layout/Topbar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, UserX, UserCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

const PERFIS = [
  { value: "admin",        label: "Admin",        bg: "bg-violet-100",  text: "text-violet-700" },
  { value: "gerente",      label: "Gerente",      bg: "bg-sky-100",     text: "text-sky-700" },
  { value: "vendedor",     label: "Vendedor",     bg: "bg-emerald-100", text: "text-emerald-700" },
  { value: "visualizador", label: "Visualizador", bg: "bg-slate-100",   text: "text-slate-600" },
];

const inputCls = "w-full h-9 px-3 rounded-lg border border-[#CBD5E1] bg-white text-[13px] text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15 transition-colors";

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
      toast.success(editing ? "Usuário atualizado" : "Usuário criado");
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

  function openCreate() { setEditing(null); setForm(EMPTY); setOpen(true); }
  function openEdit(u: any) {
    setEditing(u);
    setForm({
      nome: u.nome ?? "", email: u.email ?? "", usuario: u.usuario ?? "",
      senha: "", perfil: u.perfil ?? "vendedor", ativo: u.ativo ? 1 : 0,
    });
    setOpen(true);
  }
  function set(k: string, v: string | number | null) { setForm((p: any) => ({ ...p, [k]: v ?? "" })); }

  return (
    <>
      <Topbar
        title="Usuários"
        subtitle={`${ativos} ativo${ativos !== 1 ? "s" : ""} · ${inativos} inativo${inativos !== 1 ? "s" : ""}`}
        actions={
          <button onClick={openCreate}
            className="h-8 px-3.5 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[13px] font-medium transition-colors">
            Novo usuário
          </button>
        }
      />

      <div className="flex-1 px-8 pt-4 pb-8 space-y-4">
        {isLoading ? (
          <div className="surface-card rounded-xl divide-y divide-[#F1F5F9]">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-[60px]" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="surface-card rounded-xl py-16 text-center">
            <p className="text-[14px] text-[#475569]">Nenhum usuário cadastrado.</p>
            <button onClick={openCreate}
              className="h-9 px-4 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[13px] font-medium mt-4 transition-colors">
              Criar primeiro usuário
            </button>
          </div>
        ) : (
          <div className="surface-card rounded-xl overflow-hidden">
            <ul className="divide-y divide-[#F1F5F9]">
              {items.map(u => {
                const perfil = PERFIS.find(p => p.value === u.perfil) ?? { label: u.perfil, bg: "bg-slate-100", text: "text-slate-700" };
                return (
                  <li key={u.id} className={`flex items-center gap-4 px-5 py-3.5 hover:bg-[#F8FAFC] ${!u.ativo ? "opacity-60" : ""}`}>
                    <div className="h-8 w-8 rounded-full bg-[#4F46E5] text-white text-[12px] font-medium flex items-center justify-center flex-shrink-0">
                      {u.nome?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-[#0F172A]">{u.nome}</p>
                      <p className="text-[12px] text-[#64748B] mt-0.5">{u.email} · <span className="font-mono">@{u.usuario}</span></p>
                    </div>
                    <span className={`inline-flex items-center text-[11px] font-medium px-1.5 py-0.5 rounded ${perfil.bg} ${perfil.text}`}>
                      {perfil.label}
                    </span>
                    {!u.ativo && (
                      <span className="inline-flex items-center text-[11px] font-medium px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">
                        Inativo
                      </span>
                    )}
                    <button onClick={() => openEdit(u)}
                      className="h-8 w-8 rounded-lg hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] flex items-center justify-center transition-colors"
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
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar usuário" : "Novo usuário"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={e => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
            <div>
              <label className="text-[12px] font-medium text-[#334155] mb-1.5 block">Nome</label>
              <input className={inputCls} value={form.nome} onChange={e => set("nome", e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-medium text-[#334155] mb-1.5 block">Usuário</label>
                <input className={inputCls} value={form.usuario} onChange={e => set("usuario", e.target.value)} required autoComplete="off" />
              </div>
              <div>
                <label className="text-[12px] font-medium text-[#334155] mb-1.5 block">E-mail</label>
                <input className={inputCls} type="email" value={form.email} onChange={e => set("email", e.target.value)} required />
              </div>
            </div>
            <div>
              <label className="text-[12px] font-medium text-[#334155] mb-1.5 block">
                Senha {editing && <span className="text-[#94A3B8] font-normal">(deixe vazio para manter)</span>}
              </label>
              <input className={inputCls} type="password" value={form.senha} onChange={e => set("senha", e.target.value)} required={!editing} minLength={6} autoComplete="new-password" />
            </div>
            <div>
              <label className="text-[12px] font-medium text-[#334155] mb-1.5 block">Perfil</label>
              <Select value={form.perfil} onValueChange={v => set("perfil", v)}>
                <SelectTrigger className="h-9 rounded-lg border-[#CBD5E1] bg-white text-[13px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERFIS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <button type="button" onClick={() => setOpen(false)}
                className="h-9 px-4 rounded-lg text-[13px] text-[#475569] hover:bg-[#F1F5F9] transition-colors">Cancelar</button>
              <button type="submit" disabled={saveMutation.isPending}
                className="h-9 px-4 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[13px] font-medium flex items-center gap-1.5 disabled:opacity-60 transition-colors">
                {saveMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {editing ? "Salvar" : "Criar"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
