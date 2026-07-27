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
pnpm install         # Install all dependencies (already done)
```

Both workflows start automatically:
- **`artifacts/swift-pay: web`** — Vite dev server on port 22199
- **`artifacts/api-server: API Server`** — Express on port 8080

API health check: `GET /api/healthz` → `{"status":"ok"}`

## Required secrets

| Secret | Description |
|--------|-------------|
| `SUPABASE_DATABASE_URL` | PostgreSQL connection string (URI format) from Supabase → Settings → Database → Connection string. Port 6543 (pooler) with SSL. |
| `SESSION_SECRET` | Secret for signing sessions |

## Database schema

Push schema to Supabase:
```bash
pnpm --filter @workspace/db run push
```

The `lib/db` package uses `ssl: { rejectUnauthorized: false }` to connect via Supabase's PgBouncer pooler (port 6543).

## User preferences
