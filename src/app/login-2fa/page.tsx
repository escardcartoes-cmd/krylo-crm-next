"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/brand/Logo";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const inputCls =
  "w-full h-12 px-3.5 rounded-md border border-[#E2E8F0] bg-white text-[16px] text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] transition-all tabular-nums tracking-[0.3em] text-center font-mono";

function Login2FAInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verify2fa, resend2fa } = useAuth();
  const canal = searchParams.get("canal") ?? "email";
  const destino = searchParams.get("d") ?? "";
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [seconds, setSeconds] = useState(60);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (codigo.length < 4) return;
    setError("");
    setLoading(true);
    try {
      await verify2fa(codigo);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error ?? "Código inválido.");
      setLoading(false);
    }
  }

  async function reenviar() {
    setResending(true);
    try {
      await resend2fa();
      setSeconds(60);
      toast.success("Novo código enviado.");
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? "Falha ao reenviar.");
    } finally {
      setResending(false);
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
            <ArrowLeft className="h-3.5 w-3.5" />Cancelar e voltar
          </Link>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="h-5 w-5 text-[#4F46E5]" />
              <span className="text-[12px] font-medium text-[#4F46E5] uppercase tracking-wider">Verificação em 2 etapas</span>
            </div>
            <h1 className="text-[26px] font-semibold text-[#0F172A] tracking-[-0.6px] leading-[1.15]">
              Digite o código de 6 dígitos
            </h1>
            <p className="text-[14px] text-[#64748B] mt-2">
              Enviamos por {canal === "whatsapp" ? "WhatsApp" : "e-mail"}{destino ? ` para ${destino}` : ""}. Válido por 10 minutos.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <input
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              maxLength={6}
              className={inputCls}
            />

            {error && (
              <div className="text-[13px] text-[#B91C1C] bg-[#FEF2F2] border border-[#FECACA] rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || codigo.length < 4}
              className="w-full h-11 rounded-md text-[14px] font-medium text-white bg-[#0F172A] hover:bg-[#1E293B] active:bg-black transition-colors disabled:opacity-40 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verificar e entrar"}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={reenviar}
                disabled={resending || seconds > 0}
                className="text-[12.5px] text-[#64748B] hover:text-[#0F172A] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {resending
                  ? "Reenviando…"
                  : seconds > 0
                    ? `Reenviar código em ${seconds}s`
                    : "Reenviar código"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function Login2FAPage() {
  return (
    <Suspense fallback={null}>
      <Login2FAInner />
    </Suspense>
  );
}
