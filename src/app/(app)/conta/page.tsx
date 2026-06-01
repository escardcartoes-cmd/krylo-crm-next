"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Topbar } from "@/components/layout/Topbar";
import { User, Lock, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

const inputCls = "w-full h-10 pl-3.5 pr-3.5 rounded-xl bg-white border border-[rgba(15,23,42,0.08)] text-[13px] text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 transition-all shadow-sm";

export default function ContaPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ nome: "", email: "" });
  const [pw, setPw] = useState({ senha_atual: "", nova_senha: "", confirmar: "" });

  useEffect(() => {
    if (user) setProfile({ nome: user.nome ?? "", email: user.email ?? "" });
  }, [user]);

  const profileMutation = useMutation({
    mutationFn: () => api.put("/api/me", profile),
    onSuccess: () => toast.success("Perfil atualizado!"),
    onError: (err: any) => toast.error(err.response?.data?.error ?? "Erro ao atualizar"),
  });

  const pwMutation = useMutation({
    mutationFn: () => {
      if (pw.nova_senha !== pw.confirmar) throw new Error("Senhas não coincidem");
      if (pw.nova_senha.length < 6) throw new Error("Senha deve ter pelo menos 6 caracteres");
      return api.put("/api/me", {
        senha_atual: pw.senha_atual,
        nova_senha: pw.nova_senha,
      });
    },
    onSuccess: () => {
      toast.success("Senha alterada!");
      setPw({ senha_atual: "", nova_senha: "", confirmar: "" });
    },
    onError: (err: any) => toast.error(err.response?.data?.error ?? err.message ?? "Erro"),
  });

  if (!user) return null;

  return (
    <>
      <Topbar
        title="Minha Conta"
        subtitle="Gerencie suas informações pessoais e senha"
      />

      <div className="flex-1 px-8 pt-4 pb-8">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">

          {/* LEFT — forms */}
          <div className="space-y-4">
            {/* Profile */}
            <div className="surface-card rounded-2xl p-6">
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl tint-blue mb-5">
                <User className="h-4 w-4 text-[#4F46E5]" />
                <span className="text-[12px] font-bold uppercase tracking-wider text-[#4F46E5]">Dados pessoais</span>
              </div>
              <form onSubmit={e => { e.preventDefault(); profileMutation.mutate(); }} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5 block">Nome</label>
                  <input className={inputCls} value={profile.nome} onChange={e => setProfile(p => ({...p, nome: e.target.value}))} required />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5 block">E-mail</label>
                  <input className={inputCls} type="email" value={profile.email} onChange={e => setProfile(p => ({...p, email: e.target.value}))} required />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5 block">Usuário <span className="normal-case font-normal text-[#94A3B8]">(não editável)</span></label>
                  <input className={`${inputCls} bg-[#F8FAFC] cursor-not-allowed`} value={user.usuario} disabled />
                </div>
                <button type="submit" disabled={profileMutation.isPending}
                  className="h-10 px-5 rounded-xl text-white text-[13px] font-bold flex items-center gap-2 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg,#4F46E5,#6366F1)", boxShadow: "0 4px 12px rgba(79,70,229,0.3)" }}>
                  {profileMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Salvar perfil
                </button>
              </form>
            </div>

            {/* Password */}
            <div className="surface-card rounded-2xl p-6">
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl tint-amber mb-5">
                <Lock className="h-4 w-4 text-amber-700" />
                <span className="text-[12px] font-bold uppercase tracking-wider text-amber-700">Alterar senha</span>
              </div>
              <form onSubmit={e => { e.preventDefault(); pwMutation.mutate(); }} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5 block">Senha atual</label>
                  <input className={inputCls} type="password" value={pw.senha_atual} onChange={e => setPw(p => ({...p, senha_atual: e.target.value}))} required autoComplete="current-password" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5 block">Nova senha</label>
                    <input className={inputCls} type="password" value={pw.nova_senha} onChange={e => setPw(p => ({...p, nova_senha: e.target.value}))} required minLength={6} autoComplete="new-password" />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5 block">Confirmar</label>
                    <input className={inputCls} type="password" value={pw.confirmar} onChange={e => setPw(p => ({...p, confirmar: e.target.value}))} required minLength={6} autoComplete="new-password" />
                  </div>
                </div>
                <button type="submit" disabled={pwMutation.isPending}
                  className="h-10 px-5 rounded-xl text-white text-[13px] font-bold flex items-center gap-2 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg,#F59E0B,#EF4444)", boxShadow: "0 4px 12px rgba(245,158,11,0.3)" }}>
                  {pwMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                  Alterar senha
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT — info card */}
          <div className="space-y-4 h-fit xl:sticky xl:top-4">
            <div
              className="rounded-2xl p-6 text-white relative overflow-hidden text-center"
              style={{
                background: "linear-gradient(135deg,#4F46E5 0%,#7C3AED 50%,#A855F7 100%)",
                boxShadow: "0 10px 40px rgba(79,70,229,0.3)",
              }}
            >
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-[32px] font-black mx-auto mb-4">
                  {user.nome?.[0]?.toUpperCase()}
                </div>
                <p className="text-[18px] font-extrabold">{user.nome}</p>
                <p className="text-[12px] text-white/70 mt-0.5">@{user.usuario}</p>
                <div className="inline-block mt-3 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-[11px] font-bold uppercase tracking-wider">
                  {user.perfil}
                </div>
              </div>
            </div>

            <div className="surface-card rounded-2xl p-5">
              <p className="text-[12px] font-bold text-[#475569] uppercase tracking-wider mb-3">Permissões</p>
              <p className="text-[12px] text-[#64748B] leading-relaxed">
                {user.perfil === "admin" && "Acesso total ao sistema incluindo configurações e gestão de usuários."}
                {user.perfil === "gerente" && "Acesso a vendas, prospecção e relatórios. Não pode gerenciar usuários."}
                {user.perfil === "vendedor" && "Acesso a empresas, contatos, oportunidades e atividades próprias."}
                {user.perfil === "visualizador" && "Apenas leitura — não pode editar dados."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
