# SwiftPay

A crypto-to-mobile-money payment platform. Users send crypto from anywhere; recipients receive Mobile Money (FCFA) in seconds — no crypto knowledge required.

## Run & Operate

- `pnpm --filter @workspace/swift-pay run dev` — run the frontend (port 22199)
- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19, Vite 7, Tailwind CSS 4, Wouter (routing), Framer Motion
- API: Express 5, Pino (logging)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod, drizzle-zod
- UI: shadcn/ui components (Radix primitives)
- i18n: custom LanguageProvider (`/src/lib/i18n`)
- Theming: custom ThemeProvider (`/src/lib/theme`)

## Where things live

- `artifacts/swift-pay/` — React frontend (landing page)
- `artifacts/api-server/` — Express backend, routes under `/api`
- `artifacts/mockup-sandbox/` — UI component preview sandbox (design tool)
- `lib/` — shared libraries (api-zod schemas, api-client-react, db)

## Architecture decisions

- Monorepo with pnpm workspaces; each artifact is its own package
- Frontend uses `BASE_URL` for all routing so the app works under Replit's path-based proxy
- API server bundles with esbuild at dev time (no ts-node)
- All API contracts defined via Zod schemas in `@workspace/api-zod`

## Product

SwiftPay lets senders pay in crypto (USDT/BTC) and recipients receive Mobile Money (FCFA) via Orange Money, MTN, Wave, or Moov — targeting West Africa (Côte d'Ivoire and neighbours). The landing page covers Hero, How It Works, Supported Networks, Usage Modes, For Businesses, and example stories.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Run `pnpm install` from the workspace root before starting any service — node_modules are not committed.
- The `SwiftPay` legacy workflow (auto-created by import) conflicts with the managed `artifacts/swift-pay: web` workflow; use the managed one.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
