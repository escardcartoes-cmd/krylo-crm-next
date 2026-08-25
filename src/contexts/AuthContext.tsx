"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "@/lib/api";

interface User {
  id: number;
  nome: string;
  email: string;
  usuario: string;
  perfil: string;
  tenant_id: number;
}

interface LoginResult {
  ok: boolean;
  needs_2fa?: boolean;
  canal?: "email" | "whatsapp";
  destino_mascarado?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (usuario: string, senha: string) => Promise<LoginResult>;
  verify2fa: (codigo: string) => Promise<void>;
  resend2fa: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/me")
      .then((r) => setUser(r.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(usuario: string, senha: string): Promise<LoginResult> {
    const r = await api.post("/api/auth/login", { usuario, senha });
    if (r.data?.needs_2fa) {
      return { ok: false, needs_2fa: true, canal: r.data.canal, destino_mascarado: r.data.destino_mascarado };
    }
    setUser(r.data.user);
    return { ok: true };
  }

  async function verify2fa(codigo: string) {
    const r = await api.post("/api/auth/2fa/verify", { codigo });
    setUser(r.data.user);
  }

  async function resend2fa() {
    await api.post("/api/auth/2fa/reenviar");
  }

  async function logout() {
    await api.get("/api/auth/logout").catch(() => {});
    setUser(null);
    window.location.href = "/login";
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, verify2fa, resend2fa, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
