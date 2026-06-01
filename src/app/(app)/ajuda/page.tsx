import { Topbar } from "@/components/layout/Topbar";
import { HelpCircle, BookOpen, MessageCircle, Mail } from "lucide-react";

const SECTIONS = [
  {
    icon: BookOpen,
    title: "Documentação",
    items: [
      "Como importar leads via planilha",
      "Configurar cadências SDR",
      "Usar o Pipeline Kanban",
      "Integração com WhatsApp",
      "Configurar metas de vendas",
    ],
  },
  {
    icon: MessageCircle,
    title: "Primeiros passos",
    items: [
      "1. Cadastre sua empresa em Empresas → Nova empresa",
      "2. Adicione contatos vinculados à empresa",
      "3. Crie uma oportunidade em Oportunidades → Nova",
      "4. Acompanhe no Pipeline Kanban",
      "5. Configure cadências SDR para automatizar prospecção",
    ],
  },
];

export default function AjudaPage() {
  return (
    <>
      <Topbar title="Central de Ajuda" subtitle="Guias e recursos do Krylo" />
      <div className="px-7 pt-4 pb-7 space-y-4 max-w-3xl">
        {/* Hero */}
        <div className="bg-[#EBF0FF] rounded-2xl px-5 py-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-[#0057FF] flex items-center justify-center flex-shrink-0">
            <HelpCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#0057FF]">Como podemos ajudar?</p>
            <p className="text-[12px] text-[#0057FF]/70 mt-0.5">
              Encontre guias, tutoriais e suporte para o Krylo
            </p>
          </div>
        </div>

        {SECTIONS.map((s) => (
          <div
            key={s.title}
            className="bg-white rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-[rgba(0,0,0,0.06)] flex items-center gap-2">
              <s.icon className="h-4 w-4 text-[#0057FF]" />
              <p className="text-[13px] font-semibold text-[#1C1C1E]">{s.title}</p>
            </div>
            <ul className="px-5 py-4 space-y-2.5">
              {s.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px] text-[#1C1C1E]">
                  <span className="text-[#0057FF] mt-0.5 flex-shrink-0">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Support card */}
        <div className="bg-white rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#F9F9FB] flex items-center justify-center flex-shrink-0">
              <Mail className="h-4 w-4 text-[#8E8E93]" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#1C1C1E]">Precisa de suporte?</p>
              <p className="text-[12px] text-[#8E8E93] mt-0.5">Entre em contato com o administrador do sistema</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
