import { Router, type IRouter } from "express";
import { and, desc, eq, gte, ilike, or, sql } from "drizzle-orm";
import { db, transactionsTable, notificationsTable } from "@workspace/db";
import { getBearerToken, getUserFromToken } from "../lib/auth";
import { createCollect, isConfigured as ashIsConfigured } from "../lib/ashtechpay";

const router: IRouter = Router();

// ── Auth helper ──────────────────────────────────────────────────────────────

async function requireUser(authHeader: string | undefined) {
  const token = getBearerToken(authHeader);
  const user = await getUserFromToken(token);
  if (!user) {
    const err = new Error("Session expirée.") as Error & { statusCode: number };
    err.statusCode = 401;
    throw err;
  }
  return user;
}

// ── Payment addresses (deterministic placeholders) ────────────────────────────

function generatePaymentAddress(currency: string, txId: string): string {
  const suffix = txId.replace(/-/g, "").slice(0, 16).toUpperCase();
  if (currency === "BTC") {
    return `bc1q${suffix.toLowerCase()}sw4fpay0`;
  }
  return `0x${suffix}C2b8D7E6F4A9B0C1D2E3F4`;
}

// ── GET /api/transactions/status/:id  (public — no auth) ─────────────────────

router.get("/transactions/status/:id", async (req, res, next) => {
  try {
    const [tx] = await db
      .select({ status: transactionsTable.status })
      .from(transactionsTable)
      .where(eq(transactionsTable.id, req.params.id))
      .limit(1);

    if (!tx) {
      res.status(404).json({ message: "Transaction introuvable." });
      return;
    }
    res.json({ status: tx.status });
  } catch (error) {
    next(error);
  }
});

// ── GET /api/transactions/search?q=  (public — no auth) ──────────────────────
// Accepts: phone number OR reference in the form swift-XXXXXXXX-YYYYYYYY
// Returns sanitized data (phone masked, no userId exposed)

router.get("/transactions/search", async (req, res, next) => {
  try {
    const q = (req.query.q as string | undefined)?.trim() ?? "";
    if (!q) {
      res.status(400).json({ message: "Paramètre q requis." });
      return;
    }

    let condition;

    // Reference format: swift-XXXXXXXX-YYYYYYYY where YYYYYYYY = tx.id.slice(0,8)
    const refMatch = q.match(/swift-[^-]+-([0-9a-f]{8})/i);
    if (refMatch) {
      const prefix = refMatch[1].toLowerCase();
      // UUID column — must cast to text before LIKE
      condition = sql`${transactionsTable.id}::text like ${prefix + '%'}`;
    } else {
      // Search by phone — strip spaces/dots for loose matching
      const digits = q.replace(/[\s.\-]/g, "");
      condition = or(
        ilike(transactionsTable.recipientPhone, `%${q}%`),
        ilike(transactionsTable.recipientPhone, `%${digits}%`),
      );
    }

    const rows = await db
      .select({
        id: transactionsTable.id,
        status: transactionsTable.status,
        recipientPhone: transactionsTable.recipientPhone,
        network: transactionsTable.network,
        networkFlag: transactionsTable.networkFlag,
        countryName: transactionsTable.countryName,
        amountFcfa: transactionsTable.amountFcfa,
        amountCrypto: transactionsTable.amountCrypto,
        cryptoCurrency: transactionsTable.cryptoCurrency,
        createdAt: transactionsTable.createdAt,
      })
      .from(transactionsTable)
      .where(condition)
      .orderBy(desc(transactionsTable.createdAt))
      .limit(5);

    const transactions = rows.map((tx) => {
      // Mask phone: show first 3 and last 2 digits, hide the rest
      const p = tx.recipientPhone.replace(/\s/g, "");
      const masked =
        p.length > 5
          ? `${p.slice(0, 3)}${"*".repeat(p.length - 5)}${p.slice(-2)}`
          : tx.recipientPhone;

      return {
        id: tx.id,
        ref: `swift-0283729-${tx.id.slice(0, 8)}`,
        status: tx.status,
        phone: masked,
        network: tx.network,
        networkFlag: tx.networkFlag,
        countryName: tx.countryName,
        amountFcfa: tx.amountFcfa,
        amountCrypto: tx.amountCrypto,
        cryptoCurrency: tx.cryptoCurrency,
        createdAt: tx.createdAt,
      };
    });

    res.json({ transactions });
  } catch (error) {
    next(error);
  }
});

// ── GET /api/transactions ─────────────────────────────────────────────────────

router.get("/transactions", async (req, res, next) => {
  try {
    const user = await requireUser(req.headers.authorization);

    const { period, status } = req.query as Record<string, string | undefined>;

    const conditions = [eq(transactionsTable.userId, user.id)];

    if (period && period !== "all") {
      const now = new Date();
      let startDate: Date;
      if (period === "jour") {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (period === "semaine") {
        const d = new Date(now);
        d.setDate(d.getDate() - d.getDay());
        d.setHours(0, 0, 0, 0);
        startDate = d;
      } else if (period === "mois") {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      } else {
        // année
        startDate = new Date(now.getFullYear(), 0, 1);
      }
      conditions.push(gte(transactionsTable.createdAt, startDate));
    }

    if (status && status !== "all") {
      conditions.push(eq(transactionsTable.status, status));
    }

    const transactions = await db
      .select()
      .from(transactionsTable)
      .where(and(...conditions))
      .orderBy(desc(transactionsTable.createdAt));

    res.json({ transactions });
  } catch (error) {
    next(error);
  }
});

// ── GET /api/transactions/stats ───────────────────────────────────────────────

router.get("/transactions/stats", async (req, res, next) => {
  try {
    const user = await requireUser(req.headers.authorization);

    const rows = await db
      .select()
      .from(transactionsTable)
      .where(eq(transactionsTable.userId, user.id));

    const totalSent = rows
      .filter((t) => t.status === "completed")
      .reduce((acc, t) => acc + t.amountFcfa, 0);
    const totalCount = rows.length;
    const pendingCount = rows.filter((t) => t.status === "pending").length;
    const countriesCount = new Set(rows.map((t) => t.countryCode)).size;

    res.json({ totalSent, totalCount, pendingCount, countriesCount });
  } catch (error) {
    next(error);
  }
});

// ── GET /api/transactions/:id ─────────────────────────────────────────────────

router.get("/transactions/:id", async (req, res, next) => {
  try {
    const user = await requireUser(req.headers.authorization);
    const { id } = req.params;

    const [tx] = await db
      .select()
      .from(transactionsTable)
      .where(
        and(
          eq(transactionsTable.id, id),
          eq(transactionsTable.userId, user.id),
        ),
      )
      .limit(1);

    if (!tx) {
      res.status(404).json({ message: "Transaction introuvable." });
      return;
    }
    res.json({ transaction: tx });
  } catch (error) {
    next(error);
  }
});

// ── POST /api/transactions ────────────────────────────────────────────────────

router.post("/transactions", async (req, res, next) => {
  try {
    // Guest-friendly: attach user if logged in, but don't require it
    let userId: string | null = null;
    try {
      const token = getBearerToken(req.headers.authorization);
      const user = await getUserFromToken(token);
      if (user) userId = user.id;
    } catch {
      // no valid session — proceed as guest
    }

    const {
      recipient,
      recipientPhone,
      countryCode,
      countryName,
      networkFlag,
      network,
      amountFcfa,
      amountCrypto,
      cryptoCurrency,
      cryptoNetwork,
      assetCode,
      rate,
      fee,
    } = req.body as Record<string, unknown>;

    if (
      typeof recipient !== "string" ||
      typeof recipientPhone !== "string" ||
      typeof countryCode !== "string" ||
      typeof countryName !== "string" ||
      typeof networkFlag !== "string" ||
      typeof network !== "string" ||
      typeof amountFcfa !== "number" ||
      typeof amountCrypto !== "number" ||
      typeof cryptoCurrency !== "string" ||
      typeof assetCode !== "string" ||
      typeof rate !== "number" ||
      typeof fee !== "number" ||
      amountFcfa <= 0
    ) {
      res.status(400).json({ message: "Données de transaction invalides." });
      return;
    }

    const [tx] = await db
      .insert(transactionsTable)
      .values({
        userId: userId ?? undefined,
        recipient: recipient.trim(),
        recipientPhone: recipientPhone.trim(),
        countryCode: countryCode.trim(),
        countryName: countryName.trim(),
        networkFlag: networkFlag.trim(),
        network: network.trim(),
        amountFcfa,
        amountCrypto,
        cryptoCurrency: cryptoCurrency.trim(),
        cryptoNetwork: typeof cryptoNetwork === "string" ? cryptoNetwork.trim() : null,
        assetCode: assetCode.trim(),
        rate,
        fee,
        status: "pending",
      })
      .returning();

    // Call AshtechPay to generate a deposit address for the selected asset.
    // Falls back to a deterministic placeholder if ASHTECHPAY_API_KEY is not set.
    let paymentAddress: string;
    let paymentMemo: string | null = null;
    let ashpayTxId: string | undefined;

    if (ashIsConfigured()) {
      try {
        const { logger } = await import("../lib/logger.js");
        const deployedDomain = process.env.REPLIT_DEV_DOMAIN ?? process.env.REPLIT_DOMAINS?.split(",")[0];
        const notifyUrl = deployedDomain
          ? `https://${deployedDomain}/webhooks/ashtechpay`
          : undefined;

        const collect = await createCollect({
          asset_code: tx.assetCode ?? assetCode.trim(),
          amount: (amountCrypto as number) + (fee as number), // total the customer sends
          reference: tx.id,
          notify_url: notifyUrl,
        });

        paymentAddress = collect.address;
        paymentMemo = collect.memo ?? null;
        ashpayTxId = collect.transaction_id;
        logger.info({ txId: tx.id, ashpayTxId }, "AshtechPay deposit address created");
      } catch (err) {
        // Log but don't fail the transaction — degrade to placeholder
        const { logger } = await import("../lib/logger.js");
        logger.error({ err }, "Failed to create AshtechPay collect address");
        paymentAddress = generatePaymentAddress(tx.assetCode ?? tx.cryptoCurrency, tx.id);
      }
    } else {
      paymentAddress = generatePaymentAddress(tx.assetCode ?? tx.cryptoCurrency, tx.id);
    }

    const [updated] = await db
      .update(transactionsTable)
      .set({ paymentAddress, paymentMemo, intentId: ashpayTxId })
      .where(eq(transactionsTable.id, tx.id))
      .returning();

    // Auto-create a notification only for authenticated users
    if (userId) {
      await db.insert(notificationsTable).values({
        userId,
        type: "transaction",
        title: `Transfert vers ${updated.recipient}`,
        message: `Votre transfert de ${updated.amountFcfa.toLocaleString("fr-FR")} FCFA est en cours de traitement.`,
        details: `Vous avez envoyé ${updated.amountCrypto} ${updated.cryptoCurrency} via ${updated.network} en ${updated.countryName}. Nous vous notifierons dès que le paiement sera confirmé.`,
        read: false,
        actionLabel: "Suivre le transfert",
        actionHref: `/transactions/${updated.id}`,
      });
    }

    res.status(201).json({ transaction: updated });
  } catch (error) {
    next(error);
  }
});

export default router;
