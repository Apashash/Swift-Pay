# SwiftPay

A full-stack payment application with a React/Vite frontend and Express API backend.

## Stack

- **Frontend**: React 19, Vite, TailwindCSS 4, Wouter (routing), TanStack Query
- **Backend**: Express, TypeScript, Pino (logging)
- **Database**: PostgreSQL via Drizzle ORM (requires Supabase)
- **Auth**: Custom JWT-based sessions (Bearer token in `Authorization` header)
- **Monorepo**: pnpm workspace

## Artifacts

| Artifact | Path | Description |
|----------|------|-------------|
| SwiftPay (web) | `artifacts/swift-pay` | React frontend |
| API Server | `artifacts/api-server` | Express REST API |
| Canvas | `artifacts/mockup-sandbox` | Design sandbox |

## Shared libraries

- `lib/db` — Drizzle ORM schema + database client (requires `SUPABASE_DATABASE_URL`)
- `lib/api-spec` — Shared API type definitions
- `lib/api-zod` — Zod schemas for API validation
- `lib/api-client-react` — React hooks for API calls

## Running the project

```bash
pnpm install         # Install all dependencies
```

Workflows start automatically. The frontend runs on port 22199, the API on port 8080.

## Required secrets

| Secret | Description |
|--------|-------------|
| `SUPABASE_DATABASE_URL` | PostgreSQL connection string from your Supabase project |
| `SESSION_SECRET` | Secret for signing sessions |

The API server **will not start** without `SUPABASE_DATABASE_URL`. After adding it, also run the database migration:

```bash
pnpm --filter @workspace/db run db:push
```

## User preferences
