import { Topbar } from "@/components/layout/Topbar";

const SECTIONS = [
  {
    title: "Documentação",
    items: [
      "Como importar leads via planilha",
      "Configurar cadências",
      "Usar o Pipeline Kanban",
      "Integração com WhatsApp",
      "Configurar metas de vendas",
    ],
  },
  {
    title: "Primeiros passos",
    items: [
      "Cadastre sua empresa em Empresas → Nova empresa",
      "Adicione contatos vinculados à empresa",
      "Crie uma oportunidade em Oportunidades → Nova",
      "Acompanhe no Pipeline Kanban",
      "Configure cadências para prospecção",
    ],
  },
];

export default function AjudaPage() {
  return (
    <>
      <Topbar title="Ajuda" subtitle="Guias e recursos" />
      <div className="flex-1 px-8 pt-4 pb-8 space-y-4 max-w-4xl">

        {SECTIONS.map((s) => (
          <div key={s.title} className="surface-card rounded-xl p-5">
            <h3 className="text-[13px] font-semibold text-[#0F172A] pb-3 border-b border-[#F1F5F9] mb-4">{s.title}</h3>
            <ul className="space-y-2">
              {s.items.map((item, i) => (
                <li key={i} className="text-[13px] text-[#334155]">· {item}</li>
              ))}
            </ul>
          </div>
        ))}

        <div className="surface-card rounded-xl p-5">
          <h3 className="text-[13px] font-semibold text-[#0F172A] pb-3 border-b border-[#F1F5F9] mb-4">Suporte</h3>
          <p className="text-[13px] text-[#334155]">Entre em contato com o administrador do sistema.</p>
        </div>
      </div>
    </>
  );
}
