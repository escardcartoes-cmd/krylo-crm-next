"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Topbar } from "@/components/layout/Topbar";
import { ButtonLink } from "@/components/ui/button-link";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

const CAMPOS = [
  { key: "nome",     label: "Nome do contato" },
  { key: "empresa",  label: "Razão social"    },
  { key: "cargo",    label: "Cargo"           },
  { key: "telefone", label: "Telefone"        },
  { key: "email",    label: "E-mail"          },
  { key: "cidade",   label: "Cidade"          },
];

export default function ImportarLeadsPage() {
  const router = useRouter();
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
        title="Importar Leads"
        subtitle="Importe contatos e empresas em massa via CSV ou Excel"
        actions={
          <ButtonLink href="/contatos" variant="outline" size="sm">Ver contatos</ButtonLink>
        }
      />

      <div className="flex-1 px-8 pt-4 pb-8">
        {/* Result screen */}
        {result && (
          <div className="surface-card rounded-2xl p-8 text-center">
            <div className="h-16 w-16 rounded-2xl tint-emerald flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-[20px] font-bold text-[#0F172A]">Importação concluída!</h2>
            <p className="text-[14px] text-[#64748B] mt-2">{result.mensagem}</p>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mt-6">
              <div className="tint-emerald rounded-xl p-4">
                <p className="text-[28px] font-extrabold text-emerald-700">{result.importados}</p>
                <p className="text-[11px] font-bold text-emerald-700/70 uppercase tracking-wider">Importados</p>
              </div>
              <div className="bg-slate-100 rounded-xl p-4">
                <p className="text-[28px] font-extrabold text-slate-700">{result.ignorados ?? 0}</p>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ignorados</p>
              </div>
            </div>
            <div className="flex gap-3 justify-center mt-6">
              <button onClick={reset}
                className="h-10 px-5 rounded-xl bg-white border border-[rgba(15,23,42,0.1)] text-[13px] font-semibold text-[#334155] hover:bg-[#F8FAFC]">
                Importar mais
              </button>
              <ButtonLink href="/contatos" size="sm">Ver contatos importados →</ButtonLink>
            </div>
          </div>
        )}

        {/* Upload screen */}
        {!file && !result && (
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
            <div className="surface-card rounded-2xl p-8">
              <div
                className="border-2 border-dashed border-[rgba(79,70,229,0.2)] rounded-2xl py-16 text-center cursor-pointer hover:border-[#4F46E5] hover:bg-[rgba(79,70,229,0.02)] transition-all"
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-[#4F46E5]","bg-[rgba(79,70,229,0.04)]"); }}
                onDragLeave={(e) => e.currentTarget.classList.remove("border-[#4F46E5]","bg-[rgba(79,70,229,0.04)]")}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove("border-[#4F46E5]","bg-[rgba(79,70,229,0.04)]");
                  const f = e.dataTransfer.files?.[0];
                  if (f) handleUpload(f);
                }}
              >
                <div className="h-20 w-20 rounded-2xl tint-blue flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-10 w-10 text-[#4F46E5]" />
                </div>
                <p className="text-[16px] font-bold text-[#0F172A]">Arraste seu arquivo aqui</p>
                <p className="text-[13px] text-[#64748B] mt-1">ou clique para escolher</p>
                <p className="text-[11px] text-[#94A3B8] mt-4">CSV, XLSX ou XLS · até 10MB</p>
                <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden"
                  onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
              </div>
            </div>

            {/* Right tips */}
            <div className="space-y-4">
              <div className="surface-card rounded-2xl p-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <FileSpreadsheet className="h-4 w-4 text-[#4F46E5]" />
                  <p className="text-[12px] font-bold uppercase tracking-wider text-[#0F172A]">Formato esperado</p>
                </div>
                <p className="text-[12px] text-[#475569] mb-3">Seu arquivo deve ter uma linha por contato com colunas:</p>
                <ul className="space-y-1.5 text-[12px]">
                  {CAMPOS.map(c => (
                    <li key={c.key} className="flex items-center gap-2 text-[#475569]">
                      <span className="h-1 w-1 rounded-full bg-[#4F46E5]" />{c.label}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="surface-card rounded-2xl p-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <p className="text-[12px] font-bold uppercase tracking-wider text-[#0F172A]">Observações</p>
                </div>
                <ul className="space-y-2 text-[12px] text-[#475569]">
                  <li>· Linhas sem nome ou empresa serão ignoradas</li>
                  <li>· Empresas duplicadas (mesmo nome) não serão recriadas</li>
                  <li>· Você poderá ajustar o mapeamento de colunas na próxima etapa</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Mapping screen */}
        {file && preview && !result && (
          <div className="space-y-4">
            <div className="surface-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl tint-blue flex items-center justify-center">
                    <FileSpreadsheet className="h-5 w-5 text-[#4F46E5]" />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-[#0F172A]">{file.name}</p>
                    <p className="text-[12px] text-[#64748B]">{preview.colunas?.length ?? 0} colunas · {preview.preview?.length ?? 0} linhas no preview</p>
                  </div>
                </div>
                <button onClick={reset}
                  className="h-9 px-4 rounded-xl text-[12px] font-semibold text-[#64748B] hover:bg-[#F8FAFC]">
                  Trocar arquivo
                </button>
              </div>

              <p className="text-[12px] font-bold uppercase tracking-wider text-[#475569] mb-3">Mapeamento de colunas</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {CAMPOS.map(campo => (
                  <div key={campo.key}>
                    <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5 block">{campo.label}</label>
                    <select
                      value={mapeamento[campo.key] || ""}
                      onChange={e => setMapeamento(prev => ({ ...prev, [campo.key]: e.target.value }))}
                      className="w-full h-10 px-3.5 rounded-xl bg-white border border-[rgba(15,23,42,0.08)] text-[13px] text-[#0F172A] outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 shadow-sm"
                    >
                      <option value="">— Não mapear —</option>
                      {preview.colunas?.map((col: string) => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <p className="text-[12px] font-bold uppercase tracking-wider text-[#475569] mb-3">Preview (10 primeiras linhas)</p>
              <div className="overflow-x-auto rounded-xl border border-[rgba(15,23,42,0.06)]">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="bg-[#F8FAFC]">
                      {preview.colunas?.map((col: string) => (
                        <th key={col} className="px-3 py-2 text-left font-bold text-[#475569] whitespace-nowrap border-b border-[rgba(15,23,42,0.06)]">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.preview?.map((row: any, i: number) => (
                      <tr key={i} className="border-b border-[rgba(15,23,42,0.04)] last:border-0">
                        {preview.colunas?.map((col: string) => (
                          <td key={col} className="px-3 py-2 text-[#334155] whitespace-nowrap">{row[col] ?? "—"}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={confirmar} disabled={loading}
                  className="h-10 px-5 rounded-xl text-white text-[13px] font-bold flex items-center gap-2 disabled:opacity-60 active:scale-[0.98] transition-all"
                  style={{ background: "linear-gradient(135deg,#4F46E5,#6366F1)", boxShadow: "0 4px 12px rgba(79,70,229,0.3)" }}>
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Importando…</> : "Confirmar importação"}
                </button>
                <button onClick={reset}
                  className="h-10 px-4 rounded-xl text-[13px] font-medium text-[#64748B] hover:bg-[#F8FAFC]">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {loading && !preview && (
          <div className="surface-card rounded-2xl py-16 text-center">
            <Loader2 className="h-10 w-10 text-[#4F46E5] animate-spin mx-auto mb-3" />
            <p className="text-[14px] font-semibold text-[#0F172A]">Processando arquivo…</p>
          </div>
        )}
      </div>
    </>
  );
}
