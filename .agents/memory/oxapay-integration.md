---
name: OxaPay integration
description: OxaPay replaced AshtechPay as the crypto payment provider. Key API differences and field mappings.
---

# OxaPay Integration

## Key endpoints
- `GET /common/currencies` — no auth, returns all currencies + networks; used for the assets list
- `POST /payment/white-label` — auth via `merchant_api_key` header; creates a payment address

## Auth
Header: `merchant_api_key: <OXAPAY_MERCHANT_API_KEY>` (env var name)

## Asset code convention
`asset_code = "${symbol}.${network_tech_code}"` e.g. "USDT.TRC20"  
`network_label` (human name e.g. "Tron Network") is what OxaPay's white-label `network` param expects — not the tech code.

## White-label request fields
- `pay_currency`: coin symbol (e.g. "USDT")
- `amount`: crypto amount (including fee)
- `network`: human-readable network name from `network_label` (e.g. "Tron Network") — optional
- `order_id`: our transaction UUID — echoed back in the webhook
- `callback_url`: `https://<domain>/webhooks/oxapay`

## Webhook callback
OxaPay POSTs the full payment object to `callback_url`.  
- `order_id` → our transaction UUID (lookup key)
- `status` values: "paid" → completed, "expired"/"failed" → failed, "pending" → ignored
- `txs[0].tx_hash` → blockchain tx hash

**Why:** `order_id` is the link between OxaPay and our DB (not `track_id` which is OxaPay's own ID).

## Frontend change
`PaymentForm.tsx` sends `networkLabel: selectedAsset?.network_label` so the server can pass the human-readable network name to OxaPay.
