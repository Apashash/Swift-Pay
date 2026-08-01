/**
 * AshtechPay crypto collection client.
 *
 * Docs: https://ashtechpay.top/docs/api
 *
 * Two endpoints used:
 *   GET  /v1/crypto/assets           → list of enabled crypto networks
 *   POST /v1/crypto/collect          → generate a deposit address for a customer
 *
 * Auth: Authorization: Bearer <ASHTECHPAY_API_KEY>
 */

const BASE_URL = "https://ashtechpay.top/v1";

export interface AshAsset {
  asset_code: string; // e.g. "USDT.TRC20"
  coin: string; // e.g. "USDT"
  name: string; // e.g. "Tether"
  network: string; // e.g. "TRC20"
  network_label: string; // e.g. "TRON (TRC20)"
  memo_required: boolean;
  memo_type: string | null;
  currency: string;
}

export interface AshCollectRequest {
  asset_code: string;
  reference?: string;
  notify_url?: string;
  customer?: { firstName?: string; lastName?: string; email?: string };
  refund_address?: string;
}

export interface AshCollectResponse {
  transaction_id: string;
  reference: string;
  status: string;
  payment_method: string;
  asset_code: string;
  network: string;
  address: string;
  memo?: string | null;
}

function getApiKey(): string | null {
  return process.env.ASHTECHPAY_API_KEY ?? null;
}

async function ashFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("ASHTECHPAY_API_KEY not set");

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...(options.headers as Record<string, string>),
    },
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null) as Record<string, unknown> | null;
    const msg = (body?.message ?? body?.error ?? `HTTP ${res.status}`) as string;
    throw new Error(`AshtechPay error: ${msg}`);
  }

  return res.json() as Promise<T>;
}

/** Fetch the list of active crypto networks from AshtechPay. */
export async function getAssets(): Promise<AshAsset[]> {
  const data = await ashFetch<{ assets: AshAsset[] }>("/crypto/assets");
  return data.assets;
}

/** Create a deposit address for the given asset. */
export async function createCollect(
  req: AshCollectRequest,
): Promise<AshCollectResponse> {
  return ashFetch<AshCollectResponse>("/crypto/collect", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

/** Whether the API key is configured. */
export function isConfigured(): boolean {
  return Boolean(getApiKey());
}
