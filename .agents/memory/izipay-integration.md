---
name: IzichangePay integration
description: How the izichange payment SDK is wired into the SwiftPay API server — payment intent flow, webhook handling, and known edge cases.
---

# IzichangePay integration

## The rule
`depositAddress` on a fresh `PaymentIntent` can be `null` when `acceptedCoins` has more than one entry — the intent starts in `waiting_address_selection` status. Only becomes non-null after the payer picks a coin on `paymentUrl`.

**Why:** SDK type definition: `depositAddress: string | null`. Multi-coin intents don't pre-assign an address.

**How to apply:** When surfacing the payment address in the UI, always check for null and fall back to showing `intent.paymentUrl` so the user can complete coin selection on the izichange-hosted page.

## WebhookEventType (SDK v0.1.2)
Valid values: `payment_intent.completed`, `payment_intent.expired`, `payin.detected`, `payin.confirmed`, `payout.confirmed`, `payout.failed`, `settlement.completed`, `settlement.failed`, `invoice.paid`, `invoice.expired`, `batch_payout.completed`.

`payment_intent.failed` does NOT exist — use `payment_intent.expired` for failed/expired intents.

## Key files
- `artifacts/api-server/src/lib/izipay.ts` — singleton client + `toAcceptedCoins()` helper
- `artifacts/api-server/src/routes/webhooks.ts` — raw-body webhook handler at `/webhooks/izipay`
- `artifacts/api-server/src/routes/transactions.ts` — POST handler creates payment intent
- `artifacts/api-server/src/app.ts` — webhook route mounted BEFORE `express.json()` (required for raw body)

## Secrets
- `IZIPAY_API_KEY` — `sk_live_…` or `sk_test_…`
- `IZIPAY_WEBHOOK_SECRET` — `whsec_…` (from dashboard, generated once at endpoint creation)

## Graceful degradation
If `IZIPAY_API_KEY` is not set, `getIziPayClient()` returns null and the POST handler falls back to deterministic placeholder addresses. The app still works without the key.
