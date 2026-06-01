"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Topbar } from "@/components/layout/Topbar";
import { EmpresaForm } from "@/components/forms/EmpresaForm";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditarEmpresaPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ["empresa", id],
    queryFn: () => api.get(`/api/empresas/${id}`).then((r) => r.data),
  });

  return (
    <>
      <Topbar title="Editar Empresa" />
      <div className="flex-1 p-6">
        {isLoading ? <Skeleton className="h-96 max-w-2xl" /> : (
          <EmpresaForm initial={data} empresaId={Number(id)} />
        )}
      </div>
    </>
  );
}
