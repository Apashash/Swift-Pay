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
| `ASHTECHPAY_API_KEY` | AshtechPay API key (`Bearer …`) — Dashboard → API Keys |

> Without `SUPABASE_DATABASE_URL` the API server exits immediately. Without `ASHTECHPAY_API_KEY` the crypto asset list is empty and transactions use placeholder addresses.

## AshtechPay integration

Docs: https://ashtechpay.top/docs/api  
Base URL: `https://ashtechpay.top/v1/`  
Auth: `Authorization: Bearer <ASHTECHPAY_API_KEY>`

Payment flow:
1. `GET /api/crypto/assets` → frontend fetches available coins + networks dynamically (cached 10 min, proxied through the API server).
2. User selects coin (USDT, BTC, ETH, …) and network (TRC20, BEP20, ERC20, …).
3. `POST /api/transactions` → creates a DB record + calls AshtechPay `POST /v1/crypto/collect` with `asset_code` and sets `reference = transaction.id`.
4. Response includes `address` (deposit address) and optional `memo` (required for some networks like XRP, XLM, TON).
5. AshtechPay notifies `POST /webhooks/ashtechpay` when payment is detected.
6. `payment.completed` → transaction status set to `completed`, user notified.
7. `payment.failed` → transaction status set to `failed`.

Webhook endpoint to configure in the AshtechPay dashboard as `notify_url`:
```
https://<your-domain>/webhooks/ashtechpay
```

## Replit setup status

- [x] `pnpm install` — dependencies installed
- [x] `SUPABASE_DATABASE_URL` — secret configured
- [x] `SESSION_SECRET` — secret configured
- [x] SwiftPay web workflow running on port 22199
- [x] API Server workflow running on port 8080
- [ ] Database schema pushed — run `pnpm --filter @workspace/db run push` once to create tables

## Database schema

Push schema to Supabase:
```bash
pnpm --filter @workspace/db run push
```

The `lib/db` package uses `ssl: { rejectUnauthorized: false }` to connect via Supabase's PgBouncer pooler (port 6543).

## User preferences
