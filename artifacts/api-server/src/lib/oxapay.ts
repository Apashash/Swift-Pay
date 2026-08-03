/**
 * OxaPay crypto payment client — White Label integration.
 *
 * Docs: https://docs.oxapay.com/api-reference/payment/generate-white-label
 *
 * Endpoints used:
 *   GET  /common/currencies          → all supported cryptocurrencies + networks (no auth)
 *   POST /payment/white-label        → generate a payment address
 *
 * Auth: merchant_api_key header (OXAPAY_MERCHANT_API_KEY)
 */

const BASE_URL = "https://api.oxapay.com/v1";

// ── Types ─────────────────────────────────────────────────────────────────────

/** Shape returned by GET /api/crypto/assets — matches the frontend CryptoAsset type. */
export interface OxaAsset {
  asset_code: string;     // "USDT.TRC20"
  coin: string;           // "USDT"
  name: string;           // "Tether"
  network: string;        // "TRC20"  (tech code)
  network_label: string;  // "Tron Network"  (human-readable — used as `network` param in white-label)
  memo_required: boolean;
  memo_type: string | null;
  currency: string;       // same as coin
}

export interface OxaWhiteLabelRequest {
  pay_currency: string;        // crypto symbol, e.g. "USDT"
  amount: number;              // amount in pay_currency
  network?: string;            // human-readable network name, e.g. "Tron Network"
  lifetime?: number;           // minutes, 15–2880, default 60
  callback_url?: string;       // webhook URL
  email?: string;              // payer email
  order_id?: string;           // our transaction UUID
  description?: string;
  fee_paid_by_payer?: number;  // 1 = payer pays fee, 0 = merchant pays
}

export interface OxaWhiteLabelResponse {
  track_id: string;
  address: string;
  memo?: string | null;
  pay_amount: number;
  pay_currency: string;
  network: string;
  expired_at: number;  // UNIX timestamp
  amount?: number;
  currency?: string;
  status?: string;
}

interface OxaApiResponse<T> {
  data: T;
  message: string;
  error: Record<string, unknown> | null;
  status: number;
  version: string;
}

// ── Internal fetch helper ─────────────────────────────────────────────────────

function getApiKey(): string | null {
  return process.env.OXAPAY_MERCHANT_API_KEY ?? null;
}

async function oxaFetch<T>(
  path: string,
  options: RequestInit = {},
  requireAuth = true,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (requireAuth) {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("OXAPAY_MERCHANT_API_KEY not set");
    headers["merchant_api_key"] = apiKey;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string> | undefined) },
    signal: AbortSignal.timeout(10_000),
  });

  const body = await res.json().catch(() => null) as OxaApiResponse<T> | null;

  if (!res.ok || (body && body.status && body.status >= 400)) {
    const msg =
      (body?.error as Record<string, unknown> | null)?.message as string
      ?? body?.message
      ?? `HTTP ${res.status}`;
    throw new Error(`OxaPay error: ${msg}`);
  }

  if (!body) throw new Error("OxaPay error: empty response");
  return body.data;
}

// ── Currencies → CryptoAsset list ────────────────────────────────────────────

interface OxaCurrencyNetwork {
  network: string;          // tech code, e.g. "TRC20"
  name: string;             // human name, e.g. "Tron Network"
  keys: string[];           // e.g. ["address"] or ["address", "memo"]
  required_confirmations: number;
  withdraw_fee: number;
  withdraw_min: number;
  deposit_min: number;
}

interface OxaCurrencyEntry {
  symbol: string;
  name: string;
  status: boolean;
  networks: Record<string, OxaCurrencyNetwork>;
}

/**
 * Fetch the full list of supported cryptocurrencies + networks from OxaPay.
 * Returns them as CryptoAsset objects compatible with the frontend.
 * No API key required.
 */
export async function getAssets(): Promise<OxaAsset[]> {
  const data = await oxaFetch<Record<string, OxaCurrencyEntry>>(
    "/common/currencies",
    { method: "GET" },
    false, // no auth needed
  );

  const assets: OxaAsset[] = [];

  for (const [symbol, entry] of Object.entries(data)) {
    if (!entry.status) continue; // skip inactive currencies

    for (const [networkLabel, net] of Object.entries(entry.networks)) {
      const keys = net.keys ?? [];
      const memoRequired =
        keys.includes("memo") ||
        keys.includes("destination_tag") ||
        keys.includes("tag");
      const memoType = memoRequired
        ? keys.includes("destination_tag") || keys.includes("tag")
          ? "numeric"
          : "text"
        : null;

      assets.push({
        asset_code: `${symbol}.${net.network}`,  // e.g. "USDT.TRC20"
        coin: symbol,
        name: entry.name,
        network: net.network,          // tech code
        network_label: networkLabel,   // human name — used as `network` in white-label call
        memo_required: memoRequired,
        memo_type: memoType,
        currency: symbol,
      });
    }
  }

  // Sort: stable alphabetical by coin then network
  assets.sort((a, b) =>
    a.coin.localeCompare(b.coin) || a.network.localeCompare(b.network),
  );

  return assets;
}

// ── White Label payment ───────────────────────────────────────────────────────

/**
 * Create a white-label payment address via OxaPay.
 * `network` must be the human-readable network name (e.g. "Tron Network"),
 * not the tech code (e.g. "TRC20").
 */
export async function createWhiteLabel(
  req: OxaWhiteLabelRequest,
): Promise<OxaWhiteLabelResponse> {
  return oxaFetch<OxaWhiteLabelResponse>("/payment/white-label", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

/** Whether the merchant API key is configured. */
export function isConfigured(): boolean {
  return Boolean(getApiKey());
}
