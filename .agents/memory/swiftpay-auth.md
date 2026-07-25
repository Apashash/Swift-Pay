---
name: SwiftPay auth pattern
description: How auth works in the SwiftPay frontend (mock localStorage, protected routes, provider nesting).
---

# SwiftPay auth pattern

## Rule
`AuthProvider` uses `localStorage` for persistence (no backend yet). It must be placed inside `ThemeProvider` and `LanguageProvider` but wrapping `QueryClientProvider` so all query hooks can access user state.

**Why:** `useAuth` is consumed inside `DashboardLayout` and `Navbar` which are rendered inside routes. The provider order in App.tsx is:
`ThemeProvider → LanguageProvider → AuthProvider → QueryClientProvider → TooltipProvider → WouterRouter`

## How to apply
- Protected routes use a `ProtectedRoute` wrapper component that calls `useAuth()` and redirects to `/connexion` if `!isAuthenticated`.
- `Navbar` always imports `useAuth` — it is safe because `AuthProvider` is an ancestor in every render path.
- Mock user data is stored under `swiftpay_user` (current session) and `swiftpay_users` (all registered users) keys in localStorage.

## Pages added
- `/connexion` — Login (email or phone + password)
- `/inscription` — Register (full form with country picker, password strength, terms)
- `/dashboard` — Protected dashboard with stats, recent transactions, quick actions
- `/envoyer` — Protected 4-step send payment flow (recipient → amount → payment instructions → confirmation)
- `/transactions` — Protected transaction history table with search + status filter
- `/transactions/:id` — Protected transaction detail with timeline
- `/profil` — Protected profile with editable info, security settings, KYC banner
