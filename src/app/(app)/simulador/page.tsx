"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { CreditCard, Calculator, TrendingUp } from "lucide-react";

function fmt(v: number, dec = 2) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: dec, maximumFractionDigits: dec }).format(v);
}
function n(v: number) { return new Intl.NumberFormat("pt-BR").format(v); }

const inputCls = "w-full h-10 pl-3.5 pr-3.5 rounded-xl bg-white border border-[rgba(15,23,42,0.08)] text-[13px] text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 transition-all shadow-sm";

function SliderField({ label, value, min, max, step, onChange, display }: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; display: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">{label}</label>
        <span className="text-[14px] font-extrabold text-[#0F172A]">{display}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full accent-[#4F46E5] cursor-pointer"
      />
      <div className="flex justify-between text-[10px] text-[#94A3B8] mt-1">
        <span>{min}</span><span>{max}</span>
      </div>
    </div>
  );
}

export default function SimuladorPage() {
  const [cartoes, setCartoes] = useState(500);
  const [ticket, setTicket] = useState(800);
  const [taxa, setTaxa] = useState(2.5);
  const [ticketCartao, setTicketCartao] = useState(0);

  const faturamento = cartoes * ticket;
  const receitaTaxa = (faturamento * taxa) / 100;
  const receitaAnual = receitaTaxa * 12;
  const receitaCartao = cartoes * ticketCartao;
  const receitaTotal = receitaTaxa + receitaCartao;

  return (
    <>
      <Topbar
        title="Simulador de receita"
        subtitle="Projete o retorno de um programa de cartões"
      />
      <div className="flex-1 px-8 pt-4 pb-8">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">

          {/* LEFT — inputs */}
          <div className="surface-card rounded-2xl p-6 space-y-6 h-fit">
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl tint-blue">
              <Calculator className="h-4 w-4 text-[#4F46E5]" />
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#4F46E5]">Parâmetros da operação</span>
            </div>

            <SliderField
              label="Cartões emitidos" value={cartoes} min={50} max={5000} step={50}
              onChange={setCartoes} display={n(cartoes) + " cartões"}
            />
            <SliderField
              label="Ticket médio por cartão (R$)" value={ticket} min={100} max={5000} step={100}
              onChange={setTicket} display={fmt(ticket, 0)}
            />
            <SliderField
              label="Taxa de processamento (%)" value={taxa} min={0.5} max={5} step={0.1}
              onChange={setTaxa} display={taxa.toFixed(1) + "%"}
            />

            <div>
              <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-2">
                Mensalidade por cartão (R$) <span className="normal-case text-[#94A3B8] font-medium">— opcional</span>
              </label>
              <input
                className={inputCls} type="number" min="0" step="0.50" value={ticketCartao || ""}
                onChange={e => setTicketCartao(Number(e.target.value))}
                placeholder="Ex: 3.00"
              />
            </div>
          </div>

          {/* RIGHT — results */}
          <div className="space-y-4 h-fit xl:sticky xl:top-4">
            {/* Resultado principal */}
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
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-7 w-7 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <CreditCard className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-[11px] font-bold text-white/80 uppercase tracking-[0.12em]">
                    Projeção com {n(cartoes)} cartões
                  </p>
                </div>
                <p className="text-[11px] text-white/70 font-semibold uppercase tracking-wider">Receita mensal</p>
                <p className="text-[40px] font-black tracking-[-1.5px] leading-none mt-1">{fmt(receitaTotal, 0)}</p>

                <div className="grid grid-cols-2 gap-3 mt-5">
                  <div className="rounded-xl bg-white/10 backdrop-blur-sm p-3">
                    <p className="text-[10px] text-white/70 font-semibold uppercase tracking-wider">Anual</p>
                    <p className="text-[18px] font-bold mt-0.5">{fmt(receitaAnual + (receitaCartao * 12), 0)}</p>
                  </div>
                  <div className="rounded-xl bg-white/10 backdrop-blur-sm p-3">
                    <p className="text-[10px] text-white/70 font-semibold uppercase tracking-wider">Faturamento</p>
                    <p className="text-[18px] font-bold mt-0.5">{fmt(faturamento, 0)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detalhamento */}
            <div className="surface-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-4 w-4 text-[#4F46E5]" />
                <p className="text-[12px] font-bold text-[#475569] uppercase tracking-[0.08em]">Detalhamento</p>
              </div>
              <div className="space-y-1">
                {[
                  { label: `Taxa ${taxa.toFixed(1)}% s/ ${fmt(faturamento, 0)}`, value: fmt(receitaTaxa) },
                  ...(receitaCartao > 0 ? [{ label: `Mensalidade ${n(cartoes)} × R$ ${ticketCartao}`, value: fmt(receitaCartao) }] : []),
                  { label: "Total mensal", value: fmt(receitaTotal), bold: true },
                  { label: "Total anual (12 meses)", value: fmt((receitaTaxa + receitaCartao) * 12), bold: true },
                ].map((row, i) => (
                  <div key={i} className={`flex items-center justify-between py-2.5 ${i > 0 ? "border-t border-[rgba(15,23,42,0.05)]" : ""}`}>
                    <p className={`text-[13px] ${row.bold ? "font-bold text-[#0F172A]" : "text-[#64748B]"}`}>{row.label}</p>
                    <p className={`text-[13px] font-bold ${row.bold ? "text-[#4F46E5]" : "text-[#0F172A]"}`}>{row.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
