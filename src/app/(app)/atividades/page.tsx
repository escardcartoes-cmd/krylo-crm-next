"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Topbar } from "@/components/layout/Topbar";
import { ButtonLink } from "@/components/ui/button-link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckSquare, Calendar, Building2 } from "lucide-react";
import { toast } from "sonner";

const TIPOS = ["Ligação", "Email", "Reunião", "WhatsApp", "Visita", "Proposta", "Outro"];
const TIPO_ICONS: Record<string, string> = {
  Ligação: "📞", Email: "✉️", Reunião: "🗓️", WhatsApp: "💬", Visita: "🚗", Proposta: "📄", Outro: "📌",
};

const inputCls = "w-full h-10 pl-3.5 pr-3.5 rounded-xl bg-white border border-[rgba(15,23,42,0.08)] text-[13px] text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 transition-all shadow-sm";

export default function AtividadesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ tipo: "Ligação", descricao: "", data: "", empresa_id: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["atividades"],
    queryFn: () => api.get("/api/atividades").then((r) => r.data),
  });

  const { data: empresasData } = useQuery({
    queryKey: ["empresas", ""],
    queryFn: () => api.get("/api/empresas", { params: { per_page: 200 } }).then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: () => api.post("/api/atividades", { ...form, empresa_id: form.empresa_id || null }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["atividades"] });
      toast.success("Atividade criada!");
      setOpen(false);
      setForm({ tipo: "Ligação", descricao: "", data: "", empresa_id: "" });
    },
    onError: (err: any) => toast.error(err.response?.data?.error ?? "Erro ao criar"),
  });

  function set(key: string, v: string | null) { setForm(p => ({ ...p, [key]: v ?? "" })); }

  const items: any[] = data?.items ?? [];

  return (
    <>
      <Topbar
        title="Atividades"
        subtitle={data ? `${items.length} atividade${items.length !== 1 ? "s" : ""} registrada${items.length !== 1 ? "s" : ""}` : "Histórico de interações"}
        actions={
          <button
            onClick={() => setOpen(true)}
            className="h-8 px-3.5 rounded-xl text-white text-[12px] font-semibold transition-all active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg,#4F46E5,#6366F1)",
              boxShadow: "0 4px 12px rgba(79,70,229,0.3)",
            }}
          >
            + Nova atividade
          </button>
        }
      />
      <div className="flex-1 px-8 pt-4 pb-8 space-y-5">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-[72px] w-full rounded-2xl" />)}
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((a: any) => (
              <div
                key={a.id}
                className="surface-card flex items-center gap-4 px-5 py-4 rounded-2xl"
              >
                <div className="h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 tint-blue text-xl">
                  {TIPO_ICONS[a.tipo] ?? "📌"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-[#0F172A]">{a.tipo}</p>
                  <p className="text-[12px] text-[#64748B] mt-0.5 truncate">{a.descricao}</p>
                </div>
                <div className="text-[12px] text-[#64748B] flex-shrink-0 text-right space-y-0.5">
                  {a.empresa_nome && (
                    <p className="flex items-center gap-1 justify-end">
                      <Building2 className="h-3 w-3" />
                      {a.empresa_nome}
                    </p>
                  )}
                  {a.data && (
                    <p className="flex items-center gap-1 justify-end">
                      <Calendar className="h-3 w-3" />
                      {a.data}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <div className="surface-card rounded-2xl py-16 text-center">
                <div className="h-16 w-16 rounded-2xl tint-blue flex items-center justify-center mx-auto mb-4">
                  <CheckSquare className="h-8 w-8 text-[#4F46E5]" />
                </div>
                <p className="text-[15px] font-bold text-[#0F172A]">Nenhuma atividade registrada</p>
                <p className="text-[13px] text-[#64748B] mt-1 mb-5">Registre ligações, reuniões e interações</p>
                <ButtonLink href="#" size="sm">+ Criar primeira atividade</ButtonLink>
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova atividade</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[11px] text-[#64748B] uppercase tracking-wider font-bold">Tipo</Label>
              <Select value={form.tipo} onValueChange={(v) => set("tipo", v)}>
                <SelectTrigger className="h-10 rounded-xl border border-[rgba(15,23,42,0.08)] bg-white text-[13px] shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] text-[#64748B] uppercase tracking-wider font-bold">Empresa</Label>
              <Select value={form.empresa_id} onValueChange={(v) => set("empresa_id", v)}>
                <SelectTrigger className="h-10 rounded-xl border border-[rgba(15,23,42,0.08)] bg-white text-[13px] shadow-sm">
                  <SelectValue placeholder="Selecionar" />
                </SelectTrigger>
                <SelectContent>
                  {empresasData?.items?.map((e: any) => (
                    <SelectItem key={e.id} value={String(e.id)}>{e.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] text-[#64748B] uppercase tracking-wider font-bold">Data</Label>
              <input
                type="date"
                value={form.data}
                onChange={(e) => set("data", e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] text-[#64748B] uppercase tracking-wider font-bold">Descrição</Label>
              <textarea
                value={form.descricao}
                onChange={(e) => set("descricao", e.target.value)}
                rows={3}
                placeholder="Detalhes da atividade…"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[rgba(15,23,42,0.08)] text-[13px] text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 transition-all shadow-sm resize-none"
              />
            </div>
            <DialogFooter>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-10 px-4 rounded-xl text-[13px] font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="h-10 px-5 rounded-xl text-white text-[13px] font-semibold transition-all active:scale-[0.98] disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg,#4F46E5,#6366F1)",
                  boxShadow: "0 4px 12px rgba(79,70,229,0.3)",
                }}
              >
                {createMutation.isPending ? "Salvando…" : "Salvar"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
