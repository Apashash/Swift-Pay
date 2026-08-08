# SwiftPay

A full-stack fintech/payment application (UI in French) with a React/Vite frontend and Express API backend.

## Stack

- **Frontend**: React 19, Vite, TailwindCSS 4, Wouter (routing), TanStack Query
- **Backend**: Express 5, TypeScript, Pino (logging)
- **Database**: PostgreSQL via Drizzle ORM (Supabase)
- **Auth**: Custom session tokens (Bearer token in `Authorization` header), scrypt password hashing
- **Monorepo**: pnpm workspace

## Artifacts

| Artifact | Directory | Port | Description |
|----------|-----------|------|-------------|
| SwiftPay (web) | `artifacts/swift-pay` | 22199 | React frontend |
| API Server | `artifacts/api-server` | 8080 | Express REST API |
| Canvas | `artifacts/mockup-sandbox` | — | Design sandbox |

## Shared libraries

| Library | Description |
|---------|-------------|
| `lib/db` | Drizzle ORM schema + database client — requires `SUPABASE_DATABASE_URL` |
| `lib/api-spec` | Shared API type definitions |
| `lib/api-zod` | Zod schemas for API validation |
| `lib/api-client-react` | React Query hooks for API calls |

## Running the project

```bash
pnpm install         # Install all dependencies
```

Both workflows start automatically:
- **`artifacts/swift-pay: web`** — Vite dev server on port 22199
- **`artifacts/api-server: API Server`** — Express on port 8080

API health check: `GET /api/healthz` → `{"status":"ok"}`

## Required secrets

| Secret | Description |
|--------|-------------|
| `SUPABASE_DATABASE_URL` | PostgreSQL connection string (URI format) from Supabase → Settings → Database → Connection string. Use port **6543** (PgBouncer pooler) with SSL. |
| `SESSION_SECRET` | Arbitrary random string used to sign session tokens |
| `OXAPAY_MERCHANT_API_KEY` | OxaPay merchant API key — Dashboard → API Keys |

> Without `SUPABASE_DATABASE_URL` the API server exits immediately. Without `OXAPAY_MERCHANT_API_KEY` crypto payments won't work.

## OxaPay integration

White-label payment flow:
1. `GET /api/crypto/assets` → fetches available coins + networks from `GET /common/currencies` (no auth required).
2. User selects coin and network.
3. `POST /api/transactions` → creates a DB record + calls OxaPay `POST /payment/white-label` with the selected asset; `order_id` = transaction UUID.
4. OxaPay notifies `POST /webhooks/oxapay` when payment status changes.
5. Status `"paid"` → transaction set to `completed`; other statuses → `failed`.

Webhook endpoint to configure in the OxaPay dashboard:
```
https://<your-domain>/webhooks/oxapay
```

## Replit setup status

- [x] `pnpm install` — dependencies installed (tsx overridden to 4.21.0 via `pnpm.overrides` in package.json to pass the Replit package firewall)
- [ ] `SUPABASE_DATABASE_URL` — **required** — PostgreSQL connection string from Supabase → Settings → Database → URI (port 6543, PgBouncer)
- [x] `SESSION_SECRET` — secret configured
- [x] SwiftPay web workflow running on port 22199
- [ ] API Server workflow — **waiting on `SUPABASE_DATABASE_URL`** to start
- [ ] `OXAPAY_MERCHANT_API_KEY` — optional, but needed for crypto payments
- [ ] Database schema pushed (`pnpm --filter @workspace/db run push`) — do after `SUPABASE_DATABASE_URL` is set

## Database schema

Push schema to Supabase:
```bash
pnpm --filter @workspace/db run push
```

The `lib/db` package uses `ssl: { rejectUnauthorized: false }` to connect via Supabase's PgBouncer pooler (port 6543).

## User preferences
