"use client";

import { useState, useRef, useEffect } from "react";
import { api } from "@/lib/api";
import { Topbar } from "@/components/layout/Topbar";
import { Send, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message { role: "user" | "assistant"; content: string; }

export default function CentralIAPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Olá! Como posso ajudar?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

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
      <div className="flex-1 px-8 pt-4 pb-8 flex flex-col min-h-0" style={{ height: "calc(100vh - 96px)" }}>
        <div className="flex-1 surface-card rounded-xl flex flex-col overflow-hidden min-h-0">

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] px-4 py-3 rounded-2xl text-[13.5px] leading-relaxed ${
                    m.role === "user"
                      ? "bg-[#4F46E5] text-white rounded-br-md"
                      : "bg-[#F1F5F9] text-[#0F172A] rounded-bl-md"
                  }`}
                >
                  {m.role === "assistant" ? (
                    <div className="prose-chat">
                      <ReactMarkdown
                        components={{
                          h1: ({children}) => <h2 className="text-[15px] font-semibold text-[#0F172A] mt-3 mb-2 first:mt-0">{children}</h2>,
                          h2: ({children}) => <h3 className="text-[14px] font-semibold text-[#0F172A] mt-3 mb-2 first:mt-0">{children}</h3>,
                          h3: ({children}) => <h4 className="text-[13.5px] font-semibold text-[#0F172A] mt-3 mb-1.5 first:mt-0">{children}</h4>,
                          p: ({children}) => <p className="mb-2 last:mb-0 whitespace-pre-line">{children}</p>,
                          strong: ({children}) => <strong className="font-semibold text-[#0F172A]">{children}</strong>,
                          em: ({children}) => <em className="italic">{children}</em>,
                          ul: ({children}) => <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>,
                          ol: ({children}) => <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>,
                          li: ({children}) => <li>{children}</li>,
                          code: ({children}) => <code className="bg-[#E2E8F0] px-1.5 py-0.5 rounded text-[12.5px] font-mono">{children}</code>,
                          a: ({href, children}) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#4F46E5] underline">{children}</a>,
                          hr: () => <hr className="my-3 border-[#E2E8F0]" />,
                        }}
                      >
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-line">{m.content}</p>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#F1F5F9] rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2 text-[13px] text-[#64748B]">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />Pensando…
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="border-t border-[#F1F5F9] p-3 flex gap-2 items-end bg-white">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
              }}
              placeholder="Digite sua mensagem…"
              rows={1}
              className="flex-1 resize-none px-3.5 py-2.5 rounded-lg bg-white border border-[#CBD5E1] text-[13px] text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15 transition-colors max-h-32"
            />
            <button
              onClick={send} disabled={loading || !input.trim()}
              className="h-10 w-10 flex items-center justify-center bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
