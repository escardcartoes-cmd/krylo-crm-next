"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { CreditCard } from "lucide-react";

function fmt(v: number, dec = 2) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: dec, maximumFractionDigits: dec }).format(v);
}
function n(v: number) { return new Intl.NumberFormat("pt-BR").format(v); }

const inputCls = "w-full h-9 px-3.5 rounded-xl border border-[rgba(0,0,0,0.1)] bg-[#F9F9FB] text-[13px] text-[#1C1C1E] outline-none focus:border-[#0057FF] focus:ring-2 focus:ring-[#0057FF]/10 transition-all";

function SliderField({ label, value, min, max, step, onChange, display }: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; display: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider">{label}</label>
        <span className="text-[13px] font-bold text-[#1C1C1E]">{display}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full accent-[#0057FF] cursor-pointer"
      />
      <div className="flex justify-between text-[10px] text-[#C7C7CC] mt-1">
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
      <Topbar title="Simulador de receita" subtitle="Projete o retorno de um programa de cartões" />
      <div className="px-7 pt-4 pb-7 max-w-3xl space-y-4">

        {/* Inputs */}
        <div className="bg-white rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)] p-6 space-y-5">
          <p className="text-[11px] font-semibold text-[#0057FF] uppercase tracking-wider">Parâmetros da operação</p>

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
            <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-1.5">
              Mensalidade por cartão (R$) <span className="normal-case text-[#C7C7CC] font-normal">— opcional</span>
            </label>
            <input
              className={inputCls} type="number" min="0" step="0.50" value={ticketCartao || ""}
              onChange={e => setTicketCartao(Number(e.target.value))}
              placeholder="Ex: 3.00"
            />
          </div>
        </div>

        {/* Resultado principal */}
        <div
          className="rounded-2xl p-6 text-white relative overflow-hidden"
          style={{ background: "linear-gradient(135deg,#0057FF,#338BFF)", boxShadow: "0 4px 24px rgba(0,87,255,0.25)" }}
        >
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="h-4 w-4 text-white/80" />
              <p className="text-[11px] font-semibold text-white/80 uppercase tracking-wider">Projeção com {n(cartoes)} cartões</p>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Receita mensal</p>
                <p className="text-[28px] font-extrabold tracking-[-0.5px] mt-1">{fmt(receitaTotal, 0)}</p>
              </div>
              <div>
                <p className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Receita anual</p>
                <p className="text-[20px] font-bold mt-1">{fmt(receitaAnual + (receitaCartao * 12), 0)}</p>
              </div>
              <div>
                <p className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Faturamento clientes</p>
                <p className="text-[16px] font-bold mt-1">{fmt(faturamento, 0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detalhamento */}
        <div className="bg-white rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.06)] p-5">
          <p className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-4">Detalhamento</p>
          <div className="space-y-3">
            {[
              { label: `Taxa ${taxa.toFixed(1)}% s/ ${fmt(faturamento, 0)}`, value: fmt(receitaTaxa) },
              ...(receitaCartao > 0 ? [{ label: `Mensalidade ${n(cartoes)} × R$ ${ticketCartao}`, value: fmt(receitaCartao) }] : []),
              { label: "Total mensal", value: fmt(receitaTotal), bold: true },
              { label: "Total anual (12 meses)", value: fmt((receitaTaxa + receitaCartao) * 12), bold: true },
            ].map((row, i) => (
              <div key={i} className={`flex items-center justify-between py-2 ${i > 0 ? "border-t border-[rgba(0,0,0,0.04)]" : ""}`}>
                <p className={`text-[13px] ${row.bold ? "font-semibold text-[#1C1C1E]" : "text-[#8E8E93]"}`}>{row.label}</p>
                <p className={`text-[13px] font-bold ${row.bold ? "text-[#0057FF]" : "text-[#1C1C1E]"}`}>{row.value}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}
