"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Topbar } from "@/components/layout/Topbar";
import { ButtonLink } from "@/components/ui/button-link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Phone, Mail, MapPin, Edit, ArrowLeft, CreditCard, Users, Send, Loader2, DollarSign } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";

function fmt(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);
}

const ETAPA_STYLE: Record<string, { bg: string; text: string }> = {
  prospect:   { bg: "bg-[#F1F5F9]",  text: "text-[#64748B]" },
  contato:    { bg: "tint-blue",     text: "text-[#4F46E5]" },
  proposta:   { bg: "tint-amber",    text: "text-amber-700" },
  negociacao: { bg: "bg-orange-50",  text: "text-orange-700" },
  fechado:    { bg: "tint-emerald",  text: "text-emerald-700" },
  perdido:    { bg: "tint-rose",     text: "text-rose-700" },
};

const ETAPA_LABEL: Record<string, string> = {
  prospect: "Prospecção", contato: "Contato", proposta: "Proposta",
  negociacao: "Negociação", fechado: "Implantação", perdido: "Perdido",
};

const STATUS_STYLE: Record<string, { bg: string; text: string; dot: string }> = {
  prospect: { bg: "tint-sky",     text: "text-sky-700",     dot: "bg-sky-500" },
  cliente:  { bg: "tint-emerald", text: "text-emerald-700", dot: "bg-emerald-500" },
  inativo:  { bg: "bg-[#F1F5F9]", text: "text-[#64748B]",   dot: "bg-slate-400" },
  perdido:  { bg: "tint-rose",    text: "text-rose-700",    dot: "bg-rose-500" },
};

function InfoChip({ icon: Icon, label, value }: { icon: React.ComponentType<{className?:string}>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-[rgba(15,23,42,0.06)] shadow-sm">
      <div className="h-7 w-7 rounded-lg tint-blue flex items-center justify-center flex-shrink-0">
        <Icon className="h-3.5 w-3.5 text-[#4F46E5]" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider">{label}</p>
        <p className="text-[13px] font-bold text-[#0F172A] truncate">{value}</p>
      </div>
    </div>
  );
}

export default function EmpresaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { data: emp, isLoading } = useQuery({
    queryKey: ["empresa", id],
    queryFn: () => api.get(`/api/empresas/${id}`).then(r => r.data),
  });

  const cadenciaMutation = useMutation({
    mutationFn: () => api.post("/api/cadencias/iniciar", {
      empresa_id: Number(id), canal_whatsapp: true, canal_email: true,
    }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cadencias"] });
      toast.success("Cadência iniciada! Vá para /cadencias para acompanhar.");
    },
    onError: (err: any) => toast.error(err.response?.data?.error ?? "Erro ao iniciar cadência"),
  });

  if (isLoading) return (
    <>
      <Topbar title="Empresa" />
      <div className="flex-1 px-8 pt-4 pb-8 space-y-5">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    </>
  );

  if (!emp) return (
    <>
      <Topbar title="Empresa" />
      <div className="flex-1 px-8 pt-8 text-center text-[#64748B]">Empresa não encontrada.</div>
    </>
  );

  const hasCartao = emp.tipo_cartao || emp.nome_private_label || emp.cliente_ativo;
  const statusStyle = STATUS_STYLE[emp.status] ?? STATUS_STYLE.inativo;

  return (
    <>
      <Topbar
        title={emp.nome}
        subtitle={emp.segmento || "Empresa"}
        actions={
          <>
            <ButtonLink href="/empresas" variant="outline" size="sm"><ArrowLeft className="h-3.5 w-3.5" />Voltar</ButtonLink>
            <button
              onClick={() => cadenciaMutation.mutate()}
              disabled={cadenciaMutation.isPending}
              className="h-8 px-3.5 rounded-xl bg-white border border-[rgba(15,23,42,0.1)] text-[12px] font-semibold text-[#334155] hover:bg-[#F8FAFC] hover:border-[rgba(79,70,229,0.3)] active:scale-[0.98] disabled:opacity-60 flex items-center gap-1.5"
            >
              {cadenciaMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              Iniciar cadência
            </button>
            <ButtonLink href={`/empresas/${id}/editar`} size="sm"><Edit className="h-3.5 w-3.5" />Editar</ButtonLink>
          </>
        }
      />
      <div className="flex-1 px-8 pt-4 pb-8 space-y-5">

        {/* Header card */}
        <div className="surface-card rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-2xl tint-blue flex items-center justify-center flex-shrink-0">
              <Building2 className="h-7 w-7 text-[#4F46E5]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-[22px] font-extrabold text-[#0F172A] tracking-[-0.4px]">{emp.nome}</h1>
                <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${statusStyle.bg} ${statusStyle.text}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                  {emp.status}
                </span>
                {emp.porte && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#F1F5F9] text-[#64748B]">{emp.porte}</span>
                )}
                {emp.cliente_ativo ? (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md tint-violet text-violet-700 flex items-center gap-1">
                    <CreditCard className="h-3 w-3" />Cartão ativo
                  </span>
                ) : null}
              </div>
              {emp.segmento && (
                <p className="text-[13px] text-[#64748B] mb-3">{emp.segmento}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-3">
                {emp.cnpj && <InfoChip icon={Building2} label="CNPJ" value={emp.cnpj} />}
                {emp.telefone && <InfoChip icon={Phone} label="Telefone" value={emp.telefone} />}
                {emp.email && <InfoChip icon={Mail} label="E-mail" value={emp.email} />}
                {emp.cidade && <InfoChip icon={MapPin} label="Localização" value={`${emp.cidade}${emp.estado ? `, ${emp.estado}` : ""}`} />}
                {emp.num_funcionarios ? <InfoChip icon={Users} label="Funcionários" value={String(emp.num_funcionarios)} /> : null}
              </div>
            </div>
          </div>
        </div>

        {/* Programa de cartão */}
        {hasCartao && (
          <div
            className="rounded-2xl p-6 text-white relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg,#4F46E5 0%,#7C3AED 50%,#A855F7 100%)",
              boxShadow: "0 10px 40px rgba(79,70,229,0.3), 0 4px 12px rgba(124,58,237,0.2)",
            }}
          >
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-pink-400/20 blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-7 w-7 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <CreditCard className="h-3.5 w-3.5" />
                </div>
                <p className="text-[11px] font-bold text-white/80 uppercase tracking-[0.12em]">Programa de Cartão</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {emp.tipo_cartao && (
                  <div>
                    <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider">Tipo</p>
                    <p className="text-[16px] font-bold mt-1">{emp.tipo_cartao}</p>
                  </div>
                )}
                {emp.nome_private_label && (
                  <div>
                    <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider">Programa</p>
                    <p className="text-[16px] font-bold mt-1">{emp.nome_private_label}</p>
                  </div>
                )}
                {emp.valor_mensal > 0 && (
                  <div>
                    <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider">Receita mensal</p>
                    <p className="text-[22px] font-extrabold mt-1 tracking-[-0.5px]">{fmt(emp.valor_mensal)}</p>
                  </div>
                )}
                {emp.produtos_ativos && (
                  <div>
                    <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider">Produtos</p>
                    <p className="text-[13px] font-semibold mt-1 leading-snug">{emp.produtos_ativos}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="oportunidades">
          <TabsList>
            <TabsTrigger value="oportunidades">
              Oportunidades
              <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 bg-[#F1F5F9] text-[#64748B] rounded-md">{emp.oportunidades?.length ?? 0}</span>
            </TabsTrigger>
            <TabsTrigger value="contatos">
              Contatos
              <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 bg-[#F1F5F9] text-[#64748B] rounded-md">{emp.contatos?.length ?? 0}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="oportunidades" className="mt-4 space-y-2">
            <div className="flex justify-end mb-3">
              <ButtonLink href={`/oportunidades/nova?empresa_id=${id}`} size="sm">+ Oportunidade</ButtonLink>
            </div>
            {emp.oportunidades?.length === 0 && (
              <div className="surface-card rounded-2xl py-10 text-center">
                <p className="text-[14px] font-bold text-[#0F172A]">Nenhuma oportunidade cadastrada</p>
                <p className="text-[12px] text-[#64748B] mt-1">Crie a primeira oportunidade para esta empresa</p>
              </div>
            )}
            {emp.oportunidades?.map((o: any) => (
              <Link
                key={o.id}
                href={`/oportunidades/${o.id}`}
                className="surface-card surface-card-hover flex items-center justify-between gap-4 px-5 py-4 rounded-2xl group transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-xl tint-violet flex items-center justify-center flex-shrink-0">
                    <DollarSign className="h-4 w-4 text-violet-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-bold text-[#0F172A] group-hover:text-[#4F46E5] transition-colors truncate">{o.titulo}</p>
                    <div className="flex items-center gap-3 mt-0.5 text-[12px] text-[#64748B]">
                      {o.num_cartoes > 0 && (
                        <span className="flex items-center gap-1">
                          <CreditCard className="h-3 w-3" />{o.num_cartoes} cartões
                        </span>
                      )}
                      {o.responsavel && <span>{o.responsavel}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-[14px] font-bold text-[#0F172A]">{fmt(o.valor_estimado)}</span>
                  <span className={`text-[11px] font-bold px-2 py-1 rounded-md ${ETAPA_STYLE[o.etapa]?.bg ?? "bg-[#F1F5F9]"} ${ETAPA_STYLE[o.etapa]?.text ?? "text-[#64748B]"}`}>
                    {ETAPA_LABEL[o.etapa] ?? o.etapa}
                  </span>
                </div>
              </Link>
            ))}
          </TabsContent>

          <TabsContent value="contatos" className="mt-4 space-y-2">
            <div className="flex justify-end mb-3">
              <ButtonLink href={`/contatos/novo?empresa_id=${id}`} size="sm">+ Contato</ButtonLink>
            </div>
            {emp.contatos?.length === 0 && (
              <div className="surface-card rounded-2xl py-10 text-center">
                <p className="text-[14px] font-bold text-[#0F172A]">Nenhum contato cadastrado</p>
              </div>
            )}
            {emp.contatos?.map((c: any) => (
              <div key={c.id} className="surface-card flex items-center gap-4 px-5 py-4 rounded-2xl">
                <div
                  className="h-11 w-11 rounded-full flex items-center justify-center text-white text-[14px] font-bold flex-shrink-0 shadow-sm"
                  style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)" }}
                >
                  {c.nome?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-[#0F172A]">{c.nome}</p>
                  {c.cargo && <p className="text-[12px] text-[#64748B]">{c.cargo}</p>}
                </div>
                <div className="text-[12px] text-[#64748B] text-right space-y-0.5">
                  {c.email && <p className="flex items-center gap-1 justify-end"><Mail className="h-3 w-3" />{c.email}</p>}
                  {c.telefone && <p className="flex items-center gap-1 justify-end"><Phone className="h-3 w-3" />{c.telefone}</p>}
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
