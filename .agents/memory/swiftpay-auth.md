---
name: SwiftPay auth pattern
description: How SwiftPay authentication is persisted and where the provider belongs.
---

# SwiftPay auth pattern

## Rule
SwiftPay accounts and sessions are persisted in Supabase through the API server. The browser stores only a session token and removes the old local-only account keys on startup.

**Why:** LocalStorage account records caused the UI to report duplicate accounts even when the Supabase database was empty.

**How to apply**
- Keep `AuthProvider` inside `ThemeProvider` and `LanguageProvider`, wrapping `QueryClientProvider`.
- Protected routes should wait for the provider's loading state before redirecting.
- Authentication requests must use `/api/auth/*`; never recreate an account store in browser storage.

## Pages
- `/connexion` — Login (email or phone + password)
- `/inscription` — Register (full form with country picker, password strength, terms)
- `/dashboard` — Protected dashboard with stats, recent transactions, quick actions
- `/envoyer` — Protected 4-step send payment flow
- `/transactions` — Protected transaction history and detail
- `/profil` — Protected profile with editable info and security settings