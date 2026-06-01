"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Topbar } from "@/components/layout/Topbar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckSquare, Calendar, Building2 } from "lucide-react";
import { toast } from "sonner";

const TIPOS = ["Ligação", "Email", "Reunião", "WhatsApp", "Visita", "Proposta", "Outro"];
const TIPO_ICONS: Record<string, string> = {
  Ligação: "📞", Email: "✉️", Reunião: "🗓️", WhatsApp: "💬", Visita: "🚗", Proposta: "📄", Outro: "📌",
};

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

  return (
    <>
      <Topbar
        title="Atividades"
        actions={
          <button
            onClick={() => setOpen(true)}
            className="h-9 px-4 bg-[#0057FF] text-white rounded-xl text-[13px] font-semibold hover:bg-[#0046CC] transition-colors"
          >
            + Nova atividade
          </button>
        }
      />
      <div className="px-7 pt-4 pb-7">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-[68px] w-full rounded-2xl" />)}
          </div>
        ) : (
          <div className="space-y-2">
            {(data?.items ?? []).map((a: any) => (
              <div
                key={a.id}
                className="flex items-center gap-4 px-5 py-4 bg-white rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)]"
              >
                <span className="text-xl flex-shrink-0">{TIPO_ICONS[a.tipo] ?? "📌"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#1C1C1E]">{a.tipo}</p>
                  <p className="text-[12px] text-[#8E8E93] mt-0.5 truncate">{a.descricao}</p>
                </div>
                <div className="text-[12px] text-[#8E8E93] flex-shrink-0 text-right space-y-0.5">
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
            {data?.items?.length === 0 && (
              <div className="text-center py-16">
                <div className="h-12 w-12 rounded-2xl bg-[#F2F2F7] flex items-center justify-center mx-auto mb-3">
                  <CheckSquare className="h-6 w-6 text-[#C7C7CC]" />
                </div>
                <p className="text-[13px] font-semibold text-[#1C1C1E] mb-1">Nenhuma atividade registrada</p>
                <p className="text-[12px] text-[#8E8E93] mb-4">Registre ligações, reuniões e interações</p>
                <button
                  onClick={() => setOpen(true)}
                  className="h-9 px-4 bg-[#0057FF] text-white rounded-xl text-[13px] font-semibold hover:bg-[#0046CC] transition-colors"
                >
                  Criar primeira atividade
                </button>
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
              <Label className="text-[12px] text-[#8E8E93] uppercase tracking-wider font-semibold">Tipo</Label>
              <Select value={form.tipo} onValueChange={(v) => set("tipo", v)}>
                <SelectTrigger className="h-9 rounded-xl border border-[rgba(0,0,0,0.1)] bg-[#F9F9FB] text-[13px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] text-[#8E8E93] uppercase tracking-wider font-semibold">Empresa</Label>
              <Select value={form.empresa_id} onValueChange={(v) => set("empresa_id", v)}>
                <SelectTrigger className="h-9 rounded-xl border border-[rgba(0,0,0,0.1)] bg-[#F9F9FB] text-[13px]">
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
              <Label className="text-[12px] text-[#8E8E93] uppercase tracking-wider font-semibold">Data</Label>
              <Input
                type="date"
                value={form.data}
                onChange={(e) => set("data", e.target.value)}
                className="h-9 rounded-xl border border-[rgba(0,0,0,0.1)] bg-[#F9F9FB] text-[13px]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] text-[#8E8E93] uppercase tracking-wider font-semibold">Descrição</Label>
              <Textarea
                value={form.descricao}
                onChange={(e) => set("descricao", e.target.value)}
                rows={2}
                placeholder="Detalhes da atividade…"
                className="rounded-xl border border-[rgba(0,0,0,0.1)] bg-[#F9F9FB] text-[13px]"
              />
            </div>
            <DialogFooter>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-9 px-4 bg-white border border-[rgba(0,0,0,0.1)] rounded-xl text-[13px] text-[#1C1C1E] hover:bg-[#F9F9FB] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="h-9 px-4 bg-[#0057FF] text-white rounded-xl text-[13px] font-semibold hover:bg-[#0046CC] transition-colors disabled:opacity-50"
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
