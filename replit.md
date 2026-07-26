# SwiftPay

A French-localized crypto payment platform targeting West Africa. Users send crypto from anywhere; recipients receive FCFA via Mobile Money (Orange Money, MTN, Wave, Moov Money) in seconds.

## Stack

- **Frontend**: React + Vite + Wouter + TailwindCSS (artifact: `artifacts/swift-pay`)
- **API Server**: Express 5 + Drizzle ORM + PostgreSQL (artifact: `artifacts/api-server`)
- **Shared libs**: `lib/api-spec` (OpenAPI), `lib/api-zod` (Zod schemas), `lib/api-client-react` (TanStack Query client), `lib/db` (Drizzle schema + connection)
- **Package manager**: pnpm workspaces

## Running the project

Both services start automatically via the **Project** run button:

| Service | Command | Port |
|---|---|---|
| SwiftPay frontend | `pnpm --filter @workspace/swift-pay run dev` | 22199 |
| API Server | `pnpm --filter @workspace/api-server run dev` | 8080 |

Install dependencies first if `node_modules` is missing:
```
pnpm install
```

## Environment

- `SUPABASE_DATABASE_URL` — required Replit Secret; the API and Drizzle use Supabase PostgreSQL exclusively
- `SESSION_SECRET` — stored as a Replit Secret

## Notes

- Authentication uses the Supabase PostgreSQL database through the API server
- User accounts and sessions are stored in Supabase tables (`users` and `auth_sessions`)
- The browser only keeps a session token; legacy local-only account keys are removed on startup
- API routes beyond `/api/healthz` include registration, login, session, logout, and profile updates

## User preferences
