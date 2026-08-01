import { Router, type IRouter } from "express";

const router: IRouter = Router();

// Map from our coin symbol to CoinGecko ID
const COIN_IDS: Record<string, string> = {
  USDT: "tether",
  BTC: "bitcoin",
  ETH: "ethereum",
  LTC: "litecoin",
  DOGE: "dogecoin",
  BCH: "bitcoin-cash",
};

type RatesMap = Record<string, number>;

interface RatesCache {
  data: RatesMap;
  fetchedAt: number;
}

let cache: RatesCache | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const FALLBACK_RATES: RatesMap = {
  USDT: 655,
  BTC: 46_000_000,
  ETH: 2_000_000,
  LTC: 60_000,
  DOGE: 300,
  BCH: 340_000,
};

async function fetchLiveRates(): Promise<RatesMap> {
  try {
    const ids = Object.values(COIN_IDS).join(",");
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=xof`,
      { signal: AbortSignal.timeout(5000) },
    );
    if (!res.ok) return FALLBACK_RATES;
    const json = (await res.json()) as Record<string, { xof?: number }>;

    const rates: RatesMap = {};
    for (const [coin, geckoId] of Object.entries(COIN_IDS)) {
      const xof = json[geckoId]?.xof;
      if (xof) rates[coin] = Math.round(xof);
    }
    // Fill any missing coins with fallbacks
    for (const coin of Object.keys(COIN_IDS)) {
      if (!rates[coin]) rates[coin] = FALLBACK_RATES[coin] ?? 0;
    }
    return rates;
  } catch {
    return FALLBACK_RATES;
  }
}

router.get("/rates", async (_req, res, next) => {
  try {
    const now = Date.now();
    if (!cache || now - cache.fetchedAt > CACHE_TTL_MS) {
      const data = await fetchLiveRates();
      cache = { data, fetchedAt: now };
    }
    res.json({ rates: cache.data, fetchedAt: new Date(cache.fetchedAt).toISOString() });
  } catch (error) {
    next(error);
  }
});

export default router;
