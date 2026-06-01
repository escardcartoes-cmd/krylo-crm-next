"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Topbar } from "@/components/layout/Topbar";
import { ButtonLink } from "@/components/ui/button-link";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Edit, CreditCard, DollarSign, Calendar, User, Target, TrendingUp } from "lucide-react";
import Link from "next/link";
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

const ETAPA_STYLE: Record<string, { btn: string; active: string }> = {
  prospect:   { btn: "bg-[#F2F2F7] text-[#636366]",   active: "ring-2 ring-[#8E8E93]/30" },
  contato:    { btn: "bg-[#EEF3FF] text-[#0057FF]",    active: "ring-2 ring-[#0057FF]/30" },
  proposta:   { btn: "bg-[#FFF8E8] text-[#B07D00]",    active: "ring-2 ring-[#FF9500]/30" },
  negociacao: { btn: "bg-[#FFF3E8] text-[#C05000]",    active: "ring-2 ring-[#FF6B00]/30" },
  fechado:    { btn: "bg-[#E8F9F0] text-[#1C7C4A]",    active: "ring-2 ring-[#34C759]/30" },
  perdido:    { btn: "bg-[#FFF1F0] text-[#FF3B30]",    active: "ring-2 ring-[#FF3B30]/30" },
};

const KPI_CARD_STYLES = [
  {
    bg: "bg-gradient-to-br from-[#EEF3FF] to-[#D6E4FF]",
    iconBg: "bg-white/70",
    iconColor: "text-[#0057FF]",
    labelColor: "text-[#0057FF]/70",
    valueColor: "text-[#0057FF]",
  },
  {
    bg: "bg-gradient-to-br from-[#E8F9F0] to-[#C8F0DA]",
    iconBg: "bg-white/70",
    iconColor: "text-[#1A7F4B]",
    labelColor: "text-[#1A7F4B]/70",
    valueColor: "text-[#1A7F4B]",
  },
  {
    bg: "bg-gradient-to-br from-[#F2F2F7] to-[#E8E8ED]",
    iconBg: "bg-white/70",
    iconColor: "text-[#636366]",
    labelColor: "text-[#636366]/70",
    valueColor: "text-[#3A3A3C]",
  },
  {
    bg: "bg-gradient-to-br from-[#FFF8E8] to-[#FFE9B8]",
    iconBg: "bg-white/70",
    iconColor: "text-[#B07D00]",
    labelColor: "text-[#B07D00]/70",
    valueColor: "text-[#B07D00]",
  },
];

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
      <div className="px-7 pt-4 space-y-4"><Skeleton className="h-32 w-full rounded-2xl" /></div>
    </>
  );

  const receitaAnual = (op.valor_estimado ?? 0) * 12;

  const kpis = [
    {
      label: "Cartões projetados",
      value: n(op.num_cartoes ?? 0),
      icon: CreditCard,
      sub: op.num_cartoes > 0 ? "implantações" : "nenhum projetado",
      style: KPI_CARD_STYLES[0],
    },
    {
      label: "Receita mensal",
      value: fmt(op.valor_estimado ?? 0),
      icon: DollarSign,
      sub: `Anual: ${fmt(receitaAnual)}`,
      style: KPI_CARD_STYLES[1],
    },
    {
      label: "Responsável",
      value: op.responsavel || "—",
      icon: User,
      sub: "executivo de conta",
      style: KPI_CARD_STYLES[2],
    },
    {
      label: "Previsão",
      value: op.previsao_fechamento || "—",
      icon: Calendar,
      sub: "data de implantação",
      style: KPI_CARD_STYLES[3],
    },
  ];

  return (
    <>
      <Topbar
        title={op.titulo}
        subtitle={op.empresa_nome ?? "Oportunidade"}
        actions={
          <>
            <ButtonLink href="/oportunidades" variant="outline" size="sm"><ArrowLeft className="h-3.5 w-3.5 mr-1" />Voltar</ButtonLink>
            <ButtonLink href={`/oportunidades/${id}/editar`} size="sm"><Edit className="h-3.5 w-3.5 mr-1" />Editar</ButtonLink>
          </>
        }
      />
      <div className="px-7 pt-4 pb-7 space-y-4">

        {/* KPI bar — colored cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {kpis.map((kpi, i) => (
            <div key={i} className={`rounded-2xl px-4 py-4 shadow-[0_0_0_1px_rgba(0,0,0,0.06)] ${kpi.style.bg}`}>
              <div className="flex items-center justify-between mb-2">
                <p className={`text-[10px] font-bold uppercase tracking-wider ${kpi.style.labelColor}`}>{kpi.label}</p>
                <div className={`h-6 w-6 rounded-lg flex items-center justify-center ${kpi.style.iconBg}`}>
                  <kpi.icon className={`h-3.5 w-3.5 ${kpi.style.iconColor}`} />
                </div>
              </div>
              <p className={`text-[18px] font-extrabold tracking-[-0.5px] ${kpi.style.valueColor}`}>{kpi.value}</p>
              <p className={`text-[11px] mt-0.5 ${kpi.style.labelColor}`}>{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* Revenue insight */}
        {op.num_cartoes > 0 && op.valor_estimado > 0 && (
          <div className="bg-gradient-to-r from-[#0057FF] to-[#338BFF] rounded-2xl p-4 text-white relative overflow-hidden shadow-[0_4px_16px_rgba(0,87,255,0.25)]">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
            <div className="relative flex items-center gap-4 flex-wrap">
              <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-bold text-white/70 uppercase tracking-wider mb-0.5">Projeção de receita</p>
                <p className="text-[13px] text-white/90">
                  {n(op.num_cartoes)} cartões × {fmt(op.valor_mensal ?? 0)}/cartão/mês
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[11px] text-white/70">Receita anual projetada</p>
                <p className="text-[22px] font-extrabold tracking-[-0.5px]">{fmt(receitaAnual)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Notas */}
        {op.notas && (
          <div className="bg-white rounded-2xl p-5 shadow-[0_0_0_1px_rgba(0,0,0,0.06)]">
            <p className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider mb-2">Notas</p>
            <p className="text-[13px] text-[#3A3A3C] whitespace-pre-line leading-relaxed">{op.notas}</p>
          </div>
        )}

        {/* Move etapa */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_0_0_1px_rgba(0,0,0,0.06)]">
          <p className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider mb-3">Mover etapa</p>
          <div className="flex flex-wrap gap-2">
            {ETAPAS.map(etapa => {
              const s = ETAPA_STYLE[etapa.value] ?? { btn: "bg-[#F2F2F7] text-[#636366]", active: "" };
              const isActive = etapa.value === op.etapa;
              return (
                <button
                  key={etapa.value}
                  onClick={() => !isActive && moveMutation.mutate(etapa.value)}
                  disabled={isActive || moveMutation.isPending}
                  className={`px-3.5 py-2 rounded-xl text-[12px] font-semibold transition-all ${s.btn} ${isActive ? `${s.active} shadow-sm cursor-default` : "opacity-50 hover:opacity-90"}`}
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
