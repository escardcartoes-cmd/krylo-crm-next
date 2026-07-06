"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { Logo } from "@/components/brand/Logo";
import { ArrowLeft, Loader2 } from "lucide-react";

const inputCls =
  "w-full h-11 px-3.5 rounded-md border border-[#E2E8F0] bg-white text-[14px] text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] transition-all";

function RedefinirSenhaPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [codigo, setCodigo] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (novaSenha !== confirmar) {
      setError("As senhas não coincidem.");
      return;
    }
    if (novaSenha.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/api/auth/reset-password", {
        email,
        codigo,
        nova_senha: novaSenha,
      });
      router.push("/login?reset=ok");
    } catch (err: any) {
      setError(err.response?.data?.error || "Não foi possível redefinir a senha.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <header className="h-16 px-6 flex items-center">
        <div className="flex items-center gap-2.5">
          <Logo variant="mark" size={28} />
          <span className="text-[17px] font-semibold tracking-[-0.3px] text-[#0F172A]">Krylo</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 pb-16">
        <div className="w-full max-w-[400px]">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-[13px] text-[#64748B] hover:text-[#0F172A] transition-colors mb-6"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar para o login
          </Link>

          <h1 className="text-[26px] font-semibold text-[#0F172A] tracking-[-0.6px] leading-[1.15]">
            Redefinir senha
          </h1>
          <p className="text-[14px] text-[#64748B] mt-2 mb-8">
            Digite o código de 6 dígitos que enviamos e escolha uma nova senha.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[12.5px] font-medium text-[#0F172A] mb-1.5 block">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@empresa.com"
                required
                autoComplete="email"
                className={inputCls}
              />
            </div>

            <div>
              <label className="text-[12.5px] font-medium text-[#0F172A] mb-1.5 block">Código</label>
              <input
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                required
                inputMode="numeric"
                autoComplete="one-time-code"
                className={`${inputCls} tabular-nums tracking-[0.2em] text-center font-mono`}
              />
            </div>

            <div>
              <label className="text-[12.5px] font-medium text-[#0F172A] mb-1.5 block">Nova senha</label>
              <input
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="Mín. 6 caracteres"
                required
                minLength={6}
                autoComplete="new-password"
                className={inputCls}
              />
            </div>

            <div>
              <label className="text-[12.5px] font-medium text-[#0F172A] mb-1.5 block">Confirmar</label>
              <input
                type="password"
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                placeholder="Repita a nova senha"
                required
                minLength={6}
                autoComplete="new-password"
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
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Redefinir senha"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <Suspense fallback={null}>
      <RedefinirSenhaPageInner />
    </Suspense>
  );
}
