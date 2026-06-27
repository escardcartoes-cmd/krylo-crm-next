"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Topbar } from "@/components/layout/Topbar";
import { ButtonLink } from "@/components/ui/button-link";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Edit } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

function fmt(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);
}
function n(v: number) {
  return new Intl.NumberFormat("pt-BR").format(v);
}

const ETAPAS = [
  { value: "prospect",   label: "Prospect" },
  { value: "contato",    label: "Contato" },
  { value: "proposta",   label: "Proposta" },
  { value: "negociacao", label: "Negociação" },
  { value: "fechado",    label: "Implantação" },
  { value: "perdido",    label: "Perdido" },
];

const ETAPA_STYLE: Record<string, { bg: string; text: string }> = {
  prospect:   { bg: "bg-slate-100",   text: "text-slate-700" },
  contato:    { bg: "bg-sky-100",     text: "text-sky-700" },
  proposta:   { bg: "bg-amber-100",   text: "text-amber-700" },
  negociacao: { bg: "bg-orange-100",  text: "text-orange-700" },
  fechado:    { bg: "bg-emerald-100", text: "text-emerald-700" },
  perdido:    { bg: "bg-rose-100",    text: "text-rose-700" },
};

function Kpi({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="surface-card rounded-xl p-5">
      <p className="text-[12px] font-medium text-[#64748B]">{label}</p>
      <p className="text-[22px] font-semibold text-[#0F172A] mt-1 leading-tight truncate">{value}</p>
      {sub && <p className="text-[12px] text-[#94A3B8] mt-1">{sub}</p>}
    </div>
  );
}

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
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["oportunidades"] }); toast.success("Etapa atualizada"); },
    onError: () => toast.error("Erro ao mover"),
  });

  if (!op) return (
    <>
      <Topbar title="Oportunidade" />
      <div className="flex-1 px-8 pt-4 pb-8 space-y-4"><Skeleton className="h-32 w-full rounded-xl" /></div>
    </>
  );

  const receitaAnual = (op.valor_estimado ?? 0) * 12;

  return (
    <>
      <Topbar
        title={op.titulo}
        subtitle={op.empresa_nome ?? undefined}
        actions={
          <>
            <ButtonLink href="/oportunidades" variant="outline" size="sm">
              <ArrowLeft className="h-3.5 w-3.5" />Voltar
            </ButtonLink>
            <ButtonLink href={`/oportunidades/${id}/editar`} size="sm">
              <Edit className="h-3.5 w-3.5" />Editar
            </ButtonLink>
          </>
        }
      />
      <div className="flex-1 px-8 pt-4 pb-8 space-y-4">

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Kpi
            label="Cartões projetados"
            value={n(op.num_cartoes ?? 0)}
            sub={op.num_cartoes > 0 ? "implantações" : "nenhum projetado"}
          />
          <Kpi
            label="Receita mensal"
            value={fmt(op.valor_estimado ?? 0)}
            sub={`Anual: ${fmt(receitaAnual)}`}
          />
          <Kpi
            label="Responsável"
            value={op.responsavel || "—"}
          />
          <Kpi
            label="Previsão"
            value={op.previsao_fechamento || "—"}
          />
        </div>

        {op.notas && (
          <div className="surface-card rounded-xl p-5">
            <h3 className="text-[13px] font-semibold text-[#0F172A] pb-3 border-b border-[#F1F5F9] mb-4">Notas</h3>
            <p className="text-[13px] text-[#334155] whitespace-pre-line leading-relaxed">{op.notas}</p>
          </div>
        )}

        <div className="surface-card rounded-xl p-5">
          <h3 className="text-[13px] font-semibold text-[#0F172A] pb-3 border-b border-[#F1F5F9] mb-4">Mover etapa</h3>
          <div className="flex flex-wrap gap-2">
            {ETAPAS.map(etapa => {
              const s = ETAPA_STYLE[etapa.value] ?? { bg: "bg-slate-100", text: "text-slate-700" };
              const isActive = etapa.value === op.etapa;
              return (
                <button
                  key={etapa.value}
                  onClick={() => !isActive && moveMutation.mutate(etapa.value)}
                  disabled={isActive || moveMutation.isPending}
                  className={`h-8 px-3 rounded-lg text-[12px] font-medium transition-colors ${
                    isActive
                      ? `${s.bg} ${s.text} cursor-default`
                      : "text-[#475569] border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC]"
                  }`}
                >
                  {etapa.label}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </>
  );
}
