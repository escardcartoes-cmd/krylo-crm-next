"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { User } from "@/types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/me")
      .then((r) => setUser(r.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(usuario: string, senha: string) {
    const form = new FormData();
    form.append("usuario", usuario);
    form.append("senha", senha);
    const r = await api.post("/api/auth/login", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setUser(r.data.user);
    return r.data;
  }

  async function logout() {
    await api.get("/logout");
    setUser(null);
    window.location.href = "/login";
  }

  return { user, loading, login, logout };
}
