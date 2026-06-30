"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Topbar } from "@/components/layout/Topbar";
import { Send, Loader2 } from "lucide-react";

interface Message { role: "user" | "assistant"; content: string; }

export default function CentralIAPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Olá! Como posso ajudar?" },
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
      const r = await api.post("/api/ia/chat", { mensagem: userMsg });
      setMessages(prev => [...prev, { role: "assistant", content: r.data.resposta ?? r.data.mensagem ?? "Sem resposta." }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Erro ao conectar. Verifique a configuração no backend." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Topbar title="Central de IA" />
      <div className="flex-1 px-8 pt-4 pb-8 flex flex-col" style={{ height: "calc(100vh - 120px)" }}>
        <div className="flex-1 surface-card rounded-xl flex flex-col overflow-hidden max-w-4xl w-full">

          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] px-3.5 py-2.5 rounded-lg text-[13px] leading-relaxed whitespace-pre-line ${
                    m.role === "user"
                      ? "bg-[#4F46E5] text-white"
                      : "bg-[#F1F5F9] text-[#0F172A]"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#F1F5F9] rounded-lg px-3.5 py-2.5 flex items-center gap-2 text-[13px] text-[#64748B]">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />Pensando…
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-[#F1F5F9] p-3 flex gap-2 items-end bg-white">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
              }}
              placeholder="Digite sua mensagem…"
              rows={2}
              className="flex-1 resize-none px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-[13px] text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15 transition-colors"
            />
            <button
              onClick={send} disabled={loading || !input.trim()}
              className="h-9 w-9 flex items-center justify-center bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
