# Krylo CRM — Frontend

Next.js 16 App Router UI for the [Krylo Flask backend](https://github.com/escardcartoes-cmd/escard-crm).

Production: <https://krylo-crm.vercel.app> (Vercel) · Backend: `https://web-production-7599a.up.railway.app`

## Stack

- Next.js 16 (App Router, Turbopack)
- React 19 · TypeScript
- Tailwind 4 · shadcn/ui · Base UI · lucide-react
- @tanstack/react-query · axios · sonner (toasts)
- react-markdown (Central IA chat rendering)
- Playwright (e2e)

## Quick start (local)

Requires the Flask backend running on `:5001` (or set `FLASK_URL`).

```bash
npm install
cp .env.example .env.local   # optional overrides
npm run dev -- --port 3001
```

Open <http://localhost:3001>. Default admin login (dev seed): `admin` / `Krylo@2026`.

## Environment

| Var | Purpose | Default |
|---|---|---|
| `FLASK_URL` | Upstream Flask base URL for the `/api/*` proxy | `http://localhost:5001` |

`next.config.ts` rewrites every `/api/*` request to `FLASK_URL/api/*` so cookies stay same-origin.

## Tests

```bash
npm run test:e2e           # headless
npm run test:e2e:ui        # inspector
```

Playwright spec covers login → dashboard, sidebar navigation across 16 routes, and creating an empresa end-to-end.

Requires both backend + frontend to be running. Override with `PLAYWRIGHT_BASE_URL`, `E2E_USER`, `E2E_PASS`.

## Deploy

Vercel auto-deploys on push to `main`. CI (`.github/workflows/ci.yml`) runs lint, type-check, build, npm audit, trufflehog secret scan, and Playwright e2e (boots the sibling Flask backend for the run). Deploy workflow (`.github/workflows/deploy.yml`) is gated on CI success.

Manual deploy: `vercel deploy --prod` (needs `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` in the repo secrets).

## Layout

```
src/
  app/
    login/                 public login page (split layout, navy left / form right)
    (app)/                 authenticated shell — every page shares Sidebar + Topbar
      dashboard/           overview metrics
      empresas/            CRUD + detail
      contatos/            CRUD
      oportunidades/       CRUD + kanban
      pipeline/            kanban view
      cadencias/           cadence dispatch queue
      fila-whatsapp/       WhatsApp approval queue
      leads/importar/      CSV/XLSX import wizard
      central-ia/          Claude chat
      sdr-evolutivo/       SDR automation dashboard
      radar/               market radar
      simulador/           revenue simulator
      atividades/          activity log
      termometro/          client health metric
      metas/               goals config
      usuarios/            user CRUD
      configuracoes/       tenant branding
      conta/               profile + password change
      ajuda/               help
  components/
    brand/Logo.tsx         SVG mark + wordmark
    layout/
      Sidebar.tsx          floating navy sidebar
      Topbar.tsx           page header + actions
    forms/                 EmpresaForm, ContatoForm, OportunidadeForm
    ui/                    shadcn primitives (Dialog, Select, Tabs, Skeleton, Label)
    dashboard/             metric cards
  contexts/AuthContext.tsx
  hooks/                   useEmpresas, useOportunidades, etc.
  lib/api.ts               axios instance (same-origin, credentials: include)
```

## Design system

- Login + sidebar: navy `#0B0F1A` with soft indigo glow, grid overlay
- App chrome: `#F7F8FA` background, white surface cards (`.surface-card`)
- Primary CTA: `#4F46E5` (indigo). Danger: `#DC2626`. Success: `#059669`
- Tint utilities: `.tint-blue`, `.tint-violet`, `.tint-emerald`, `.tint-amber`, `.tint-rose`, `.tint-sky`
- Typography: Geist Sans + Geist Mono via Vercel font hosting
- Rule: no gradients on chrome, no glass morphism, no emoji as UI decoration

## License

Proprietary — Escard Cartões.
