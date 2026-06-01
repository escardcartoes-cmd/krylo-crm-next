"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Topbar } from "@/components/layout/Topbar";
import { OportunidadeForm } from "@/components/forms/OportunidadeForm";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditarOportunidadePage() {
  const { id } = useParams<{ id: string }>();
  const { data: ops, isLoading } = useQuery({
    queryKey: ["oportunidades", ""],
    queryFn: () => api.get("/api/oportunidades", { params: { per_page: 200 } }).then((r) => r.data),
  });
  const op = ops?.items?.find((o: any) => String(o.id) === id);

  return (
    <>
      <Topbar title="Editar Oportunidade" />
      <div className="flex-1 p-6">
        {isLoading ? <Skeleton className="h-96 max-w-2xl" /> : (
          <OportunidadeForm initial={op} opId={Number(id)} />
        )}
      </div>
    </>
  );
}
