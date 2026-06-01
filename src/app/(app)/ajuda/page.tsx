import { Topbar } from "@/components/layout/Topbar";
import { HelpCircle, BookOpen, MessageCircle, Mail, Sparkles } from "lucide-react";

const SECTIONS = [
  {
    icon: BookOpen,
    title: "Documentação",
    tint: "tint-blue",
    color: "text-[#4F46E5]",
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
    tint: "tint-emerald",
    color: "text-emerald-700",
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
      <div className="flex-1 px-8 pt-4 pb-8 space-y-5 max-w-4xl">

        {/* Hero */}
        <div
          className="rounded-2xl p-6 text-white relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg,#4F46E5 0%,#7C3AED 50%,#A855F7 100%)",
            boxShadow: "0 10px 40px rgba(79,70,229,0.3), 0 4px 12px rgba(124,58,237,0.2)",
          }}
        >
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-pink-400/20 blur-3xl" />
          <div className="relative flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <HelpCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[17px] font-extrabold">Como podemos ajudar?</p>
              <p className="text-[13px] text-white/80 mt-0.5">
                Encontre guias, tutoriais e suporte para o Krylo
              </p>
            </div>
          </div>
        </div>

        {SECTIONS.map((s) => (
          <div
            key={s.title}
            className="surface-card rounded-2xl overflow-hidden"
          >
            <div className={`px-5 py-3.5 flex items-center gap-2.5 ${s.tint}`}>
              <s.icon className={`h-4 w-4 ${s.color}`} />
              <p className={`text-[12px] font-bold uppercase tracking-wider ${s.color}`}>{s.title}</p>
            </div>
            <ul className="px-5 py-4 space-y-2.5">
              {s.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[13px] text-[#0F172A]">
                  <span className={`mt-0.5 flex-shrink-0 ${s.color}`}>•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Support card */}
        <div className="surface-card rounded-2xl px-5 py-5 flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl tint-amber flex items-center justify-center flex-shrink-0">
            <Mail className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-bold text-[#0F172A]">Precisa de suporte?</p>
            <p className="text-[12px] text-[#64748B] mt-0.5">Entre em contato com o administrador do sistema</p>
          </div>
          <Sparkles className="h-4 w-4 text-[#4F46E5]" />
        </div>
      </div>
    </>
  );
}
