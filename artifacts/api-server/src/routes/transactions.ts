import { Router, type IRouter } from "express";
import { and, desc, eq, gte, ilike, or, sql } from "drizzle-orm";
import { db, transactionsTable, notificationsTable } from "@workspace/db";
import { getBearerToken, getUserFromToken } from "../lib/auth";
import { createWhiteLabel } from "../lib/oxapay";
import { logger } from "../lib/logger";

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
      email,
      networkLabel,
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

    // Appel OxaPay white-label obligatoire — aucun fallback mock.
    // Si l'API échoue ou la clé est absente, la transaction est supprimée et une erreur est renvoyée.
    let paymentAddress: string;
    let paymentMemo: string | null = null;
    let oxapayTrackId: string | undefined;
    let oxapayQrCode: string | null = null;

    try {
      const deployedDomain = process.env.REPLIT_DEV_DOMAIN ?? process.env.REPLIT_DOMAINS?.split(",")[0];
      const callbackUrl = deployedDomain
        ? `https://${deployedDomain}/webhooks/oxapay`
        : undefined;

      // Email: celui fourni par l'utilisateur si valide, sinon fallback générique
      const payerEmail =
        typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
          ? email.trim()
          : undefined;

      // network_label (human name e.g. "Tron Network") envoyé par le frontend
      const oxaNetwork = typeof networkLabel === "string" ? networkLabel.trim() : undefined;

      const payment = await createWhiteLabel({
        pay_currency: tx.cryptoCurrency,               // e.g. "USDT"
        amount: parseFloat(((amountCrypto as number) + (fee as number)).toFixed(8)),
        network: oxaNetwork,                           // e.g. "Tron Network" (optionnel)
        callback_url: callbackUrl,
        email: payerEmail,
        order_id: tx.id,                               // notre UUID — reçu dans le webhook
        description: `SwiftPay transfer to ${tx.recipientPhone}`,
        lifetime: 60,
      });

      paymentAddress = payment.address;
      paymentMemo = payment.memo && payment.memo !== "" ? payment.memo : null;
      oxapayTrackId = payment.track_id;
      oxapayQrCode = payment.qr_code ?? null;
      logger.info({ txId: tx.id, oxapayTrackId }, "OxaPay white-label payment created");
    } catch (err) {
      // Supprimer la transaction orpheline avant de renvoyer l'erreur
      await db.delete(transactionsTable).where(eq(transactionsTable.id, tx.id)).catch(() => null);
      logger.error({ err }, "OxaPay white-label failed — transaction annulée");
      const message = err instanceof Error ? err.message : "Impossible de générer l'adresse de paiement.";
      const httpErr = Object.assign(new Error(message), { statusCode: 502 });
      throw httpErr;
    }

    const [updated] = await db
      .update(transactionsTable)
      .set({ paymentAddress, paymentMemo, intentId: oxapayTrackId, qrCodeUrl: oxapayQrCode })
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
