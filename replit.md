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

Both secrets must be set as Replit Secrets before the API server will start:

| Secret | Description |
|--------|-------------|
| `SUPABASE_DATABASE_URL` | PostgreSQL connection string (URI format) from Supabase → Settings → Database → Connection string. Use port **6543** (PgBouncer pooler) with SSL. Example: `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres` |
| `SESSION_SECRET` | Arbitrary random string used to sign session tokens |

> **Note:** Without `SUPABASE_DATABASE_URL`, the API server will exit immediately with `Error: SUPABASE_DATABASE_URL must be set`. The frontend (SwiftPay web) will still start but API calls will fail.

## Replit setup status

- [x] `pnpm install` — dependencies installed
- [x] `SUPABASE_DATABASE_URL` — secret configured
- [x] `SESSION_SECRET` — secret configured
- [x] Both workflows running and healthy
- [ ] Database schema pushed — run `pnpm --filter @workspace/db run push` once to create tables

## Database schema

Push schema to Supabase:
```bash
pnpm --filter @workspace/db run push
```

The `lib/db` package uses `ssl: { rejectUnauthorized: false }` to connect via Supabase's PgBouncer pooler (port 6543).

## User preferences
