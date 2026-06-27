"use client";

import { useState, useRef } from "react";
import { api } from "@/lib/api";
import { Topbar } from "@/components/layout/Topbar";
import { ButtonLink } from "@/components/ui/button-link";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

const CAMPOS = [
  { key: "nome",     label: "Nome do contato" },
  { key: "empresa",  label: "Razão social"    },
  { key: "cargo",    label: "Cargo"           },
  { key: "telefone", label: "Telefone"        },
  { key: "email",    label: "E-mail"          },
  { key: "cidade",   label: "Cidade"          },
];

const inputCls = "w-full h-9 px-3 rounded-lg border border-[#CBD5E1] bg-white text-[13px] text-[#0F172A] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15 transition-colors";

export default function ImportarLeadsPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any>(null);
  const [mapeamento, setMapeamento] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function handleUpload(f: File) {
    setFile(f);
    setLoading(true);
    setPreview(null);
    setResult(null);

    const form = new FormData();
    form.append("arquivo", f);
    try {
      const r = await api.post("/api/leads/importar/preview", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPreview(r.data);
      setMapeamento(r.data.mapeamento_sugerido ?? {});
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? "Erro ao ler arquivo");
      setFile(null);
    } finally {
      setLoading(false);
    }
  }

  async function confirmar() {
    if (!file) return;
    setLoading(true);
    const form = new FormData();
    form.append("arquivo", file);
    Object.entries(mapeamento).forEach(([campo, coluna]) => {
      form.append(`map_${campo}`, coluna);
    });
    try {
      const r = await api.post("/api/leads/importar/confirmar", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(r.data);
      toast.success(r.data.mensagem);
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? "Erro na importação");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setFile(null);
    setPreview(null);
    setMapeamento({});
    setResult(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <>
      <Topbar
        title="Importar leads"
        subtitle="CSV ou Excel"
        actions={<ButtonLink href="/contatos" variant="outline" size="sm">Ver contatos</ButtonLink>}
      />

      <div className="flex-1 px-8 pt-4 pb-8">
        {result && (
          <div className="surface-card rounded-xl p-8 text-center max-w-2xl">
            <h2 className="text-[18px] font-semibold text-[#0F172A]">Importação concluída</h2>
            <p className="text-[13px] text-[#64748B] mt-1">{result.mensagem}</p>
            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto mt-6">
              <div className="border border-[#E2E8F0] rounded-lg p-4">
                <p className="text-[26px] font-semibold text-emerald-700 tabular-nums">{result.importados}</p>
                <p className="text-[12px] font-medium text-[#64748B] mt-0.5">Importados</p>
              </div>
              <div className="border border-[#E2E8F0] rounded-lg p-4">
                <p className="text-[26px] font-semibold text-[#0F172A] tabular-nums">{result.ignorados ?? 0}</p>
                <p className="text-[12px] font-medium text-[#64748B] mt-0.5">Ignorados</p>
              </div>
            </div>
            <div className="flex gap-2 justify-center mt-6">
              <button onClick={reset}
                className="h-9 px-4 rounded-lg bg-white border border-[#CBD5E1] text-[13px] font-medium text-[#475569] hover:bg-[#F8FAFC] transition-colors">
                Importar mais
              </button>
              <ButtonLink href="/contatos" size="sm">Ver contatos</ButtonLink>
            </div>
          </div>
        )}

        {!file && !result && (
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4">
            <div className="surface-card rounded-xl p-6">
              <div
                className="border-2 border-dashed border-[#CBD5E1] rounded-xl py-16 text-center cursor-pointer hover:border-[#4F46E5] hover:bg-[#F8FAFC] transition-colors"
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-[#4F46E5]","bg-[#F8FAFC]"); }}
                onDragLeave={(e) => e.currentTarget.classList.remove("border-[#4F46E5]","bg-[#F8FAFC]")}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove("border-[#4F46E5]","bg-[#F8FAFC]");
                  const f = e.dataTransfer.files?.[0];
                  if (f) handleUpload(f);
                }}
              >
                <Upload className="h-7 w-7 text-[#94A3B8] mx-auto mb-3" />
                <p className="text-[14px] font-medium text-[#0F172A]">Arraste o arquivo aqui</p>
                <p className="text-[13px] text-[#64748B] mt-1">ou clique para escolher</p>
                <p className="text-[12px] text-[#94A3B8] mt-3">CSV, XLSX ou XLS · até 10MB</p>
                <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden"
                  onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="surface-card rounded-xl p-5">
                <h3 className="text-[13px] font-semibold text-[#0F172A] pb-3 border-b border-[#F1F5F9] mb-4">Formato esperado</h3>
                <p className="text-[13px] text-[#334155] mb-3">Colunas suportadas:</p>
                <ul className="space-y-1.5 text-[13px] text-[#475569]">
                  {CAMPOS.map(c => <li key={c.key}>· {c.label}</li>)}
                </ul>
              </div>
              <div className="surface-card rounded-xl p-5">
                <h3 className="text-[13px] font-semibold text-[#0F172A] pb-3 border-b border-[#F1F5F9] mb-4">Observações</h3>
                <ul className="space-y-2 text-[13px] text-[#475569]">
                  <li>· Linhas sem nome ou empresa são ignoradas</li>
                  <li>· Empresas duplicadas não são recriadas</li>
                  <li>· Você ajusta o mapeamento na próxima etapa</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {file && preview && !result && (
          <div className="surface-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[14px] font-medium text-[#0F172A]">{file.name}</p>
                <p className="text-[12px] text-[#64748B] mt-0.5 tabular-nums">{preview.colunas?.length ?? 0} colunas · {preview.preview?.length ?? 0} linhas no preview</p>
              </div>
              <button onClick={reset}
                className="h-9 px-4 rounded-lg text-[13px] font-medium text-[#475569] hover:bg-[#F1F5F9] transition-colors">
                Trocar arquivo
              </button>
            </div>

            <h3 className="text-[13px] font-semibold text-[#0F172A] pb-3 border-b border-[#F1F5F9] mb-4">Mapeamento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {CAMPOS.map(campo => (
                <div key={campo.key}>
                  <label className="text-[12px] font-medium text-[#334155] mb-1.5 block">{campo.label}</label>
                  <select
                    value={mapeamento[campo.key] || ""}
                    onChange={e => setMapeamento(prev => ({ ...prev, [campo.key]: e.target.value }))}
                    className={inputCls}
                  >
                    <option value="">— Não mapear —</option>
                    {preview.colunas?.map((col: string) => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <h3 className="text-[13px] font-semibold text-[#0F172A] pb-3 border-b border-[#F1F5F9] mb-4">Preview</h3>
            <div className="overflow-x-auto rounded-lg border border-[#E2E8F0]">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="bg-[#F8FAFC]">
                    {preview.colunas?.map((col: string) => (
                      <th key={col} className="px-3 py-2 text-left font-medium text-[#475569] whitespace-nowrap border-b border-[#E2E8F0]">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.preview?.map((row: any, i: number) => (
                    <tr key={i} className="border-b border-[#F1F5F9] last:border-0">
                      {preview.colunas?.map((col: string) => (
                        <td key={col} className="px-3 py-2 text-[#334155] whitespace-nowrap">{row[col] ?? "—"}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={confirmar} disabled={loading}
                className="h-9 px-4 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[13px] font-medium flex items-center gap-2 disabled:opacity-60 transition-colors">
                {loading ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Importando…</> : "Confirmar importação"}
              </button>
              <button onClick={reset}
                className="h-9 px-4 rounded-lg text-[13px] font-medium text-[#475569] hover:bg-[#F1F5F9] transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        )}

        {loading && !preview && !file && (
          <div className="surface-card rounded-xl py-16 text-center">
            <Loader2 className="h-7 w-7 text-[#4F46E5] animate-spin mx-auto mb-3" />
            <p className="text-[14px] text-[#334155]">Processando arquivo…</p>
          </div>
        )}
      </div>
    </>
  );
}
