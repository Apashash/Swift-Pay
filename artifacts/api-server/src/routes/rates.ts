import { Router, type IRouter } from "express";

const router: IRouter = Router();

interface RatesCache {
  data: { USDT: number; BTC: number };
  fetchedAt: number;
}

let cache: RatesCache | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const FALLBACK_RATES = { USDT: 655, BTC: 46_000_000 };

async function fetchLiveRates(): Promise<{ USDT: number; BTC: number }> {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=tether,bitcoin&vs_currencies=xof",
      { signal: AbortSignal.timeout(5000) },
    );
    if (!res.ok) return FALLBACK_RATES;
    const json = (await res.json()) as {
      tether?: { xof?: number };
      bitcoin?: { xof?: number };
    };
    const usdtRate = json.tether?.xof;
    const btcRate = json.bitcoin?.xof;
    if (!usdtRate || !btcRate) return FALLBACK_RATES;
    return { USDT: Math.round(usdtRate), BTC: Math.round(btcRate) };
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
