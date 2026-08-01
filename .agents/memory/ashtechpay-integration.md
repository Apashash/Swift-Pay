---
name: AshtechPay integration
description: Replaced IziChangePay with AshtechPay for crypto collection. Covers API shape, webhook format, and key implementation decisions.
---

# AshtechPay integration

**Why:** User replaced IziChangePay entirely with AshtechPay for crypto deposit address generation.

## API shape (https://ashtechpay.top/v1/)

- Auth: `Authorization: Bearer <ASHTECHPAY_API_KEY>`
- `GET /v1/crypto/assets` → `{ assets: AshAsset[] }` — returns all active coin/network pairs; cached 10 min server-side at `/api/crypto/assets`
- `POST /v1/crypto/collect` → `{ asset_code, reference?, notify_url?, customer? }` → `{ transaction_id, reference, address, memo?, network, asset_code, status }`

## Webhook (POST to notify_url)

```json
{ "event": "payment.completed"|"payment.failed", "transaction_id": "...", "reference": "<our tx UUID>", "status": "completed", ... }
```

- No signature verification — AshtechPay does not sign webhooks.
- `reference` field = our transaction UUID (set as `reference` at collect creation time).
- Endpoint: `POST /webhooks/ashtechpay`

## DB schema additions

Added to `transactionsTable` (lib/db/src/schema/index.ts):
- `cryptoNetwork` text nullable — network code (TRC20, BEP20, etc.)
- `assetCode` text nullable — full asset code (USDT.TRC20, BTC, etc.)
- `paymentMemo` text nullable — memo/tag required by some networks (XRP, TON, XLM)
- `intentId` repurposed to store AshtechPay `transaction_id`

## Key files

- `artifacts/api-server/src/lib/ashtechpay.ts` — API client (getAssets, createCollect)
- `artifacts/api-server/src/routes/cryptoAssets.ts` — GET /api/crypto/assets (cached proxy)
- `artifacts/api-server/src/routes/webhooks.ts` — POST /webhooks/ashtechpay
- `artifacts/swift-pay/src/components/home/PaymentForm.tsx` — dynamic coin+network selection

**How to apply:** Any future payment-provider changes follow the same pattern: client lib → proxy route → transactions route update → webhook handler → frontend dynamic selector.
