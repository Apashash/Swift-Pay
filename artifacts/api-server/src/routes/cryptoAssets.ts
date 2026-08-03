import { Router, type IRouter } from "express";
import { getAssets } from "../lib/oxapay";
import type { OxaAsset } from "../lib/oxapay";
import { logger } from "../lib/logger";

const router: IRouter = Router();

interface AssetsCache {
  data: OxaAsset[];
  fetchedAt: number;
}

let cache: AssetsCache | null = null;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * GET /api/crypto/assets
 *
 * Returns the list of active crypto networks from OxaPay.
 * Cached for 10 minutes to avoid hammering the upstream API.
 * Falls back to an empty list if the fetch fails.
 */
router.get("/crypto/assets", async (_req, res, next) => {
  try {
    const now = Date.now();
    if (!cache || now - cache.fetchedAt > CACHE_TTL_MS) {
      try {
        const assets = await getAssets();
        cache = { data: assets, fetchedAt: now };
      } catch (err) {
        logger.warn({ err }, "Failed to fetch OxaPay crypto assets");
        // Return stale cache if available, otherwise empty list
        if (!cache) {
          res.json({ assets: [], cached: false });
          return;
        }
      }
    }
    res.json({ assets: cache!.data, fetchedAt: new Date(cache!.fetchedAt).toISOString() });
  } catch (error) {
    next(error);
  }
});

export default router;
