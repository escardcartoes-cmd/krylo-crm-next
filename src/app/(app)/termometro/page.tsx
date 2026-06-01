"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Topbar } from "@/components/layout/Topbar";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, TrendingUp, TrendingDown, Minus } from "lucide-react";
import Link from "next/link";

function fmt(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);
}

function tempStyle(score: number) {
  if (score >= 80) return { bar: "bg-emerald-500", tint: "tint-emerald", text: "text-emerald-700", label: "Saudável", Icon: TrendingUp };
  if (score >= 50) return { bar: "bg-amber-500",   tint: "tint-amber",   text: "text-amber-700",   label: "Atenção",  Icon: Minus };
  return { bar: "bg-rose-500", tint: "tint-rose", text: "text-rose-700", label: "Risco", Icon: TrendingDown };
}

export default function TermometroPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["empresas-termometro"],
    queryFn: () =>
      api.get("/api/empresas", { params: { per_page: 100 } }).then(r =>
        r.data.items
          .filter((e: any) => e.cliente_ativo || e.status === "cliente")
          .sort((a: any, b: any) => (b.temperatura ?? b.score ?? 0) - (a.temperatura ?? a.score ?? 0))
      ),
  });

  const clientes = (data ?? []) as any[];
  const saudaveis = clientes.filter(c => (c.temperatura ?? c.score ?? 0) >= 80).length;
  const atencao = clientes.filter(c => {
    const s = c.temperatura ?? c.score ?? 0;
    return s >= 50 && s < 80;
  }).length;
  const risco = clientes.filter(c => (c.temperatura ?? c.score ?? 0) < 50).length;

  return (
    <>
      <Topbar
        title="Termômetro de Clientes"
        subtitle="Saúde dos programas de cartão ativos"
      />
      <div className="flex-1 px-8 pt-4 pb-8 space-y-5">

        {/* Summary */}
        {!isLoading && clientes.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="surface-card rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-60 blur-2xl tint-blue" />
              <div className="relative">
                <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-[0.06em]">Total clientes</p>
                <p className="text-[28px] font-extrabold text-[#0F172A] tracking-[-0.8px] mt-0.5 leading-none">{clientes.length}</p>
              </div>
            </div>
            <div className="surface-card rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-60 blur-2xl tint-emerald" />
              <div className="relative">
                <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-[0.06em]">Saudáveis</p>
                <p className="text-[28px] font-extrabold text-emerald-700 tracking-[-0.8px] mt-0.5 leading-none">{saudaveis}</p>
              </div>
            </div>
            <div className="surface-card rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-60 blur-2xl tint-amber" />
              <div className="relative">
                <p className="text-[11px] font-bold text-amber-700 uppercase tracking-[0.06em]">Atenção</p>
                <p className="text-[28px] font-extrabold text-amber-700 tracking-[-0.8px] mt-0.5 leading-none">{atencao}</p>
              </div>
            </div>
            <div className="surface-card rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-60 blur-2xl tint-rose" />
              <div className="relative">
                <p className="text-[11px] font-bold text-rose-700 uppercase tracking-[0.06em]">Em risco</p>
                <p className="text-[28px] font-extrabold text-rose-700 tracking-[-0.8px] mt-0.5 leading-none">{risco}</p>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-[80px] w-full rounded-2xl" />)}
          </div>
        ) : (
          <div className="space-y-2">
            {clientes.map(emp => {
              const score = emp.temperatura ?? emp.score ?? 0;
              const { bar, tint, text, label, Icon } = tempStyle(score);
              return (
                <Link
                  key={emp.id}
                  href={`/empresas/${emp.id}`}
                  className="surface-card surface-card-hover flex items-center gap-4 px-5 py-4 rounded-2xl group transition-all"
                >
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 ${tint}`}>
                    <Icon className={`h-5 w-5 ${text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <p className="text-[14px] font-bold text-[#0F172A] truncate">{emp.nome}</p>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0 ${tint} ${text}`}>{label}</span>
                      {emp.tipo_cartao && (
                        <span className="text-[10px] font-semibold text-[#64748B] flex items-center gap-1 flex-shrink-0">
                          <CreditCard className="h-3 w-3" />{emp.tipo_cartao}
                        </span>
                      )}
                    </div>
                    <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden w-full max-w-xs">
                      <div className={`h-full ${bar} rounded-full transition-all`} style={{ width: `${Math.min(100, score)}%` }} />
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-[20px] font-extrabold text-[#0F172A] tracking-[-0.5px] leading-none">{score}</p>
                    {emp.valor_mensal > 0 && (
                      <p className="text-[11px] text-[#64748B] mt-1">{fmt(emp.valor_mensal)}/mês</p>
                    )}
                  </div>
                </Link>
              );
            })}
            {clientes.length === 0 && (
              <div className="surface-card rounded-2xl py-16 text-center">
                <div className="h-16 w-16 rounded-2xl tint-blue flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-8 w-8 text-[#4F46E5]" />
                </div>
                <p className="text-[15px] font-bold text-[#0F172A]">Nenhum cliente com cartão ativo</p>
                <p className="text-[13px] text-[#64748B] mt-1">Implante programas de cartão para monitorar aqui</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
