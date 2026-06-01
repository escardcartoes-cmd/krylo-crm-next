"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

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
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg,#F0F4FF 0%,#F2F2F7 50%,#EEF3FF 100%)" }}
    >
      <div className="w-full max-w-[360px]">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="h-14 w-14 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-4"
            style={{ background: "linear-gradient(135deg,#0057FF,#338BFF)", boxShadow: "0 8px 24px rgba(0,87,255,0.3)" }}
          >
            K
          </div>
          <h1 className="text-[22px] font-bold text-[#1C1C1E] tracking-[-0.4px]">Krylo</h1>
          <p className="text-[13px] text-[#8E8E93] mt-1">Plataforma de cartões private label</p>
        </div>

        {/* Card */}
        <div
          className="bg-white rounded-2xl p-6"
          style={{ boxShadow: "0 0 0 1px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.1)" }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-[#3A3A3C]" htmlFor="usuario">
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
                className="w-full h-10 px-3.5 rounded-xl border border-[rgba(0,0,0,0.1)] bg-[#F9F9FB] text-[13px] text-[#1C1C1E] placeholder-[#C7C7CC] outline-none focus:border-[#0057FF] focus:ring-2 focus:ring-[#0057FF]/10 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-[#3A3A3C]" htmlFor="senha">
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
                className="w-full h-10 px-3.5 rounded-xl border border-[rgba(0,0,0,0.1)] bg-[#F9F9FB] text-[13px] text-[#1C1C1E] placeholder-[#C7C7CC] outline-none focus:border-[#0057FF] focus:ring-2 focus:ring-[#0057FF]/10 transition-all"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#FFF1F0] border border-[#FFD5D2] text-[12px] text-[#FF3B30]">
                <svg className="h-3.5 w-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-xl text-[13px] font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#0057FF,#338BFF)", boxShadow: "0 2px 8px rgba(0,87,255,0.3)" }}
            >
              {loading ? "Entrando…" : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
