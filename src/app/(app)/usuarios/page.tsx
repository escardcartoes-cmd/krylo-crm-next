"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Topbar } from "@/components/layout/Topbar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, UserX, UserCheck, Loader2, Mail, Copy } from "lucide-react";
import { toast } from "sonner";

const PERFIS = [
  { value: "admin",        label: "Admin",        bg: "bg-violet-100",  text: "text-violet-700" },
  { value: "gerente",      label: "Gerente",      bg: "bg-sky-100",     text: "text-sky-700" },
  { value: "vendedor",     label: "Vendedor",     bg: "bg-emerald-100", text: "text-emerald-700" },
  { value: "visualizador", label: "Visualizador", bg: "bg-slate-100",   text: "text-slate-600" },
];

const inputCls = "w-full h-9 px-3 rounded-lg border border-[#CBD5E1] bg-white text-[13px] text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15 transition-colors";

const EMPTY = { nome: "", email: "", usuario: "", senha: "", perfil: "vendedor", ativo: 1 };

const INVITE_EMPTY = { nome: "", email: "", usuario: "", perfil: "vendedor" };

export default function UsuariosPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(EMPTY);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState(INVITE_EMPTY);
  const [inviteResult, setInviteResult] = useState<{ link: string; email_status: string } | null>(null);

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

  const inviteMutation = useMutation({
    mutationFn: () => api.post("/api/usuarios/convidar", inviteForm).then(r => r.data),
    onSuccess: (r: any) => {
      qc.invalidateQueries({ queryKey: ["usuarios"] });
      setInviteResult({ link: r.link, email_status: r.email_status });
      if (r.email_status === "enviado") toast.success("Convite enviado por email");
      else toast.warning("Convite criado — copie o link e envie manualmente");
    },
    onError: (err: any) => toast.error(err.response?.data?.error ?? "Erro ao convidar"),
  });

  const setI = (k: string, v: string | null) => setInviteForm(p => ({ ...p, [k]: v ?? "" }));

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
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setInviteForm(INVITE_EMPTY); setInviteResult(null); setInviteOpen(true); }}
              className="h-8 px-3.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[#475569] text-[13px] font-medium transition-colors inline-flex items-center gap-1.5"
            >
              <Mail className="h-3.5 w-3.5" />
              Convidar por email
            </button>
            <button onClick={openCreate}
              className="h-8 px-3.5 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[13px] font-medium transition-colors">
              Novo usuário
            </button>
          </div>
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
              <input className={inputCls} value={form.nome} onChange={e => set("nome", e.target.value)} required placeholder="Nome completo" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-medium text-[#334155] mb-1.5 block">Usuário</label>
                <input className={inputCls} value={form.usuario} onChange={e => set("usuario", e.target.value)} required autoComplete="off" placeholder="usuario.login" />
              </div>
              <div>
                <label className="text-[12px] font-medium text-[#334155] mb-1.5 block">E-mail</label>
                <input className={inputCls} type="email" value={form.email} onChange={e => set("email", e.target.value)} required placeholder="usuario@empresa.com" />
              </div>
            </div>
            <div>
              <label className="text-[12px] font-medium text-[#334155] mb-1.5 block">
                Senha {editing && <span className="text-[#94A3B8] font-normal">(deixe vazio para manter)</span>}
              </label>
              <input className={inputCls} type="password" value={form.senha} onChange={e => set("senha", e.target.value)} required={!editing} minLength={6} autoComplete="new-password" placeholder="Mín. 6 caracteres" />
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

      {/* Modal Convidar por email */}
      <Dialog open={inviteOpen} onOpenChange={(o) => { setInviteOpen(o); if (!o) setInviteResult(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convidar usuário por email</DialogTitle>
          </DialogHeader>

          {inviteResult ? (
            <div className="space-y-4">
              <div className={`rounded-lg px-4 py-3 text-[13px] ${
                inviteResult.email_status === "enviado"
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
                  : "bg-amber-50 border border-amber-200 text-amber-900"
              }`}>
                {inviteResult.email_status === "enviado"
                  ? "E-mail com link de ativação enviado. Válido por 7 dias."
                  : "Convite criado. Envio de email falhou — copie o link abaixo e envie manualmente."}
              </div>
              <div>
                <label className="text-[12px] font-medium text-[#334155] mb-1.5 block">Link de ativação</label>
                <div className="flex gap-2">
                  <input readOnly value={inviteResult.link} className={`${inputCls} font-mono text-[11px]`} />
                  <button
                    type="button"
                    onClick={() => { navigator.clipboard.writeText(inviteResult.link); toast.success("Link copiado"); }}
                    className="h-9 px-3 rounded-lg border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#475569] flex items-center gap-1.5"
                  >
                    <Copy className="h-3.5 w-3.5" />Copiar
                  </button>
                </div>
              </div>
              <DialogFooter>
                <button type="button" onClick={() => { setInviteOpen(false); setInviteResult(null); }}
                  className="h-9 px-4 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[13px] font-medium">
                  Fechar
                </button>
              </DialogFooter>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); inviteMutation.mutate(); }} className="space-y-4">
              <div>
                <label className="text-[12px] font-medium text-[#334155] mb-1.5 block">Nome</label>
                <input className={inputCls} value={inviteForm.nome} onChange={e => setI("nome", e.target.value)} required placeholder="Nome completo" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-medium text-[#334155] mb-1.5 block">E-mail</label>
                  <input className={inputCls} type="email" value={inviteForm.email} onChange={e => setI("email", e.target.value.toLowerCase())} required placeholder="usuario@empresa.com" />
                </div>
                <div>
                  <label className="text-[12px] font-medium text-[#334155] mb-1.5 block">Usuário</label>
                  <input className={inputCls} value={inviteForm.usuario} onChange={e => setI("usuario", e.target.value.toLowerCase())} required placeholder="usuario.login" />
                </div>
              </div>
              <div>
                <label className="text-[12px] font-medium text-[#334155] mb-1.5 block">Perfil</label>
                <Select value={inviteForm.perfil} onValueChange={v => setI("perfil", v)}>
                  <SelectTrigger className="h-9 rounded-lg border-[#CBD5E1] bg-white text-[13px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PERFIS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-[12px] text-[#64748B] bg-[#F8FAFC] rounded-md px-3 py-2">
                O convidado recebe um email com link pra definir a própria senha. Link válido por 7 dias.
              </p>
              <DialogFooter>
                <button type="button" onClick={() => setInviteOpen(false)}
                  className="h-9 px-4 rounded-lg text-[13px] text-[#475569] hover:bg-[#F1F5F9]">Cancelar</button>
                <button type="submit" disabled={inviteMutation.isPending}
                  className="h-9 px-4 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[13px] font-medium flex items-center gap-2 disabled:opacity-60">
                  {inviteMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Enviar convite
                </button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
