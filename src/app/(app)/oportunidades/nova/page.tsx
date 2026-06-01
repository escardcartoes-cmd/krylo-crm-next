import { Suspense } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { OportunidadeForm } from "@/components/forms/OportunidadeForm";

export default function NovaOportunidadePage() {
  return (
    <>
      <Topbar title="Nova Oportunidade" />
      <div className="flex-1 p-6">
        <Suspense fallback={null}>
          <OportunidadeForm />
        </Suspense>
      </div>
    </>
  );
}
