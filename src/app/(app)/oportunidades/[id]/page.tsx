"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Topbar } from "@/components/layout/Topbar";
import { ButtonLink } from "@/components/ui/button-link";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Edit, CreditCard, DollarSign, Calendar, User, TrendingUp } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

function fmt(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);
}
function n(v: number) {
  return new Intl.NumberFormat("pt-BR").format(v);
}

const ETAPAS = [
  { value: "prospect",   label: "Prospecção" },
  { value: "contato",    label: "Contato" },
  { value: "proposta",   label: "Proposta" },
  { value: "negociacao", label: "Negociação" },
  { value: "fechado",    label: "Implantação" },
  { value: "perdido",    label: "Perdido" },
];

const ETAPA_STYLE: Record<string, { bg: string; text: string }> = {
  prospect:   { bg: "bg-[#F1F5F9]",  text: "text-[#64748B]" },
  contato:    { bg: "tint-blue",     text: "text-[#4F46E5]" },
  proposta:   { bg: "tint-amber",    text: "text-amber-700" },
  negociacao: { bg: "bg-orange-50",  text: "text-orange-700" },
  fechado:    { bg: "tint-emerald",  text: "text-emerald-700" },
  perdido:    { bg: "tint-rose",     text: "text-rose-700" },
};

export default function OportunidadeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();

  const { data: ops } = useQuery({
    queryKey: ["oportunidades", ""],
    queryFn: () => api.get("/api/oportunidades", { params: { per_page: 200 } }).then(r => r.data),
  });
  const op = ops?.items?.find((o: any) => String(o.id) === id);

  const moveMutation = useMutation({
    mutationFn: (etapa: string) => api.put(`/api/oportunidades/${id}`, { etapa }).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["oportunidades"] }); toast.success("Etapa atualizada!"); },
    onError: () => toast.error("Erro ao mover"),
  });

  if (!op) return (
    <>
      <Topbar title="Oportunidade" />
      <div className="flex-1 px-8 pt-4 pb-8 space-y-5"><Skeleton className="h-32 w-full rounded-2xl" /></div>
    </>
  );

  const receitaAnual = (op.valor_estimado ?? 0) * 12;

  const kpis = [
    {
      label: "Cartões projetados",
      value: n(op.num_cartoes ?? 0),
      icon: CreditCard,
      sub: op.num_cartoes > 0 ? "implantações" : "nenhum projetado",
      tint: "tint-blue", color: "text-[#4F46E5]",
    },
    {
      label: "Receita mensal",
      value: fmt(op.valor_estimado ?? 0),
      icon: DollarSign,
      sub: `Anual: ${fmt(receitaAnual)}`,
      tint: "tint-emerald", color: "text-emerald-700",
    },
    {
      label: "Responsável",
      value: op.responsavel || "—",
      icon: User,
      sub: "executivo de conta",
      tint: "tint-violet", color: "text-violet-600",
    },
    {
      label: "Previsão",
      value: op.previsao_fechamento || "—",
      icon: Calendar,
      sub: "data de implantação",
      tint: "tint-amber", color: "text-amber-600",
    },
  ];

  return (
    <>
      <Topbar
        title={op.titulo}
        subtitle={op.empresa_nome ?? "Oportunidade"}
        actions={
          <>
            <ButtonLink href="/oportunidades" variant="outline" size="sm"><ArrowLeft className="h-3.5 w-3.5" />Voltar</ButtonLink>
            <ButtonLink href={`/oportunidades/${id}/editar`} size="sm"><Edit className="h-3.5 w-3.5" />Editar</ButtonLink>
          </>
        }
      />
      <div className="flex-1 px-8 pt-4 pb-8 space-y-5">

        {/* KPI bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {kpis.map((kpi, i) => (
            <div key={i} className="surface-card rounded-2xl p-5 relative overflow-hidden">
              <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-60 blur-2xl ${kpi.tint}`} />
              <div className="relative">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 ${kpi.tint}`}>
                  <kpi.icon className={`h-[18px] w-[18px] ${kpi.color}`} />
                </div>
                <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-[0.06em]">{kpi.label}</p>
                <p className="text-[20px] font-extrabold text-[#0F172A] tracking-[-0.5px] mt-0.5 leading-tight truncate">{kpi.value}</p>
                <p className="text-[12px] text-[#64748B] mt-1">{kpi.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Revenue insight */}
        {op.num_cartoes > 0 && op.valor_estimado > 0 && (
          <div
            className="rounded-2xl p-6 text-white relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg,#4F46E5 0%,#7C3AED 50%,#A855F7 100%)",
              boxShadow: "0 10px 40px rgba(79,70,229,0.3), 0 4px 12px rgba(124,58,237,0.2)",
            }}
          >
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-pink-400/20 blur-3xl" />
            <div className="relative flex items-center gap-4 flex-wrap">
              <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-white/70 uppercase tracking-[0.12em] mb-1">Projeção de receita</p>
                <p className="text-[14px] text-white/90">
                  {n(op.num_cartoes)} cartões × {fmt(op.valor_mensal ?? 0)}/cartão/mês
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[11px] text-white/70 font-semibold uppercase tracking-wider">Receita anual</p>
                <p className="text-[26px] font-black tracking-[-0.5px]">{fmt(receitaAnual)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Notas */}
        {op.notas && (
          <div className="surface-card rounded-2xl p-5">
            <p className="text-[12px] font-bold text-[#475569] uppercase tracking-[0.08em] mb-2">Notas</p>
            <p className="text-[13px] text-[#0F172A] whitespace-pre-line leading-relaxed">{op.notas}</p>
          </div>
        )}

        {/* Move etapa */}
        <div className="surface-card rounded-2xl p-5">
          <p className="text-[12px] font-bold text-[#475569] uppercase tracking-[0.08em] mb-3">Mover etapa</p>
          <div className="flex flex-wrap gap-2">
            {ETAPAS.map(etapa => {
              const s = ETAPA_STYLE[etapa.value] ?? { bg: "bg-[#F1F5F9]", text: "text-[#64748B]" };
              const isActive = etapa.value === op.etapa;
              return (
                <button
                  key={etapa.value}
                  onClick={() => !isActive && moveMutation.mutate(etapa.value)}
                  disabled={isActive || moveMutation.isPending}
                  className={`px-3.5 py-2 rounded-xl text-[12px] font-bold transition-all ${s.bg} ${s.text} ${isActive ? "ring-2 ring-current/30 shadow-sm cursor-default" : "opacity-60 hover:opacity-100"}`}
                >
                  {etapa.label}
                  {isActive && " ✓"}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </>
  );
}
