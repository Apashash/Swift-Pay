import { Router, type IRouter } from "express";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db, transactionsTable, usersTable, authSessionsTable } from "@workspace/db";
import { getBearerToken, getUserFromToken } from "../lib/auth";

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
    const user = await requireUser(req.headers.authorization);

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
        userId: user.id,
        recipient: recipient.trim(),
        recipientPhone: recipientPhone.trim(),
        countryCode: countryCode.trim(),
        countryName: countryName.trim(),
        networkFlag: networkFlag.trim(),
        network: network.trim(),
        amountFcfa,
        amountCrypto,
        cryptoCurrency: cryptoCurrency.trim(),
        rate,
        fee,
        status: "pending",
      })
      .returning();

    // Assign a payment address now that we have the ID
    const paymentAddress = generatePaymentAddress(tx.cryptoCurrency, tx.id);
    const [updated] = await db
      .update(transactionsTable)
      .set({ paymentAddress })
      .where(eq(transactionsTable.id, tx.id))
      .returning();

    res.status(201).json({ transaction: updated });
  } catch (error) {
    next(error);
  }
});

export default router;
