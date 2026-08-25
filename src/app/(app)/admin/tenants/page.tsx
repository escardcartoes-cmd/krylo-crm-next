"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Topbar } from "@/components/layout/Topbar";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { Building2, Users, Target, Power, Loader2 } from "lucide-react";
import { toast } from "sonner";

const inputCls =
  "w-full h-9 px-3 rounded-lg border border-[#CBD5E1] bg-white text-[13px] text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15 transition-colors";

const EMPTY = {
  nome_empresa: "", slug: "", plano: "starter",
  admin_nome: "", admin_email: "", admin_usuario: "", admin_senha: "",
};

export default function AdminTenantsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-tenants"],
    queryFn: () => api.get("/api/admin/tenants").then(r => r.data),
    enabled: user?.perfil === "super_admin",
  });

  const createMutation = useMutation({
    mutationFn: () => api.post("/api/admin/tenants", form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-tenants"] });
      toast.success("Tenant criado");
      setOpen(false);
      setForm(EMPTY);
    },
    onError: (err: any) => toast.error(err.response?.data?.error ?? "Erro ao criar"),
  });

  const suspendMutation = useMutation({
    mutationFn: ({ id, ativo }: { id: number; ativo: boolean }) =>
      api.put(`/api/admin/tenants/${id}/suspender`, { ativo }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-tenants"] });
      toast.success("Status atualizado");
    },
    onError: (err: any) => toast.error(err.response?.data?.error ?? "Erro"),
  });

  const set = (k: string, v: string | null) => setForm(p => ({ ...p, [k]: v ?? "" }));

  if (user && user.perfil !== "super_admin") {
    return (
      <>
        <Topbar title="Admin Krylo" />
        <div className="flex-1 px-8 pt-4">
          <div className="surface-card rounded-xl py-16 text-center">
            <p className="text-[14px] text-[#475569]">Área restrita à equipe Krylo.</p>
          </div>
        </div>
      </>
    );
  }

  const items: any[] = data?.items ?? [];

  return (
    <>
      <Topbar
        title="Tenants (clientes Krylo)"
        subtitle={`${items.length} tenants no total`}
        actions={
          <button onClick={() => setOpen(true)}
            className="h-8 px-3.5 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[13px] font-medium transition-colors">
            Novo tenant
          </button>
        }
      />

      <div className="flex-1 px-8 pt-4 pb-8">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        ) : isError ? (
          <div className="surface-card rounded-xl py-8 text-center text-[13px] text-[#B91C1C]">
            Erro ao carregar. Sua conta tem perfil super_admin?
          </div>
        ) : items.length === 0 ? (
          <div className="surface-card rounded-xl py-16 text-center">
            <p className="text-[14px] text-[#475569]">Nenhum tenant cadastrado ainda.</p>
          </div>
        ) : (
          <div className="surface-card rounded-xl overflow-hidden">
            <ul className="divide-y divide-[#F1F5F9]">
              {items.map(t => (
                <li key={t.id} className={`px-5 py-4 hover:bg-[#F8FAFC] ${!t.ativo ? "opacity-60" : ""}`}>
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-[#EEF2FF] flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-5 w-5 text-[#4F46E5]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[14px] font-semibold text-[#0F172A]">{t.nome_empresa}</p>
                        <span className="text-[11px] font-mono text-[#64748B] bg-[#F1F5F9] px-1.5 py-0.5 rounded">
                          {t.slug}
                        </span>
                        <span className="text-[11px] font-medium text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded uppercase">
                          {t.plano}
                        </span>
                        {!t.ativo && (
                          <span className="text-[11px] font-medium text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded uppercase">Suspenso</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1.5 text-[12px] text-[#64748B]">
                        <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" />{t.usuarios_count} usuários</span>
                        <span className="inline-flex items-center gap-1"><Building2 className="h-3 w-3" />{t.empresas_count} empresas</span>
                        <span className="inline-flex items-center gap-1"><Target className="h-3 w-3" />{t.oport_ativas} oport ativas</span>
                        <span className="tabular-nums text-[11px]">criado {t.criado_em?.slice(0, 10)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => suspendMutation.mutate({ id: t.id, ativo: !t.ativo })}
                      disabled={suspendMutation.isPending}
                      title={t.ativo ? "Suspender" : "Reativar"}
                      className={`h-8 px-3 rounded-lg text-[12px] font-medium flex items-center gap-1.5 flex-shrink-0 ${
                        t.ativo
                          ? "text-rose-700 bg-rose-50 hover:bg-rose-100"
                          : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                      }`}
                    >
                      <Power className="h-3.5 w-3.5" />
                      {t.ativo ? "Suspender" : "Reativar"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Modal Novo Tenant */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo tenant</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="space-y-4">
            <div>
              <label className="text-[12px] font-medium text-[#334155] mb-1 block">Nome da empresa</label>
              <input className={inputCls} value={form.nome_empresa} onChange={e => set("nome_empresa", e.target.value)} required placeholder="Escard Cartões" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-medium text-[#334155] mb-1 block">Slug (URL)</label>
                <input className={inputCls} value={form.slug} onChange={e => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} required placeholder="escard" />
              </div>
              <div>
                <label className="text-[12px] font-medium text-[#334155] mb-1 block">Plano</label>
                <Select value={form.plano} onValueChange={v => set("plano", v)}>
                  <SelectTrigger className="h-9 rounded-lg border-[#CBD5E1] bg-white text-[13px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="pt-2 border-t border-[#F1F5F9]">
              <p className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">Primeiro admin do cliente</p>
              <div className="space-y-3">
                <input className={inputCls} value={form.admin_nome} onChange={e => set("admin_nome", e.target.value)} required placeholder="Nome completo" />
                <div className="grid grid-cols-2 gap-3">
                  <input className={inputCls} type="email" value={form.admin_email} onChange={e => set("admin_email", e.target.value)} required placeholder="admin@empresa.com" />
                  <input className={inputCls} value={form.admin_usuario} onChange={e => set("admin_usuario", e.target.value.toLowerCase())} required placeholder="usuario.login" />
                </div>
                <input className={inputCls} type="password" value={form.admin_senha} onChange={e => set("admin_senha", e.target.value)} required minLength={8} placeholder="Senha (mín. 8 caracteres)" />
              </div>
            </div>
            <DialogFooter>
              <button type="button" onClick={() => setOpen(false)}
                className="h-9 px-4 rounded-lg text-[13px] text-[#475569] hover:bg-[#F1F5F9]">Cancelar</button>
              <button type="submit" disabled={createMutation.isPending}
                className="h-9 px-4 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[13px] font-medium flex items-center gap-2 disabled:opacity-60">
                {createMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Criar tenant + admin
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
