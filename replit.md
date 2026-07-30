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
| `IZIPAY_API_KEY` | IzichangePay API key (`sk_live_…` or `sk_test_…`) — Dashboard → Développeurs → Clés API |
| `IZIPAY_WEBHOOK_SECRET` | IzichangePay webhook signing secret (`whsec_…`) — Dashboard → Développeurs → Webhooks |

> Without `SUPABASE_DATABASE_URL` the API server exits immediately. `IZIPAY_API_KEY` and `IZIPAY_WEBHOOK_SECRET` are optional at startup — transactions fall back to placeholder addresses until configured.

## IzichangePay integration

Payment flow:
1. `POST /api/transactions` → creates a DB record + calls `izipay.paymentIntents.create()` with the FCFA amount and accepted coins (USDT.TRC20/BEP20 or BTC).
2. The response includes `depositAddress` (the crypto address the sender pays to) and `intentId`.
3. IzichangePay notifies `POST /webhooks/izipay` when payment is detected.
4. `payment_intent.completed` → transaction status set to `completed`, user notified.
5. `payment_intent.expired` → transaction status set to `failed`.

Webhook endpoint to configure in the izichange dashboard:
```
https://<your-domain>/webhooks/izipay
```

> **Note:** When a payment intent is first created with multiple `acceptedCoins`, `depositAddress` may be `null` (status `waiting_address_selection`) until the payer selects a coin on `paymentUrl`. The frontend currently polls for an address — see the follow-up task about the `paymentUrl` redirect flow.

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
