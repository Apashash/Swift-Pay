import { IziPayClient } from "izichangepay-sdk";

let _client: IziPayClient | null = null;

/**
 * Returns the IziPayClient singleton, or null if IZIPAY_API_KEY is not set.
 * The integration degrades gracefully: transactions still work but use
 * placeholder addresses until the key is configured.
 */
export function getIziPayClient(): IziPayClient | null {
  if (_client) return _client;
  const apiKey = process.env.IZIPAY_API_KEY;
  if (!apiKey) return null;
  _client = new IziPayClient({ apiKey });
  return _client;
}

/** Map SwiftPay currency codes to izichange accepted coin identifiers. */
export function toAcceptedCoins(cryptoCurrency: string): string[] {
  if (cryptoCurrency === "BTC") return ["BTC"];
  // USDT — accept both TRC20 and BEP20
  return ["USDT.TRC20", "USDT.BEP20"];
}
