"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Topbar } from "@/components/layout/Topbar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const inputCls = "w-full h-9 px-3 rounded-lg border border-[#CBD5E1] bg-white text-[13px] text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15 transition-colors";

export default function ContaPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [profile, setProfile] = useState({ nome: "", email: "" });
  const [pw, setPw] = useState({ senha_atual: "", nova_senha: "", confirmar: "" });

  const { data: security } = useQuery({
    queryKey: ["me-security"],
    queryFn: () => api.get("/api/me").then((r) => r.data),
    enabled: !!user,
  });

  const twoFAEnabled = !!security?.dois_fatores_ativo;
  const twoFAChannel = security?.dois_fatores_canal ?? "email";

  useEffect(() => {
    if (user) setProfile({ nome: user.nome ?? "", email: user.email ?? "" });
  }, [user]);

  const securityMutation = useMutation({
    mutationFn: (payload: { dois_fatores_ativo: boolean; dois_fatores_canal: string }) =>
      api.put("/api/me/security", payload).then((r) => r.data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["me-security"] });
      toast.success(data.dois_fatores_ativo ? "2FA ativado" : "2FA desativado");
    },
    onError: (err: any) => toast.error(err.response?.data?.error ?? "Erro ao atualizar 2FA"),
  });

  const profileMutation = useMutation({
    mutationFn: () => api.put("/api/me", profile),
    onSuccess: () => toast.success("Perfil atualizado"),
    onError: (err: any) => toast.error(err.response?.data?.error ?? "Erro ao atualizar"),
  });

  const pwMutation = useMutation({
    mutationFn: () => {
      if (pw.nova_senha !== pw.confirmar) throw new Error("Senhas não coincidem");
      if (pw.nova_senha.length < 6) throw new Error("Senha deve ter pelo menos 6 caracteres");
      return api.put("/api/me", { senha_atual: pw.senha_atual, nova_senha: pw.nova_senha });
    },
    onSuccess: () => {
      toast.success("Senha alterada");
      setPw({ senha_atual: "", nova_senha: "", confirmar: "" });
    },
    onError: (err: any) => toast.error(err.response?.data?.error ?? err.message ?? "Erro"),
  });

  if (!user) return null;

  const permLabel: Record<string, string> = {
    admin: "Acesso total ao sistema incluindo configurações e gestão de usuários.",
    gerente: "Acesso a vendas, prospecção e relatórios. Não pode gerenciar usuários.",
    vendedor: "Acesso a empresas, contatos, oportunidades e atividades próprias.",
    visualizador: "Apenas leitura — não pode editar dados.",
  };

  return (
    <>
      <Topbar title="Minha conta" />

      <div className="flex-1 px-8 pt-4 pb-8">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">

          <div className="space-y-4">
            <div className="surface-card rounded-xl p-6">
              <h3 className="text-[13px] font-semibold text-[#0F172A] pb-3 border-b border-[#F1F5F9] mb-4">Dados pessoais</h3>
              <form onSubmit={e => { e.preventDefault(); profileMutation.mutate(); }} className="space-y-3.5">
                <div>
                  <label className="text-[12px] font-medium text-[#334155] mb-1.5 block">Nome</label>
                  <input className={inputCls} value={profile.nome} onChange={e => setProfile(p => ({...p, nome: e.target.value}))} required placeholder="Seu nome completo" />
                </div>
                <div>
                  <label className="text-[12px] font-medium text-[#334155] mb-1.5 block">E-mail</label>
                  <input className={inputCls} type="email" value={profile.email} onChange={e => setProfile(p => ({...p, email: e.target.value}))} required placeholder="voce@empresa.com" />
                </div>
                <div>
                  <label className="text-[12px] font-medium text-[#334155] mb-1.5 block">Usuário <span className="text-[#94A3B8] font-normal">(não editável)</span></label>
                  <input className={`${inputCls} bg-[#F8FAFC] cursor-not-allowed`} value={user.usuario} disabled />
                </div>
                <button type="submit" disabled={profileMutation.isPending}
                  className="h-9 px-4 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[13px] font-medium flex items-center gap-2 disabled:opacity-60 transition-colors">
                  {profileMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Salvar perfil
                </button>
              </form>
            </div>

            <div className="surface-card rounded-xl p-6">
              <h3 className="text-[13px] font-semibold text-[#0F172A] pb-3 border-b border-[#F1F5F9] mb-4">Alterar senha</h3>
              <form onSubmit={e => { e.preventDefault(); pwMutation.mutate(); }} className="space-y-3.5">
                <div>
                  <label className="text-[12px] font-medium text-[#334155] mb-1.5 block">Senha atual</label>
                  <input className={inputCls} type="password" value={pw.senha_atual} onChange={e => setPw(p => ({...p, senha_atual: e.target.value}))} required autoComplete="current-password" placeholder="••••••••" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[12px] font-medium text-[#334155] mb-1.5 block">Nova senha</label>
                    <input className={inputCls} type="password" value={pw.nova_senha} onChange={e => setPw(p => ({...p, nova_senha: e.target.value}))} required minLength={6} autoComplete="new-password" placeholder="Mín. 6 caracteres" />
                  </div>
                  <div>
                    <label className="text-[12px] font-medium text-[#334155] mb-1.5 block">Confirmar</label>
                    <input className={inputCls} type="password" value={pw.confirmar} onChange={e => setPw(p => ({...p, confirmar: e.target.value}))} required minLength={6} autoComplete="new-password" placeholder="Repita a nova senha" />
                  </div>
                </div>
                <button type="submit" disabled={pwMutation.isPending}
                  className="h-9 px-4 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[13px] font-medium flex items-center gap-2 disabled:opacity-60 transition-colors">
                  {pwMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Alterar senha
                </button>
              </form>
            </div>

            <div className="surface-card rounded-xl p-6">
              <div className="flex items-start justify-between gap-4 pb-3 border-b border-[#F1F5F9] mb-4">
                <div className="flex items-start gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-semibold text-[#0F172A]">Autenticação em dois fatores</h3>
                    <p className="text-[12px] text-[#64748B] mt-0.5">
                      Envia um código de 6 dígitos por email ou WhatsApp a cada login.
                    </p>
                  </div>
                </div>
                <label className="inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={twoFAEnabled}
                    onChange={(e) =>
                      securityMutation.mutate({
                        dois_fatores_ativo: e.target.checked,
                        dois_fatores_canal: twoFAChannel,
                      })
                    }
                    disabled={securityMutation.isPending}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-[#E2E8F0] peer-checked:bg-[#4F46E5] rounded-full transition-colors peer-disabled:opacity-60 relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-4" />
                </label>
              </div>
              {twoFAEnabled && (
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-[#334155] block">Canal de envio</label>
                  <Select
                    value={twoFAChannel}
                    onValueChange={(v) =>
                      securityMutation.mutate({ dois_fatores_ativo: true, dois_fatores_canal: v })
                    }
                  >
                    <SelectTrigger className="h-9 rounded-lg border-[#CBD5E1] bg-white text-[13px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">E-mail</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 h-fit xl:sticky xl:top-4">
            <div className="surface-card rounded-xl p-5 text-center">
              <div className="h-16 w-16 rounded-full bg-[#4F46E5] text-white text-[22px] font-medium flex items-center justify-center mx-auto mb-3">
                {user.nome?.[0]?.toUpperCase()}
              </div>
              <p className="text-[15px] font-medium text-[#0F172A]">{user.nome}</p>
              <p className="text-[12px] text-[#64748B] mt-0.5">@{user.usuario}</p>
              <span className="inline-flex items-center text-[11px] font-medium px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 mt-2 capitalize">
                {user.perfil}
              </span>
            </div>

            <div className="surface-card rounded-xl p-5">
              <h3 className="text-[13px] font-semibold text-[#0F172A] pb-3 border-b border-[#F1F5F9] mb-4">Permissões</h3>
              <p className="text-[13px] text-[#334155] leading-relaxed">{permLabel[user.perfil] ?? "—"}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
