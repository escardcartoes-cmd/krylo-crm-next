"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Logo } from "@/components/brand/Logo";
import { ArrowLeft, Loader2 } from "lucide-react";

const inputCls =
  "w-full h-11 px-3.5 rounded-md border border-[#E2E8F0] bg-white text-[14px] text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] transition-all";

export default function EsqueciSenhaPage() {
  const router = useRouter();
  const [contato, setContato] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/api/auth/forgot-password", { contato });
      setSent(true);
      setTimeout(() => router.push(`/redefinir-senha?email=${encodeURIComponent(contato)}`), 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || "Não foi possível processar. Tente novamente.");
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
            Esqueci minha senha
          </h1>
          <p className="text-[14px] text-[#64748B] mt-2 mb-8">
            Informe seu e-mail cadastrado. Enviaremos um código para redefinir a senha.
          </p>

          {sent ? (
            <div className="text-[13px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3.5 py-3">
              Se a conta existe, um código de 6 dígitos foi enviado. Redirecionando…
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[12.5px] font-medium text-[#0F172A] mb-1.5 block" htmlFor="contato">
                  E-mail cadastrado
                </label>
                <input
                  id="contato"
                  type="email"
                  value={contato}
                  onChange={(e) => setContato(e.target.value)}
                  placeholder="voce@empresa.com"
                  required
                  autoFocus
                  autoComplete="email"
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
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enviar código"}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
