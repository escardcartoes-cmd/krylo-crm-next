"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Topbar } from "@/components/layout/Topbar";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

function fmt(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);
}

function tempStyle(score: number) {
  if (score >= 80) return { bar: "bg-emerald-500", bg: "bg-emerald-100", text: "text-emerald-700", label: "Saudável" };
  if (score >= 50) return { bar: "bg-amber-500",   bg: "bg-amber-100",   text: "text-amber-700",   label: "Atenção" };
  return { bar: "bg-rose-500", bg: "bg-rose-100", text: "text-rose-700", label: "Risco" };
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="surface-card rounded-xl p-5">
      <p className={`text-[12px] font-medium ${accent ?? "text-[#64748B]"}`}>{label}</p>
      <p className={`text-[26px] font-semibold tabular-nums mt-1 leading-none ${accent ?? "text-[#0F172A]"}`}>{value}</p>
    </div>
  );
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
      <Topbar title="Termômetro" subtitle="Clientes com cartão ativo" />
      <div className="flex-1 px-8 pt-4 pb-8 space-y-4">

        {!isLoading && clientes.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="Total clientes" value={clientes.length} />
            <Stat label="Saudáveis" value={saudaveis} accent="text-emerald-700" />
            <Stat label="Atenção" value={atencao} accent="text-amber-700" />
            <Stat label="Em risco" value={risco} accent="text-rose-700" />
          </div>
        )}

        {isLoading ? (
          <div className="surface-card rounded-xl divide-y divide-[#F1F5F9]">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-[64px]" />)}
          </div>
        ) : clientes.length === 0 ? (
          <div className="surface-card rounded-xl py-16 text-center">
            <p className="text-[14px] text-[#475569]">Nenhum cliente com cartão ativo.</p>
          </div>
        ) : (
          <div className="surface-card rounded-xl overflow-hidden">
            <ul className="divide-y divide-[#F1F5F9]">
              {clientes.map(emp => {
                const score = emp.temperatura ?? emp.score ?? 0;
                const { bar, bg, text, label } = tempStyle(score);
                return (
                  <li key={emp.id}>
                    <Link href={`/empresas/${emp.id}`}
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#F8FAFC]">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <p className="text-[14px] font-medium text-[#0F172A] truncate">{emp.nome}</p>
                          <span className={`inline-flex items-center text-[11px] font-medium px-1.5 py-0.5 rounded ${bg} ${text}`}>
                            {label}
                          </span>
                          {emp.tipo_cartao && (
                            <span className="text-[12px] text-[#64748B]">{emp.tipo_cartao}</span>
                          )}
                        </div>
                        <div className="h-1 bg-[#F1F5F9] rounded-full overflow-hidden w-full max-w-xs">
                          <div className={`h-full ${bar}`} style={{ width: `${Math.min(100, score)}%` }} />
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[18px] font-semibold text-[#0F172A] tabular-nums leading-none">{score}</p>
                        {emp.valor_mensal > 0 && (
                          <p className="text-[11px] text-[#64748B] mt-1 tabular-nums">{fmt(emp.valor_mensal)}/mês</p>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
