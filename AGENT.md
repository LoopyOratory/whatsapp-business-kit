# WhatsApp Business Kit — Agent Context

## Project Overview

A SaaS platform for Ghanaian SMEs to run operations through WhatsApp. Manage catalog, orders, customers, broadcasts, payments. Built for the 70%+ of Ghanaian SMEs that use WhatsApp as their primary business channel.

**Repo:** `git@github.com:LoopyOratory/whatsapp-business-kit.git`
**Live:** Not deployed yet

---

## Stack

| Layer | Choice |
|-------|--------|
| Backend | **ElysiaJS** (Bun) |
| Database | **PostgreSQL / Neon** (via Drizzle ORM + WebSocket Pool) |
| Auth | **Better Auth** (email/password, email verification, password reset) |
| ORM | **Drizzle ORM** (pg-core + neon-serverless) |
| Validation | TypeBox (routes), Zod (env startup) |
| WhatsApp | **WAHA** (WhatsApp API — send/receive/connect/disconnect) |
| Payments | **Paystack** (GH₵ primary) |
| Frontend | **TanStack Start** (React 19, Vite 8, SSR) |
| UI | **shadcn/ui** (Radix + Tailwind v4) |
| Icons | **Lucide React** |
| Monitoring | **Sentry** (optional — set SENTRY_DSN) |
| Logging | **Pino** |
| Rate Limiting | In-memory sliding window (custom middleware) |
| Infrastructure | Docker (backend only), GitHub Actions CI |

---

## Current State

### ✅ What's Done

**Backend — 9 modules, all routes implemented:**
1. **Businesses** — GET/PUT /, POST /onboard, PUT /settings
2. **Catalog** — Full CRUD + reorder + public listing
3. **Orders** — CRUD + status/payment updates + stats/dashboard
4. **Customers** — CRUD + phone search + order history
5. **Messages** — List/send/send-catalog/send-payment-link via WAHA
6. **Broadcasts** — Create/send/stats with tier gating
7. **Payments** — Paystack initialize/verify/webhook (HMAC) + history
8. **WhatsApp** — Status/connect/disconnect/webhook
9. **Auth** — Better Auth with Drizzle adapter, email verification, password reset

**Backend infrastructure:**
- Rate limiting (10 req/15min auth, 300 req/min API)
- Zod env validation on startup (fails fast)
- Pino structured logging
- Sentry error capture in error handler
- Subscription/pricing enforcement (checks limits on catalog + broadcasts POST)
- Swagger/OpenAPI docs at `/docs`
- Drizzle migrations generated (2 files)
- Enums: `user_role` (owner/admin/staff), `subscription_tier` (free/starter/growth/business)
- Health check endpoint with DB ping
- Multi-stage Dockerfile
- Seed script for pricing tiers

**Frontend — 17 pages, all rendering:**
- Landing, Login, Signup, Dashboard
- Catalog, Orders, Customers, Messages
- Broadcasts, WhatsApp connection, Settings
- Terms of Service, Privacy Policy
- Email verification, Password reset
- Onboarding wizard (3-step)

**Quality:**
- 9 passing tests (subscription module + catalog exports)
- CI/CD pipeline (GitHub Actions — builds backend + frontend)
- Both builds pass

### ❌ What's NOT Done (known gaps)

**Critical unfinished:**
- **No end-to-end integration testing** — backend routes have never been hit with HTTP requests (no `hono/test` or `elysia` test harness). The subscription module is unit-tested but the actual route-level checks are not.
- **Pricing enforcement** — wired into catalog POST and broadcasts POST, but NOT wired into orders POST, messages POST/send, or any GET routes that should enforce limits
- **Frontend tests** — zero. No `vitest`, no component tests, no Playwright.
- **Onboarding wizard** — created but **no redirect logic** in `__root.tsx` or `signup.tsx` to send new users there. Currently signup redirects to `/onboarding` but nothing enforces a first-time user takes the wizard
- **Better Auth SMTP** — email verification and password reset are configured but require SMTP env vars (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`). Without these, the features are config-only and won't actually send emails
- **CI/CD runner** — workflow is written but has only run once. The initial run failed (missing `--target bun`), subsequent push fixed it. No guarantee it won't break again
- **Neon WebSocket driver** — switched to `Pool` from `@neondatabase/serverless` but untested without an actual database URL
- **Navigation linking** — terms/privacy pages have links in the landing footer, but no links in the app sidebar or elsewhere. Users can't easily discover them
- **Mobile QA** — responsive CSS exists but has never been tested on a real mobile device

**Known non-blocking issues:**
- LightningCSS warnings about `@theme`, `@tailwind`, `@custom-variant` — benign Tailwind v4 compat issues, not build failures
- Elysia TypeScript type errors on standalone modules (`{auth: true}` macro) — safe to ignore, resolves at runtime through `.use()` chain

---

## Environment (This Docker Instance)

### PATH
```bash
# Newer OpenCode binary (v1.15.10):
export PATH="/opt/data/home/.bun/bin:$PATH"

# Old OpenCode binary (v1.14.49 — works but fewer models):
export PATH="/opt/data/home/.npm-global/bin:$PATH"
```

### OpenCode Usage
```bash
# ✅ WORKS — inline prompt + model flag
cd /opt/data/whatsapp-business-kit
export OPENCODE_API_KEY="sk-BI0UhS7A0We3I9NiJd0TrYjJCsxOmY8tOgy8KC6VUpp7xoVT8f34aEbwoe1VVONv"
opencode run 'prompt here' --model opencode-go/deepseek-v4-pro

# ❌ BROKEN — do NOT use these:
# --agent build (silent failure)
# -f flag (file prompts error in v1.15.x)
```

### Available OpenCode Models
- `opencode-go/deepseek-v4-pro` — backend (strong reasoning)
- `opencode-go/deepseek-v4-flash` — frontend (fast)
- `opencode/gemini-3.5-flash`, `opencode/gemini-3.1-pro` — Gemini Go
- `opencode/claude-sonnet-4`, `opencode/claude-opus-4-7` — Claude Go
- `opencode/gpt-5-codex`, `opencode/gpt-5.4-pro` — GPT Go
- `opencode/deepseek-v4-flash-free` — free tier fallback

### Bun
```bash
/opt/data/home/.npm-global/bin/bun    # v1.3.13
```
Always use bun, never npm.

### SSH Key
```bash
/opt/data/home/.ssh/id_ed25519_github
ssh-add /opt/data/home/.ssh/id_ed25519_github
```

---

## Key Commands

```bash
# Backend build
cd /opt/data/whatsapp-business-kit/backend && /opt/data/home/.npm-global/bin/bun build src/index.ts --target bun

# Frontend build
cd /opt/data/whatsapp-business-kit/frontend && /opt/data/home/.npm-global/bin/bun run build

# Run tests
cd /opt/data/whatsapp-business-kit/backend && /opt/data/home/.npm-global/bin/bun test

# Generate migrations
cd /opt/data/whatsapp-business-kit/backend && DATABASE_URL=postgresql://localhost:5432/db /opt/data/home/.npm-global/bin/bun run generate

# Seed pricing tiers
cd /opt/data/whatsapp-business-kit/backend && DATABASE_URL=<neon-url> /opt/data/home/.npm-global/bin/bun run src/database/seed.ts
```

---

## Required .env

```
DATABASE_URL=postgresql://user:pass@neon-host/db
BETTER_AUTH_SECRET=<openssl rand -hex 32>
BETTER_AUTH_URL=http://localhost:3000
PAYSTACK_SECRET_KEY=sk_test_xxx
PAYSTACK_PUBLIC_KEY=pk_test_xxx
WAHA_API_URL=http://localhost:3001
WAHA_API_KEY=your-waha-key
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx   # optional
SMTP_HOST=smtp.example.com                          # optional, for emails
SMTP_PORT=587
SMTP_USER=you@example.com
SMTP_PASS=xxx
EMAIL_FROM=noreply@example.com
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=info
```

---

## Project Structure

```
whatsapp-business-kit/
├── backend/
│   ├── src/
│   │   ├── index.ts              # Entry — validates env, init Sentry, starts server
│   │   ├── app.ts                # App factory — rate limiter, swagger, cors, all modules, health
│   │   ├── config/
│   │   │   ├── env.ts            # Raw env access
│   │   │   └── validate.ts       # Zod env validation (fail-fast)
│   │   ├── database/
│   │   │   ├── index.ts          # Drizzle client (Neon Pool + WebSocket)
│   │   │   ├── schema.ts         # All 10 tables + 2 enums
│   │   │   ├── seed.ts           # Pricing tier seeder
│   │   │   └── migrations/       # Drizzle Kit migrations
│   │   ├── plugins/
│   │   │   └── auth.ts           # Better Auth + auth macro
│   │   ├── modules/
│   │   │   ├── businesses/       # Business CRUD + settings
│   │   │   ├── catalog/          # Product CRUD + reorder + public listing
│   │   │   ├── orders/           # Order CRUD + status/payment + stats
│   │   │   ├── customers/        # Customer CRUD + order history
│   │   │   ├── messages/         # WAHA send + catalog/payment-link + log
│   │   │   ├── broadcasts/       # Bulk message + tier gated
│   │   │   ├── payments/         # Paystack init/verify/webhook
│   │   │   └── whatsapp/         # WAHA connect/disconnect/status/webhook
│   │   └── lib/
│   │       ├── rate-limiter.ts   # In-memory sliding window
│   │       ├── logger.ts         # Pino
│   │       ├── sentry.ts         # Dynamic import Sentry init
│   │       └── subscription.ts   # Tier checking + limit enforcement
│   ├── Dockerfile
│   └── drizzle.config.ts
├── frontend/
│   ├── src/
│   │   ├── client.tsx            # Client hydration entry
│   │   ├── ssr.tsx               # Server render entry
│   │   ├── router.tsx            # TanStack Router
│   │   ├── routeTree.gen.ts      # Auto-generated route tree
│   │   ├── lib/
│   │   │   ├── api.ts            # Fetch wrapper with credentials
│   │   │   ├── auth-client.ts    # Better Auth client
│   │   │   └── utils.ts          # cn() helper
│   │   ├── components/ui/        # 15 shadcn/ui components
│   │   └── routes/               # 17 route files
│   ├── vite.config.ts
│   └── package.json
├── .github/workflows/ci.yml
├── docs/plan.md
└── AGENT.md  ← this file
```

---

## Pricing Tiers

| Tier | GHS/mo | USD/mo | Users | Products | Messages | Broadcasts | Analytics | Support |
|------|--------|--------|-------|----------|----------|------------|-----------|---------|
| Free | 0 | 0 | 1 | 50 | 100/mo | ❌ | ❌ | Basic |
| Starter | 99 | ~$7 | 2 | 200 | 1,000/mo | ✅ | ❌ | Email |
| Growth | 249 | ~$17 | 5 | 500 | 5,000/mo | ✅ | ✅ | Email |
| Business | 499 | ~$35 | ∞ | ∞ | ∞ | ✅ | ✅ | Priority |

---

## Priority Next Steps (if continuing)

1. **End-to-end API tests** — add Elysia `bun:test` harness that starts the app and hits routes
2. **Wire remaining pricing enforcement** — orders POST, messages POST/send
3. **Frontend tests** — add Vitest + component tests for critical flows (login, catalog CRUD)
4. **SMTP setup** — configure a real mail provider so email verification + password reset work
5. **Onboarding flow** — add redirect logic in `__root.tsx` to send first-time users to `/onboarding`
6. **Mobile QA** — test on actual mobile, fix responsive edge cases
7. **Deploy** — Docker Compose + Caddy for HTTPS
8. **Frontend error tracking** — install `@sentry/react` and wire into `__root.tsx`

---

*Last updated: May 25, 2026*
