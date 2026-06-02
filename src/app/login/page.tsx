"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/brand/Logo";
import { CreditCard, TrendingUp, Bot, Sparkles, ArrowRight, Loader2 } from "lucide-react";

const inputCls =
  "w-full h-11 px-4 rounded-xl border border-[rgba(15,23,42,0.08)] bg-white text-[14px] text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 transition-all shadow-sm";

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

  const features = [
    { icon: CreditCard, label: "Cartões private label", desc: "Gestão completa de programas" },
    { icon: Bot,        label: "SDR Evolutivo com IA",  desc: "Prospecção automatizada por Claude" },
    { icon: TrendingUp, label: "Pipeline visual",        desc: "Kanban de implantações em tempo real" },
  ];

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
      {/* LEFT — brand showcase */}
      <div
        className="hidden lg:flex relative overflow-hidden text-white p-12 flex-col"
        style={{
          background: "linear-gradient(135deg,#4F46E5 0%,#7C3AED 50%,#A855F7 100%)",
        }}
      >
        {/* Decorative orbs */}
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-pink-400/30 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-indigo-300/20 blur-3xl" />

        {/* Pattern dots */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        {/* Top — logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <Logo variant="mark" size={44} />
            <div>
              <p className="text-[24px] font-extrabold tracking-[-0.5px] leading-none">Krylo</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70 mt-1.5">
                Cartões & Benefícios
              </p>
            </div>
          </div>
        </div>

        {/* Middle — pitch */}
        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-md">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-[11px] font-bold uppercase tracking-wider mb-5 w-fit">
            <Sparkles className="h-3 w-3" />
            Plataforma SaaS
          </div>
          <h1 className="text-[42px] font-black tracking-[-1.5px] leading-[1.05] mb-4">
            CRM inteligente para vendas de cartões.
          </h1>
          <p className="text-[16px] text-white/80 leading-relaxed mb-8">
            Prospecte, negocie e implante programas de cartão private label e benefícios em uma única plataforma.
          </p>

          {/* Features */}
          <div className="space-y-3">
            {features.map((f, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <f.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[14px] font-bold leading-tight">{f.label}</p>
                  <p className="text-[12px] text-white/70 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 flex items-center justify-between text-[11px] text-white/60">
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

        <div className="w-full max-w-[400px]">
          <div className="mb-8">
            <h2 className="text-[28px] font-extrabold text-[#0F172A] tracking-[-0.8px]">Bem-vindo de volta</h2>
            <p className="text-[14px] text-[#64748B] mt-1.5">Entre na sua conta para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[12px] font-bold text-[#475569] uppercase tracking-wider mb-2 block" htmlFor="usuario">
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
              <div className="flex items-center justify-between mb-2">
                <label className="text-[12px] font-bold text-[#475569] uppercase tracking-wider" htmlFor="senha">
                  Senha
                </label>
                <a href="#" className="text-[11px] font-semibold text-[#4F46E5] hover:underline">
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
              className="w-full h-12 rounded-xl text-[14px] font-bold text-white transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg,#4F46E5 0%,#6366F1 100%)",
                boxShadow: "0 8px 24px rgba(79,70,229,0.35), 0 0 0 1px rgba(255,255,255,0.2) inset",
              }}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Entrar<ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          {/* Divider + helper */}
          <div className="mt-8 pt-6 border-t border-[rgba(15,23,42,0.06)] text-center">
            <p className="text-[12px] text-[#64748B]">
              Precisa de ajuda?{" "}
              <a href="mailto:suporte@krylo.com.br" className="font-semibold text-[#4F46E5] hover:underline">
                Fale conosco
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
