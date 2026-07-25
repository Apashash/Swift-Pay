# SwiftPay

A crypto-to-Mobile Money payment platform. Users send crypto (USDT, BTC, ETH, etc.) and recipients receive FCFA via Mobile Money operators (Orange Money, MTN MoMo, Wave, Moov Money, etc.).

## Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS + shadcn/ui (`artifacts/swift-pay`)
- **Backend**: Express 5 + TypeScript API server (`artifacts/api-server`)
- **Database**: PostgreSQL via Drizzle ORM (`lib/db`)
- **Monorepo**: pnpm workspaces

## Running the project

Both services start automatically via the configured workflows:

- **SwiftPay web app** — `pnpm --filter @workspace/swift-pay run dev` (port from `PORT` env)
- **API server** — `pnpm --filter @workspace/api-server run dev` (port 8080)

## Environment variables

- `DATABASE_URL` — PostgreSQL connection string (auto-provided by Replit)
- `SESSION_SECRET` — Secret for session signing
- `PORT` — Port for each artifact service (auto-assigned by Replit)

## Database schema

Schema lives in `lib/db/src/schema/`. Push changes with:

```
cd lib/db && pnpm run push
```

## Project structure

```
artifacts/
  swift-pay/      # React frontend
  api-server/     # Express API
lib/
  db/             # Drizzle ORM schema + client
  api-spec/       # OpenAPI spec + Orval codegen config
  api-client-react/  # Generated React Query hooks
  api-zod/        # Zod validation schemas
```

## User preferences

- Keep the existing French routing convention (`/connexion`, `/inscription`, etc.)
