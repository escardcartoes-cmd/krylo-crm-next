"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";

function fmt(v: number, dec = 2) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: dec, maximumFractionDigits: dec }).format(v);
}
function n(v: number) { return new Intl.NumberFormat("pt-BR").format(v); }

const inputCls = "w-full h-9 px-3 rounded-lg border border-[#CBD5E1] bg-white text-[13px] text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15 transition-colors";

function SliderField({ label, value, min, max, step, onChange, display }: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; display: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[12px] font-medium text-[#334155]">{label}</label>
        <span className="text-[13px] font-medium text-[#0F172A] tabular-nums">{display}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full accent-[#4F46E5] cursor-pointer"
      />
      <div className="flex justify-between text-[11px] text-[#94A3B8] mt-1 tabular-nums">
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
  const receitaCartao = cartoes * ticketCartao;
  const receitaTotal = receitaTaxa + receitaCartao;
  const receitaAnual = receitaTotal * 12;

  return (
    <>
      <Topbar
        title="Simulador de receita"
        subtitle="Calcule a receita projetada"
      />
      <div className="flex-1 px-8 pt-4 pb-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

          <div className="surface-card rounded-xl p-6 space-y-6">
            <h3 className="text-[13px] font-semibold text-[#0F172A] pb-3 border-b border-[#F1F5F9]">Parâmetros</h3>

            <SliderField
              label="Cartões emitidos" value={cartoes} min={50} max={5000} step={50}
              onChange={setCartoes} display={`${n(cartoes)} cartões`}
            />
            <SliderField
              label="Ticket médio por cartão (R$)" value={ticket} min={100} max={5000} step={100}
              onChange={setTicket} display={fmt(ticket, 0)}
            />
            <SliderField
              label="Taxa de processamento (%)" value={taxa} min={0.5} max={5} step={0.1}
              onChange={setTaxa} display={`${taxa.toFixed(1)}%`}
            />

            <div>
              <label className="block text-[12px] font-medium text-[#334155] mb-1.5">
                Mensalidade por cartão (R$) <span className="text-[#94A3B8] font-normal">— opcional</span>
              </label>
              <input
                className={inputCls} type="number" min="0" step="0.50" value={ticketCartao || ""}
                onChange={e => setTicketCartao(Number(e.target.value))}
                placeholder="3,00"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="surface-card rounded-xl p-6">
              <p className="text-[12px] font-medium text-[#64748B]">Receita mensal</p>
              <p className="text-[36px] font-semibold text-[#0F172A] tabular-nums leading-none mt-2">{fmt(receitaTotal, 0)}</p>
              <p className="text-[12px] text-[#64748B] mt-2">
                Anual: <span className="font-medium text-[#0F172A] tabular-nums">{fmt(receitaAnual, 0)}</span>
              </p>
            </div>

            <div className="surface-card rounded-xl p-5">
              <h3 className="text-[13px] font-semibold text-[#0F172A] pb-3 border-b border-[#F1F5F9] mb-4">Detalhamento</h3>
              <div className="space-y-2">
                {[
                  { label: `Taxa ${taxa.toFixed(1)}% sobre ${fmt(faturamento, 0)}`, value: fmt(receitaTaxa) },
                  ...(receitaCartao > 0 ? [{ label: `Mensalidade ${n(cartoes)} × R$ ${ticketCartao}`, value: fmt(receitaCartao) }] : []),
                  { label: "Total mensal", value: fmt(receitaTotal), bold: true },
                  { label: "Total anual (12 meses)", value: fmt(receitaAnual), bold: true },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5">
                    <p className={`text-[13px] ${row.bold ? "font-medium text-[#0F172A]" : "text-[#64748B]"}`}>{row.label}</p>
                    <p className={`text-[13px] tabular-nums ${row.bold ? "font-medium text-[#0F172A]" : "text-[#64748B]"}`}>{row.value}</p>
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
