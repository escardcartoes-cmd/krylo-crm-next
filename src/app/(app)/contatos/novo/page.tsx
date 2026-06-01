import { Suspense } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { ContatoForm } from "@/components/forms/ContatoForm";

export default function NovoContatoPage() {
  return (
    <>
      <Topbar title="Novo Contato" />
      <div className="flex-1 p-6">
        <Suspense fallback={null}>
          <ContatoForm />
        </Suspense>
      </div>
    </>
  );
}
