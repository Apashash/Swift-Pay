const SESSION_KEY = "swiftpay_session_token";
export const API_BASE = `${import.meta.env.BASE_URL.replace(/\/$/, "")}/api`;

export function getToken(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => null) as { message?: string } | null;
    throw new Error(body?.message || "Une erreur est survenue.");
  }
  // 204 No Content — nothing to parse
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type TxStatus = "completed" | "pending" | "failed";

export interface ApiTransaction {
  id: string;
  userId: string | null;
  recipient: string;
  recipientPhone: string;
  countryCode: string;
  countryName: string;
  networkFlag: string;
  network: string;
  amountFcfa: number;
  amountCrypto: number;
  cryptoCurrency: string;
  cryptoNetwork: string | null;
  assetCode: string | null;
  rate: number;
  fee: number;
  status: TxStatus;
  txHash: string | null;
  paymentAddress: string | null;
  paymentMemo: string | null;
  qrCodeUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

/** One entry from GET /api/crypto/assets */
export interface CryptoAsset {
  asset_code: string;   // "USDT.TRC20"
  coin: string;         // "USDT"
  name: string;         // "Tether"
  network: string;      // "TRC20"
  network_label: string; // "TRON (TRC20)"
  memo_required: boolean;
  memo_type: string | null;
  currency: string;
}

export interface Rates {
  [coin: string]: number;
}
