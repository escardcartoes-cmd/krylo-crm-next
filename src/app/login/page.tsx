"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/brand/Logo";
import { ArrowRight, Loader2 } from "lucide-react";

const inputCls =
  "w-full h-11 px-4 rounded-lg border border-[#CBD5E1] bg-white text-[14px] text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15 transition-colors";

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
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
      {/* LEFT — brand panel */}
      <div
        className="hidden lg:flex relative overflow-hidden text-white p-12 flex-col justify-between"
        style={{ background: "linear-gradient(160deg,#312E81 0%,#4338CA 50%,#5B21B6 100%)" }}
      >
        {/* Top */}
        <div className="flex items-center gap-3">
          <Logo variant="mark" size={40} />
          <span className="text-[26px] font-bold tracking-[-0.5px]">Krylo</span>
        </div>

        {/* Middle */}
        <div className="max-w-md">
          <h1 className="text-[40px] font-bold tracking-[-1.2px] leading-[1.05] mb-5">
            CRM para vendas de cartões e benefícios.
          </h1>
          <p className="text-[15px] text-white/70 leading-relaxed">
            Prospecte, negocie e implante programas de cartão private label.
            Pipeline visual, cadências automatizadas e gestão de carteira em um só lugar.
          </p>
        </div>

        {/* Bottom */}
        <div className="flex items-center justify-between text-[12px] text-white/50">
          <span>© {new Date().getFullYear()} Krylo</span>
          <span className="font-mono">krylo.com.br</span>
        </div>
      </div>

      {/* RIGHT — form */}
      <div className="flex items-center justify-center p-6 sm:p-12 relative">
        {/* Mobile-only logo */}
        <div className="lg:hidden absolute top-8 left-1/2 -translate-x-1/2">
          <Logo variant="full" size={36} />
        </div>

        <div className="w-full max-w-[380px]">
          <h2 className="text-[24px] font-bold text-[#0F172A] tracking-[-0.4px]">Entrar</h2>
          <p className="text-[14px] text-[#64748B] mt-1 mb-8">
            Use suas credenciais para acessar o painel
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[13px] font-medium text-[#334155] mb-1.5 block" htmlFor="usuario">
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
                className={inputCls}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[13px] font-medium text-[#334155]" htmlFor="senha">
                  Senha
                </label>
                <a href="#" className="text-[12px] text-[#4F46E5] hover:underline">
                  Esqueci a senha
                </a>
              </div>
              <input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className={inputCls}
              />
            </div>

            {error && (
              <div className="text-[13px] text-[#B91C1C] bg-[#FEF2F2] border border-[#FECACA] rounded-lg px-3.5 py-2.5">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg text-[14px] font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] active:bg-[#3730A3] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Entrar <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
