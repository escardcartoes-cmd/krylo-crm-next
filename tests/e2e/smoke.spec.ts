import { test, expect } from "@playwright/test";

const USER = process.env.E2E_USER ?? "admin";
const PASS = process.env.E2E_PASS ?? "Krylo@2026";

test.describe("Krylo smoke", () => {
  test("login redirects to dashboard", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /Entrar na sua conta/i })).toBeVisible();

    await page.getByLabel("Usuário").fill(USER);
    await page.getByLabel("Senha").fill(PASS);
    await page.getByRole("button", { name: /^Entrar$/ }).click();

    await page.waitForURL("**/dashboard", { timeout: 10_000 });
    await expect(page.getByRole("heading", { name: /Bom (dia|tarde|noite)/i })).toBeVisible();
  });

  test("sidebar navigation reaches every top-level page without error", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Usuário").fill(USER);
    await page.getByLabel("Senha").fill(PASS);
    await page.getByRole("button", { name: /^Entrar$/ }).click();
    await page.waitForURL("**/dashboard");

    const routes = [
      "/empresas", "/contatos", "/oportunidades", "/pipeline",
      "/cadencias", "/fila-whatsapp", "/central-ia", "/radar",
      "/simulador", "/atividades", "/termometro", "/metas",
      "/usuarios", "/configuracoes", "/conta", "/ajuda",
    ];

    for (const r of routes) {
      const resp = await page.goto(r);
      expect(resp?.status(), `route ${r} returned non-2xx`).toBeLessThan(400);
    }
  });

  test("create empresa via UI persists and redirects to detail", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Usuário").fill(USER);
    await page.getByLabel("Senha").fill(PASS);
    await page.getByRole("button", { name: /^Entrar$/ }).click();
    await page.waitForURL("**/dashboard");

    await page.goto("/empresas/nova");
    const suffix = Date.now().toString(36);
    const nome = `E2E Corp ${suffix}`;
    await page.getByPlaceholder("Nome legal da empresa").fill(nome);
    await page.getByRole("button", { name: /Criar empresa/i }).click();

    await page.waitForURL(/\/empresas\/\d+$/, { timeout: 10_000 });
    // Detail page renders the name in the topbar (title) and the header card.
    await expect(page.locator(`text=${nome}`).first()).toBeVisible({ timeout: 10_000 });
  });
});
