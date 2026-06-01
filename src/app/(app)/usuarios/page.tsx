"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Topbar } from "@/components/layout/Topbar";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";

const PERFIL_STYLES: Record<string, { bg: string; text: string }> = {
  super_admin: { bg: "tint-rose",     text: "text-rose-700" },
  admin:       { bg: "tint-violet",   text: "text-violet-700" },
  gerente:     { bg: "tint-blue",     text: "text-[#4F46E5]" },
  vendedor:    { bg: "tint-emerald",  text: "text-emerald-700" },
};

const GRADIENT_PAIRS: [string, string][] = [
  ["#4F46E5", "#7C3AED"],
  ["#7C3AED", "#A855F7"],
  ["#0EA5E9", "#22D3EE"],
  ["#10B981", "#34D399"],
  ["#F59E0B", "#FBBF24"],
  ["#EF4444", "#F87171"],
];

function getGradient(name: string): [string, string] {
  const idx = (name?.charCodeAt(0) ?? 0) % GRADIENT_PAIRS.length;
  return GRADIENT_PAIRS[idx];
}

export default function UsuariosPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["usuarios"],
    queryFn: () => api.get("/api/usuarios").then((r) => r.data),
  });

  const items: any[] = data?.items ?? [];

  return (
    <>
      <Topbar
        title="Usuários"
        subtitle={data ? `${items.length} usuário${items.length !== 1 ? "s" : ""} cadastrado${items.length !== 1 ? "s" : ""}` : "Equipe do CRM"}
      />
      <div className="flex-1 px-8 pt-4 pb-8 space-y-5">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-[78px] w-full rounded-2xl" />)}
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((u: any) => {
              const perfilStyle = PERFIL_STYLES[u.perfil] ?? { bg: "bg-[#F1F5F9]", text: "text-[#64748B]" };
              const [g1, g2] = getGradient(u.nome ?? u.usuario ?? "");
              return (
                <div
                  key={u.id}
                  className="surface-card flex items-center gap-4 px-5 py-4 rounded-2xl"
                >
                  <div
                    className="h-11 w-11 rounded-full flex items-center justify-center text-white text-[14px] font-bold flex-shrink-0 shadow-sm"
                    style={{ background: `linear-gradient(135deg, ${g1}, ${g2})` }}
                  >
                    {u.nome?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-[#0F172A]">{u.nome}</p>
                    <p className="text-[12px] text-[#64748B] mt-0.5">
                      {u.email} <span className="text-[#94A3B8]">·</span> @{u.usuario}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[11px] font-bold px-2 py-1 rounded-md ${perfilStyle.bg} ${perfilStyle.text}`}>
                      {u.perfil}
                    </span>
                    {!u.ativo && (
                      <span className="text-[11px] font-bold px-2 py-1 rounded-md bg-[#F1F5F9] text-[#64748B]">
                        Inativo
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            {items.length === 0 && (
              <div className="surface-card rounded-2xl py-16 text-center">
                <div className="h-16 w-16 rounded-2xl tint-blue flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-[#4F46E5]" />
                </div>
                <p className="text-[15px] font-bold text-[#0F172A]">Nenhum usuário</p>
                <p className="text-[13px] text-[#64748B] mt-1">Adicione usuários para começar</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
