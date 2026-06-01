"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Topbar } from "@/components/layout/Topbar";
import { ContatoForm } from "@/components/forms/ContatoForm";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditarContatoPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ["contato", id],
    queryFn: () => api.get(`/api/contatos/${id}`).then((r) => r.data),
  });

  return (
    <>
      <Topbar title="Editar Contato" />
      <div className="px-7 pt-4 pb-7">
        {isLoading ? (
          <Skeleton className="h-80 max-w-lg rounded-2xl" />
        ) : (
          <ContatoForm initial={data} contatoId={Number(id)} />
        )}
      </div>
    </>
  );
}
