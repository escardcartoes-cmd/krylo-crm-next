"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Topbar } from "@/components/layout/Topbar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Phone, Mail, Calendar, MessageCircle, Car, FileText, Pin } from "lucide-react";
import { toast } from "sonner";

const TIPOS = ["Ligação", "Email", "Reunião", "WhatsApp", "Visita", "Proposta", "Outro"];

const TIPO_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Ligação: Phone,
  Email: Mail,
  Reunião: Calendar,
  WhatsApp: MessageCircle,
  Visita: Car,
  Proposta: FileText,
  Outro: Pin,
};

const inputCls = "w-full h-9 px-3 rounded-lg border border-[#CBD5E1] bg-white text-[13px] text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15 transition-colors";

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
      toast.success("Atividade criada");
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
        actions={
          <button onClick={() => setOpen(true)}
            className="h-8 px-3.5 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[13px] font-medium transition-colors">
            Nova atividade
          </button>
        }
      />
      <div className="flex-1 px-8 pt-4 pb-8 space-y-4">
        {isLoading ? (
          <div className="surface-card rounded-xl divide-y divide-[#F1F5F9]">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-[60px]" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="surface-card rounded-xl py-16 text-center">
            <p className="text-[14px] text-[#475569]">Nenhuma atividade registrada.</p>
          </div>
        ) : (
          <div className="surface-card rounded-xl overflow-hidden">
            <ul className="divide-y divide-[#F1F5F9]">
              {items.map((a) => {
                const Icon = TIPO_ICONS[a.tipo] ?? Pin;
                return (
                  <li key={a.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#F8FAFC]">
                    <Icon className="h-4 w-4 text-[#64748B] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[14px] font-medium text-[#0F172A]">{a.tipo}</p>
                        {a.empresa_nome && (
                          <span className="text-[12px] text-[#64748B]">· {a.empresa_nome}</span>
                        )}
                      </div>
                      {a.descricao && (
                        <p className="text-[12px] text-[#64748B] mt-0.5 truncate">{a.descricao}</p>
                      )}
                    </div>
                    {a.data && (
                      <span className="text-[12px] text-[#64748B] tabular-nums flex-shrink-0">{a.data}</span>
                    )}
                  </li>
                );
              })}
            </ul>
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
              <Label className="text-[12px] font-medium text-[#334155]">Tipo</Label>
              <Select value={form.tipo} onValueChange={(v) => set("tipo", v)}>
                <SelectTrigger className="h-9 rounded-lg border-[#CBD5E1] bg-white text-[13px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] font-medium text-[#334155]">Empresa</Label>
              <Select value={form.empresa_id} onValueChange={(v) => set("empresa_id", v)}>
                <SelectTrigger className="h-9 rounded-lg border-[#CBD5E1] bg-white text-[13px]">
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
              <Label className="text-[12px] font-medium text-[#334155]">Data</Label>
              <input type="date" value={form.data} onChange={(e) => set("data", e.target.value)} className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] font-medium text-[#334155]">Descrição</Label>
              <textarea
                value={form.descricao} onChange={(e) => set("descricao", e.target.value)} rows={3}
                placeholder="Detalhes da atividade…"
                className={`${inputCls} h-auto py-2 resize-none`}
              />
            </div>
            <DialogFooter>
              <button type="button" onClick={() => setOpen(false)}
                className="h-9 px-4 rounded-lg text-[13px] text-[#475569] hover:bg-[#F1F5F9] transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={createMutation.isPending}
                className="h-9 px-4 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[13px] font-medium transition-colors disabled:opacity-60">
                {createMutation.isPending ? "Salvando…" : "Salvar"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
