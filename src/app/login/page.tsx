"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/brand/Logo";
import { Loader2 } from "lucide-react";

const inputCls =
  "w-full h-11 px-3.5 rounded-md border border-[#E2E8F0] bg-white text-[14px] text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] transition-all";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("reset") === "ok") {
      toast.success("Senha redefinida. Faça login com a nova senha.");
    }
  }, [searchParams]);

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
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] bg-white">
      {/* LEFT — brand */}
      <aside className="hidden lg:flex relative bg-[#0B0F1A] text-white flex-col justify-between p-10 xl:p-14 overflow-hidden">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Soft glow */}
        <div
          className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full opacity-[0.18] pointer-events-none blur-3xl"
          style={{ background: "radial-gradient(circle,#6366F1 0%,transparent 70%)" }}
        />

        {/* Top: brand */}
        <div className="relative flex items-center gap-2.5">
          <Logo variant="mark" size={32} />
          <span className="text-[19px] font-semibold tracking-[-0.4px]">Krylo</span>
        </div>

        {/* Middle: quote */}
        <div className="relative max-w-[440px]">
          <p className="text-[22px] xl:text-[26px] leading-[1.35] font-medium tracking-[-0.4px] text-white">
            &ldquo;Dobramos a carteira de cartões private label em oito meses.
            O pipeline do Krylo virou o centro de operação do time comercial.&rdquo;
          </p>
          <div className="mt-6 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center text-[13px] font-semibold">
              RC
            </div>
            <div className="text-[13px]">
              <p className="font-medium text-white">Roberto Cassiano</p>
              <p className="text-white/50">Diretor comercial · Escard Cartões</p>
            </div>
          </div>
        </div>

        {/* Bottom: stats */}
        <div className="relative grid grid-cols-3 gap-6 pt-6 border-t border-white/10">
          <div>
            <p className="text-[22px] font-semibold tracking-[-0.6px]">+142%</p>
            <p className="text-[11.5px] text-white/50 mt-1">pipeline qualificado</p>
          </div>
          <div>
            <p className="text-[22px] font-semibold tracking-[-0.6px]">37 dias</p>
            <p className="text-[11.5px] text-white/50 mt-1">ciclo médio de venda</p>
          </div>
          <div>
            <p className="text-[22px] font-semibold tracking-[-0.6px]">98%</p>
            <p className="text-[11.5px] text-white/50 mt-1">retenção de contas</p>
          </div>
        </div>
      </aside>

      {/* RIGHT — form */}
      <section className="flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <header className="lg:hidden h-16 px-6 flex items-center border-b border-[#F1F5F9]">
          <div className="flex items-center gap-2.5">
            <Logo variant="mark" size={28} />
            <span className="text-[17px] font-semibold tracking-[-0.3px] text-[#0F172A]">Krylo</span>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-[380px]">
            <div className="mb-8">
              <h1 className="text-[26px] font-semibold text-[#0F172A] tracking-[-0.6px] leading-[1.15]">
                Entrar na sua conta
              </h1>
              <p className="text-[14px] text-[#64748B] mt-2">
                Acesse o painel comercial da Escard.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  className="text-[12.5px] font-medium text-[#0F172A] mb-1.5 block"
                  htmlFor="usuario"
                >
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
                  <label
                    className="text-[12.5px] font-medium text-[#0F172A]"
                    htmlFor="senha"
                  >
                    Senha
                  </label>
                  <Link
                    href="/esqueci-senha"
                    className="text-[12px] text-[#64748B] hover:text-[#0F172A] transition-colors"
                  >
                    Esqueci
                  </Link>
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
                <div className="text-[13px] text-[#B91C1C] bg-[#FEF2F2] border border-[#FECACA] rounded-md px-3 py-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-md text-[14px] font-medium text-white bg-[#0F172A] hover:bg-[#1E293B] active:bg-black transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar"}
              </button>
            </form>

            <p className="text-[12.5px] text-[#94A3B8] text-center mt-8">
              Problemas para acessar? Fale com o admin.
            </p>
          </div>
        </main>

        <footer className="h-14 px-6 flex items-center justify-between text-[12px] text-[#94A3B8] border-t border-[#F1F5F9]">
          <span>© {new Date().getFullYear()} Krylo</span>
          <span className="font-mono">krylo.com.br</span>
        </footer>
      </section>
    </div>
  );
}
