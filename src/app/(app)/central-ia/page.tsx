"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Topbar } from "@/components/layout/Topbar";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Send, Loader2 } from "lucide-react";

interface Message { role: "user" | "assistant"; content: string; }

export default function CentralIAPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Olá! Sou a IA do Krylo 🤖\n\nEspecialista em vendas de cartões private label e benefícios. Posso ajudar com:\n\n• Gerar pitch de prospecção por segmento\n• Analisar potencial de uma empresa\n• Sugerir próxima ação em uma negociação\n• Calcular proposta de implantação\n• Responder objeções comuns\n\nComo posso ajudar?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);
    try {
      const r = await api.post("/ia/chat", { mensagem: userMsg });
      setMessages(prev => [...prev, { role: "assistant", content: r.data.resposta ?? r.data.mensagem ?? "Sem resposta." }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Erro ao conectar com a IA. Verifique a chave Anthropic no backend." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Topbar title="Central de IA" subtitle="Assistente inteligente do Krylo" />
      <div className="px-7 pt-4 pb-7 flex flex-col max-w-3xl" style={{ height: "calc(100vh - 120px)" }}>
        {/* Chat window */}
        <div className="flex-1 bg-white rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)] flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-semibold ${
                    m.role === "assistant"
                      ? "bg-[#EBF0FF] text-[#0057FF]"
                      : "bg-[#F2F2F7] text-[#8E8E93]"
                  }`}
                >
                  {m.role === "assistant" ? <Brain className="h-3.5 w-3.5" /> : "V"}
                </div>
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed ${
                    m.role === "assistant"
                      ? "bg-[#F9F9FB] text-[#1C1C1E] rounded-tl-sm shadow-[0_0_0_1px_rgba(0,0,0,0.06)]"
                      : "bg-[#0057FF] text-white rounded-tr-sm"
                  }`}
                >
                  <p className="whitespace-pre-line">{m.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="h-7 w-7 rounded-full bg-[#EBF0FF] text-[#0057FF] flex items-center justify-center flex-shrink-0">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                </div>
                <div className="bg-[#F9F9FB] rounded-2xl rounded-tl-sm px-4 py-3 shadow-[0_0_0_1px_rgba(0,0,0,0.06)]">
                  <div className="flex gap-1 items-center">
                    <span className="h-1.5 w-1.5 bg-[#C7C7CC] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-1.5 w-1.5 bg-[#C7C7CC] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-1.5 w-1.5 bg-[#C7C7CC] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="border-t border-[rgba(0,0,0,0.06)] p-4 flex gap-3 items-end">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
              }}
              placeholder="Digite sua mensagem… (Enter para enviar, Shift+Enter para nova linha)"
              rows={2}
              className="flex-1 resize-none rounded-xl border border-[rgba(0,0,0,0.1)] bg-[#F9F9FB] text-[13px] focus:border-[#0057FF] focus:ring-2 focus:ring-[#0057FF]/10"
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="h-10 w-10 flex items-center justify-center bg-[#0057FF] text-white rounded-xl hover:bg-[#0046CC] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
