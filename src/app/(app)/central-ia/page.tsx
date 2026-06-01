"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Topbar } from "@/components/layout/Topbar";
import { Brain, Send, Loader2, Sparkles } from "lucide-react";

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
      <div className="flex-1 px-8 pt-4 pb-8 flex flex-col" style={{ height: "calc(100vh - 120px)" }}>
        {/* Chat window */}
        <div className="flex-1 surface-card rounded-2xl flex flex-col overflow-hidden max-w-4xl w-full">
          {/* Gradient header */}
          <div
            className="px-5 py-4 text-white relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg,#4F46E5 0%,#7C3AED 50%,#A855F7 100%)",
            }}
          >
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="relative flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[15px] font-bold">Krylo AI</p>
                <p className="text-[12px] text-white/80">Assistente de vendas inteligente</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#FAFBFC]">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold ${
                    m.role === "assistant"
                      ? "tint-blue text-[#4F46E5]"
                      : "bg-[#F1F5F9] text-[#64748B]"
                  }`}
                >
                  {m.role === "assistant" ? <Brain className="h-4 w-4" /> : "V"}
                </div>
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed ${
                    m.role === "assistant"
                      ? "bg-white text-[#0F172A] rounded-tl-sm border border-[rgba(15,23,42,0.06)] shadow-sm"
                      : "text-white rounded-tr-sm"
                  }`}
                  style={m.role === "user" ? {
                    background: "linear-gradient(135deg,#4F46E5,#6366F1)",
                    boxShadow: "0 2px 8px rgba(79,70,229,0.25)",
                  } : undefined}
                >
                  <p className="whitespace-pre-line">{m.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full tint-blue text-[#4F46E5] flex items-center justify-center flex-shrink-0">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
                <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 border border-[rgba(15,23,42,0.06)] shadow-sm">
                  <div className="flex gap-1 items-center">
                    <span className="h-1.5 w-1.5 bg-[#94A3B8] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-1.5 w-1.5 bg-[#94A3B8] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-1.5 w-1.5 bg-[#94A3B8] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="border-t border-[rgba(15,23,42,0.06)] p-4 flex gap-3 items-end bg-white">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
              }}
              placeholder="Digite sua mensagem… (Enter para enviar, Shift+Enter para nova linha)"
              rows={2}
              className="flex-1 resize-none px-3.5 py-2.5 rounded-xl bg-white border border-[rgba(15,23,42,0.08)] text-[13px] text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 transition-all shadow-sm"
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="h-10 w-10 flex items-center justify-center text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 transition-all active:scale-[0.96]"
              style={{
                background: "linear-gradient(135deg,#4F46E5,#6366F1)",
                boxShadow: "0 4px 12px rgba(79,70,229,0.3)",
              }}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
