"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Topbar } from "@/components/layout/Topbar";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";

const PERFIL_STYLES: Record<string, { bg: string; text: string }> = {
  super_admin: { bg: "bg-[#FFEBEB]", text: "text-[#CC0000]" },
  admin:       { bg: "bg-[#F2EBFF]", text: "text-[#6B21CC]" },
  gerente:     { bg: "bg-[#EBF0FF]", text: "text-[#0057FF]" },
  vendedor:    { bg: "bg-[#EDFAF3]", text: "text-[#1A7F4B]" },
};

export default function UsuariosPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["usuarios"],
    queryFn: () => api.get("/api/usuarios").then((r) => r.data),
  });

  return (
    <>
      <Topbar title="Usuários" />
      <div className="px-7 pt-4 pb-7">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-[68px] w-full rounded-2xl" />)}
          </div>
        ) : (
          <div className="space-y-2">
            {(data?.items ?? []).map((u: any) => {
              const perfilStyle = PERFIL_STYLES[u.perfil] ?? { bg: "bg-[#F2F2F7]", text: "text-[#8E8E93]" };
              return (
                <div
                  key={u.id}
                  className="flex items-center gap-4 px-5 py-4 bg-white rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)]"
                >
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#0057FF] to-[#6B8EFF] flex items-center justify-center text-white text-[13px] font-semibold flex-shrink-0">
                    {u.nome?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#1C1C1E]">{u.nome}</p>
                    <p className="text-[12px] text-[#8E8E93] mt-0.5">
                      {u.email} · @{u.usuario}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-lg ${perfilStyle.bg} ${perfilStyle.text}`}>
                      {u.perfil}
                    </span>
                    {!u.ativo && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-lg bg-[#F2F2F7] text-[#8E8E93]">
                        Inativo
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            {data?.items?.length === 0 && (
              <div className="text-center py-16">
                <div className="h-12 w-12 rounded-2xl bg-[#F2F2F7] flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-[#C7C7CC]" />
                </div>
                <p className="text-[13px] font-semibold text-[#1C1C1E] mb-1">Nenhum usuário</p>
                <p className="text-[12px] text-[#8E8E93]">Adicione usuários para começar</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
