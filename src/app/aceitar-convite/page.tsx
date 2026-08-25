"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { Logo } from "@/components/brand/Logo";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

const inputCls =
  "w-full h-11 px-3.5 rounded-md border border-[#E2E8F0] bg-white text-[14px] text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] transition-all";

function AceitarConviteInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [status, setStatus] = useState<"loading" | "valid" | "invalid" | "expired">("loading");
  const [convite, setConvite] = useState<any>(null);
  const [erro, setErro] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) { setStatus("invalid"); return; }
    api.get(`/api/convite/${token}`)
      .then(r => { setConvite(r.data); setStatus("valid"); })
      .catch(err => {
        setErro(err.response?.data?.error ?? "Convite inválido");
        setStatus(err.response?.data?.error?.toLowerCase()?.includes("expira") ? "expired" : "invalid");
      });
  }, [token]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (senha !== confirmar) { setErro("As senhas não coincidem."); return; }
    if (senha.length < 8)   { setErro("Senha deve ter pelo menos 8 caracteres."); return; }
    setLoading(true);
    try {
      await api.post(`/api/convite/${token}/aceitar`, { senha });
      router.push("/login?convite=ok");
    } catch (err: any) {
      setErro(err.response?.data?.error ?? "Não foi possível aceitar o convite.");
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
        <div className="w-full max-w-[420px]">
          {status === "loading" && (
            <div className="text-center py-8">
              <Loader2 className="h-6 w-6 text-[#94A3B8] animate-spin mx-auto" />
              <p className="text-[13px] text-[#64748B] mt-3">Validando convite…</p>
            </div>
          )}

          {(status === "invalid" || status === "expired") && (
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-6 w-6 text-rose-600" />
              </div>
              <h1 className="text-[22px] font-semibold text-[#0F172A]">
                {status === "expired" ? "Convite expirado" : "Convite inválido"}
              </h1>
              <p className="text-[14px] text-[#64748B] mt-2">{erro || "Peça um novo convite ao administrador."}</p>
              <Link href="/login" className="inline-block mt-6 text-[13px] text-[#4F46E5] hover:underline">
                Voltar para o login
              </Link>
            </div>
          )}

          {status === "valid" && convite && (
            <>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span className="text-[12px] font-medium text-emerald-700 uppercase tracking-wider">Convite válido</span>
                </div>
                <h1 className="text-[26px] font-semibold text-[#0F172A] tracking-[-0.6px] leading-[1.15]">
                  Bem-vindo(a), {convite.nome}!
                </h1>
                <p className="text-[14px] text-[#64748B] mt-2">
                  Defina sua senha pra acessar o Krylo CRM como <strong>{convite.perfil}</strong>.
                </p>
              </div>

              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="text-[12.5px] font-medium text-[#0F172A] mb-1.5 block">E-mail</label>
                  <input type="email" value={convite.email} disabled className={`${inputCls} bg-[#F8FAFC] cursor-not-allowed`} />
                </div>
                <div>
                  <label className="text-[12.5px] font-medium text-[#0F172A] mb-1.5 block">Usuário</label>
                  <input type="text" value={convite.usuario} disabled className={`${inputCls} bg-[#F8FAFC] cursor-not-allowed font-mono`} />
                </div>
                <div>
                  <label className="text-[12.5px] font-medium text-[#0F172A] mb-1.5 block">Nova senha</label>
                  <input
                    type="password" value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Mín. 8 caracteres" required minLength={8}
                    autoComplete="new-password" autoFocus className={inputCls}
                  />
                </div>
                <div>
                  <label className="text-[12.5px] font-medium text-[#0F172A] mb-1.5 block">Confirmar senha</label>
                  <input
                    type="password" value={confirmar}
                    onChange={(e) => setConfirmar(e.target.value)}
                    placeholder="Repita a senha" required minLength={8}
                    autoComplete="new-password" className={inputCls}
                  />
                </div>

                {erro && (
                  <div className="text-[13px] text-[#B91C1C] bg-[#FEF2F2] border border-[#FECACA] rounded-md px-3 py-2">
                    {erro}
                  </div>
                )}

                <button
                  type="submit" disabled={loading}
                  className="w-full h-11 rounded-md text-[14px] font-medium text-white bg-[#0F172A] hover:bg-[#1E293B] active:bg-black transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ativar conta"}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function AceitarConvitePage() {
  return (
    <Suspense fallback={null}>
      <AceitarConviteInner />
    </Suspense>
  );
}
