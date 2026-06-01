"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(usuario, senha);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Usuário ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative orbs */}
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full blur-3xl opacity-30"
           style={{ background: "radial-gradient(circle, #4F46E5, transparent)" }} />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full blur-3xl opacity-30"
           style={{ background: "radial-gradient(circle, #A855F7, transparent)" }} />

      <div className="w-full max-w-[400px] relative">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="h-16 w-16 rounded-2xl flex items-center justify-center text-white text-3xl font-black mb-4 relative"
            style={{
              background: "linear-gradient(135deg,#4F46E5 0%,#7C3AED 50%,#A855F7 100%)",
              boxShadow: "0 12px 32px rgba(79,70,229,0.4), 0 0 0 1px rgba(255,255,255,0.5) inset",
            }}
          >
            K
            <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-amber-300" />
          </div>
          <h1 className="text-[28px] font-black text-[#0F172A] tracking-[-0.8px]">Krylo</h1>
          <p className="text-[13px] text-[#64748B] mt-1">Plataforma de cartões private label</p>
        </div>

        {/* Card */}
        <div className="surface-card rounded-2xl p-7">
          <div className="mb-6">
            <h2 className="text-[18px] font-bold text-[#0F172A]">Entrar na sua conta</h2>
            <p className="text-[13px] text-[#64748B] mt-0.5">Digite suas credenciais para acessar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[12px] font-bold text-[#475569] uppercase tracking-wider mb-1.5 block" htmlFor="usuario">
                Usuário
              </label>
              <input
                id="usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="seu.usuario"
                required
                autoFocus
                autoComplete="username"
                className="w-full h-11 px-4 rounded-xl border border-[rgba(15,23,42,0.08)] bg-white text-[14px] text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 transition-all shadow-sm"
              />
            </div>

            <div>
              <label className="text-[12px] font-bold text-[#475569] uppercase tracking-wider mb-1.5 block" htmlFor="senha">
                Senha
              </label>
              <input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full h-11 px-4 rounded-xl border border-[rgba(15,23,42,0.08)] bg-white text-[14px] text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 transition-all shadow-sm"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-50 border border-rose-100 text-[12px] text-rose-700 font-medium">
                <svg className="h-3.5 w-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl text-[14px] font-bold text-white transition-all active:scale-[0.98] disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg,#4F46E5 0%,#6366F1 100%)",
                boxShadow: "0 8px 24px rgba(79,70,229,0.35), 0 0 0 1px rgba(255,255,255,0.2) inset",
              }}
            >
              {loading ? "Entrando…" : "Entrar →"}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-[#94A3B8] mt-6">
          © {new Date().getFullYear()} Krylo · Todos os direitos reservados
        </p>
      </div>
    </div>
  );
}
