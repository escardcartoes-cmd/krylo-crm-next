export interface User {
  id: number;
  nome: string;
  email: string;
  usuario: string;
  perfil: "admin" | "gerente" | "vendedor" | "super_admin";
  tenant_id: number;
  ativo: boolean;
}

export interface Tenant {
  id: number;
  slug: string;
  nome_empresa: string;
  nome_plataforma: string;
  cor_primaria: string;
  cor_secundaria: string;
  plano: string;
  ativo: boolean;
}

export interface DashboardStats {
  prospects_sdr: number;
  em_cadencia: number;
  pipeline_total: number;
  fechados_mes: number;
  receita_mes: number;
  meta_valor: number;
  faturado_90d: number;
  meta_nome: string;
  mes_atual: string;
}
