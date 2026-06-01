import { Topbar } from "@/components/layout/Topbar";
import { EmpresaForm } from "@/components/forms/EmpresaForm";

export default function NovaEmpresaPage() {
  return (
    <>
      <Topbar title="Nova Empresa" />
      <div className="flex-1 p-6"><EmpresaForm /></div>
    </>
  );
}
