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
  if (score >= 80) return { bar: "bg-[#34C759]", bg: "bg-[#E8F9F0]", text: "text-[#1C7C4A]", label: "Saudável", Icon: TrendingUp };
  if (score >= 50) return { bar: "bg-[#FF9500]", bg: "bg-[#FFF3E8]", text: "text-[#C25A00]", label: "Atenção",  Icon: Minus };
  return { bar: "bg-[#FF3B30]", bg: "bg-[#FFF1F0]", text: "text-[#CC0000]", label: "Risco", Icon: TrendingDown };
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
  const risco = clientes.filter(c => (c.temperatura ?? c.score ?? 0) < 50).length;

  return (
    <>
      <Topbar
        title="Termômetro de Clientes"
        subtitle="Saúde dos programas de cartão ativos"
      />
      <div className="px-7 pt-4 pb-7 space-y-4">

        {/* Summary */}
        {!isLoading && clientes.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl px-4 py-4 shadow-[0_0_0_1px_rgba(0,0,0,0.06)]">
              <p className="text-[10px] font-semibold text-[#8E8E93] uppercase tracking-wider">Total clientes</p>
              <p className="text-[24px] font-bold text-[#1C1C1E] mt-1">{clientes.length}</p>
            </div>
            <div className="bg-[#E8F9F0] rounded-2xl px-4 py-4">
              <p className="text-[10px] font-semibold text-[#1C7C4A] uppercase tracking-wider">Saudáveis</p>
              <p className="text-[24px] font-bold text-[#1C7C4A] mt-1">{saudaveis}</p>
            </div>
            <div className="bg-[#FFF1F0] rounded-2xl px-4 py-4">
              <p className="text-[10px] font-semibold text-[#CC0000] uppercase tracking-wider">Em risco</p>
              <p className="text-[24px] font-bold text-[#CC0000] mt-1">{risco}</p>
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
              const { bar, bg, text, label, Icon } = tempStyle(score);
              return (
                <Link
                  key={emp.id}
                  href={`/empresas/${emp.id}`}
                  className="flex items-center gap-4 px-5 py-4 bg-white rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.06)] hover:shadow-[0_0_0_1px_rgba(0,87,255,0.2)] transition-all"
                >
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
                    <Icon className={`h-4 w-4 ${text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <p className="text-[13px] font-semibold text-[#1C1C1E] truncate">{emp.nome}</p>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-lg flex-shrink-0 ${bg} ${text}`}>{label}</span>
                      {emp.tipo_cartao && (
                        <span className="text-[10px] font-medium text-[#8E8E93] flex items-center gap-1 flex-shrink-0">
                          <CreditCard className="h-3 w-3" />{emp.tipo_cartao}
                        </span>
                      )}
                    </div>
                    <div className="h-1.5 bg-[#F2F2F7] rounded-full overflow-hidden w-full max-w-xs">
                      <div className={`h-full ${bar} rounded-full transition-all`} style={{ width: `${Math.min(100, score)}%` }} />
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-[18px] font-bold text-[#1C1C1E]">{score}</p>
                    {emp.valor_mensal > 0 && (
                      <p className="text-[11px] text-[#8E8E93] mt-0.5">{fmt(emp.valor_mensal)}/mês</p>
                    )}
                  </div>
                </Link>
              );
            })}
            {clientes.length === 0 && (
              <div className="text-center py-20">
                <div className="h-14 w-14 rounded-2xl bg-[#EEF3FF] flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-7 w-7 text-[#0057FF]" />
                </div>
                <p className="text-[14px] font-semibold text-[#3A3A3C]">Nenhum cliente com cartão ativo</p>
                <p className="text-[13px] text-[#8E8E93] mt-1">Implante programas de cartão para monitorar aqui</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
