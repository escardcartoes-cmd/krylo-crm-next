"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Topbar } from "@/components/layout/Topbar";
import { ButtonLink } from "@/components/ui/button-link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Phone, Mail, MapPin, Edit, ArrowLeft, CreditCard, Users, DollarSign } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

function fmt(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);
}

const ETAPA_STYLE: Record<string, string> = {
  prospect:   "bg-[#F2F2F7] text-[#636366]",
  contato:    "bg-[#EEF3FF] text-[#0057FF]",
  proposta:   "bg-[#FFF8E8] text-[#B07D00]",
  negociacao: "bg-[#FFF3E8] text-[#C05000]",
  fechado:    "bg-[#E8F9F0] text-[#1C7C4A]",
  perdido:    "bg-[#FFF1F0] text-[#FF3B30]",
};

const ETAPA_LABEL: Record<string, string> = {
  prospect: "Prospecção", contato: "Contato", proposta: "Proposta",
  negociacao: "Negociação", fechado: "Implantação", perdido: "Perdido",
};

function InfoChip({ icon: Icon, label, value }: { icon: React.ComponentType<{className?:string}>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white/60 rounded-xl border border-white/80">
      <div className="h-6 w-6 rounded-lg bg-white/80 flex items-center justify-center flex-shrink-0">
        <Icon className="h-3.5 w-3.5 text-[#0057FF]" />
      </div>
      <div>
        <p className="text-[10px] text-[#0057FF]/60 font-semibold uppercase tracking-wider">{label}</p>
        <p className="text-[13px] font-semibold text-[#1C1C1E]">{value}</p>
      </div>
    </div>
  );
}

export default function EmpresaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: emp, isLoading } = useQuery({
    queryKey: ["empresa", id],
    queryFn: () => api.get(`/api/empresas/${id}`).then(r => r.data),
  });

  if (isLoading) return (
    <>
      <Topbar title="Empresa" />
      <div className="px-7 pt-4 space-y-4">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    </>
  );

  if (!emp) return (
    <>
      <Topbar title="Empresa" />
      <div className="px-7 pt-8 text-center text-[#8E8E93]">Empresa não encontrada.</div>
    </>
  );

  const hasCartao = emp.tipo_cartao || emp.nome_private_label || emp.cliente_ativo;

  return (
    <>
      <Topbar
        title={emp.nome}
        subtitle={emp.segmento || "Empresa"}
        actions={
          <>
            <ButtonLink href="/empresas" variant="outline" size="sm"><ArrowLeft className="h-3.5 w-3.5 mr-1" />Voltar</ButtonLink>
            <ButtonLink href={`/empresas/${id}/editar`} size="sm"><Edit className="h-3.5 w-3.5 mr-1" />Editar</ButtonLink>
          </>
        }
      />
      <div className="px-7 pt-4 pb-7 space-y-4">

        {/* Header info — blue gradient tint */}
        <div
          className="rounded-2xl overflow-hidden shadow-[0_0_0_1px_rgba(0,87,255,0.12),0_4px_20px_rgba(0,87,255,0.08)]"
          style={{ background: "linear-gradient(135deg, #EEF3FF 0%, #F5F8FF 50%, #FAFBFF 100%)" }}
        >
          <div className="p-5">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,87,255,0.15)] flex items-center justify-center flex-shrink-0">
                <Building2 className="h-7 w-7 text-[#0057FF]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h1 className="text-[20px] font-extrabold text-[#1C1C1E] tracking-[-0.4px]">{emp.nome}</h1>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${emp.status === "cliente" ? "bg-[#E8F9F0] text-[#1C7C4A]" : emp.status === "prospect" ? "bg-[#EEF3FF] text-[#0057FF]" : "bg-[#F2F2F7] text-[#636366]"}`}>
                    {emp.status}
                  </span>
                  {emp.porte && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-white/70 text-[#636366]">{emp.porte}</span>
                  )}
                  {emp.cliente_ativo ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#0057FF] text-white flex items-center gap-1">
                      <CreditCard className="h-3 w-3" />Cartão ativo
                    </span>
                  ) : null}
                </div>
                {emp.segmento && (
                  <p className="text-[13px] text-[#636366] mb-3">{emp.segmento}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  {emp.cnpj && <InfoChip icon={Building2} label="CNPJ" value={emp.cnpj} />}
                  {emp.telefone && <InfoChip icon={Phone} label="Telefone" value={emp.telefone} />}
                  {emp.email && <InfoChip icon={Mail} label="E-mail" value={emp.email} />}
                  {emp.cidade && <InfoChip icon={MapPin} label="Localização" value={`${emp.cidade}${emp.estado ? `, ${emp.estado}` : ""}`} />}
                  {emp.num_funcionarios && <InfoChip icon={Users} label="Funcionários" value={String(emp.num_funcionarios)} />}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Programa de cartão */}
        {hasCartao && (
          <div className="bg-gradient-to-r from-[#0057FF] to-[#338BFF] rounded-2xl p-5 text-white relative overflow-hidden shadow-[0_4px_20px_rgba(0,87,255,0.3)]">
            <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
            <div className="absolute -right-2 top-10 h-16 w-16 rounded-full bg-white/10" />
            <div className="absolute right-20 -bottom-4 h-20 w-20 rounded-full bg-white/5" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="h-4 w-4 text-white/80" />
                <p className="text-[11px] font-bold text-white/70 uppercase tracking-wider">Programa de Cartão</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {emp.tipo_cartao && (
                  <div>
                    <p className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Tipo</p>
                    <p className="text-[15px] font-bold mt-0.5">{emp.tipo_cartao}</p>
                  </div>
                )}
                {emp.nome_private_label && (
                  <div>
                    <p className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Programa</p>
                    <p className="text-[15px] font-bold mt-0.5">{emp.nome_private_label}</p>
                  </div>
                )}
                {emp.valor_mensal > 0 && (
                  <div>
                    <p className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Receita mensal</p>
                    <p className="text-[20px] font-extrabold mt-0.5 tracking-[-0.5px]">{fmt(emp.valor_mensal)}</p>
                  </div>
                )}
                {emp.produtos_ativos && (
                  <div>
                    <p className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Produtos</p>
                    <p className="text-[13px] font-semibold mt-0.5 leading-snug">{emp.produtos_ativos}</p>
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
              <span className="ml-1.5 text-[10px] font-bold px-1 py-0.5 bg-[#F2F2F7] text-[#636366] rounded-md">{emp.oportunidades?.length ?? 0}</span>
            </TabsTrigger>
            <TabsTrigger value="contatos">
              Contatos
              <span className="ml-1.5 text-[10px] font-bold px-1 py-0.5 bg-[#F2F2F7] text-[#636366] rounded-md">{emp.contatos?.length ?? 0}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="oportunidades" className="mt-4 space-y-2">
            <div className="flex justify-end mb-3">
              <ButtonLink href={`/oportunidades/nova?empresa_id=${id}`} size="sm">+ Oportunidade</ButtonLink>
            </div>
            {emp.oportunidades?.length === 0 && (
              <div className="text-center py-10 bg-white rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.06)]">
                <p className="text-[13px] text-[#8E8E93]">Nenhuma oportunidade cadastrada</p>
                <p className="text-[12px] text-[#C7C7CC] mt-1">Crie a primeira oportunidade para esta empresa</p>
              </div>
            )}
            {emp.oportunidades?.map((o: any) => (
              <Link key={o.id} href={`/oportunidades/${o.id}`}
                className="flex items-center justify-between px-5 py-4 bg-white rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.06)] hover:shadow-[0_0_0_1px_rgba(0,87,255,0.2),0_4px_12px_rgba(0,87,255,0.06)] transition-all group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-[#EEF3FF] flex items-center justify-center flex-shrink-0">
                    <DollarSign className="h-4 w-4 text-[#0057FF]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-[#1C1C1E] group-hover:text-[#0057FF] transition-colors">{o.titulo}</p>
                    <div className="flex items-center gap-3 mt-0.5 text-[12px] text-[#8E8E93]">
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
                  <span className="text-[14px] font-bold text-[#1C1C1E]">{fmt(o.valor_estimado)}</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-lg ${ETAPA_STYLE[o.etapa] ?? "bg-[#F2F2F7] text-[#636366]"}`}>
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
              <div className="text-center py-10 bg-white rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.06)]">
                <p className="text-[13px] text-[#8E8E93]">Nenhum contato cadastrado</p>
              </div>
            )}
            {emp.contatos?.map((c: any) => (
              <div key={c.id} className="flex items-center gap-4 px-5 py-4 bg-white rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.06)]">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#0057FF] to-[#6B8EFF] flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0">
                  {c.nome?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#1C1C1E]">{c.nome}</p>
                  {c.cargo && <p className="text-[12px] text-[#8E8E93]">{c.cargo}</p>}
                </div>
                <div className="text-[12px] text-[#8E8E93] text-right space-y-0.5">
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
