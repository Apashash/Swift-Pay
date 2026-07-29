import { Router, type IRouter } from "express";
import { and, desc, eq, sql } from "drizzle-orm";
import {
  db,
  kycSubmissionsTable,
  notificationsTable,
  transactionsTable,
  usersTable,
} from "@workspace/db";
import { requireAdmin, toPublicUser } from "../lib/auth";

const router: IRouter = Router();

router.get("/admin/overview", async (req, res, next) => {
  try {
    await requireAdmin(req.headers.authorization);
    const [userStats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        verified: sql<number>`count(*) filter (where ${usersTable.verified} = true)::int`,
      })
      .from(usersTable);
    const [transactionStats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        pending: sql<number>`count(*) filter (where ${transactionsTable.status} = 'pending')::int`,
        volume: sql<number>`coalesce(sum(${transactionsTable.amountFcfa}) filter (where ${transactionsTable.status} = 'completed'), 0)::int`,
      })
      .from(transactionsTable);
    const [kycStats] = await db
      .select({
        pending: sql<number>`count(*) filter (where ${kycSubmissionsTable.status} = 'pending')::int`,
        approved: sql<number>`count(*) filter (where ${kycSubmissionsTable.status} = 'approved')::int`,
      })
      .from(kycSubmissionsTable);
    res.json({
      users: userStats ?? { total: 0, verified: 0 },
      transactions: transactionStats ?? { total: 0, pending: 0, volume: 0 },
      kyc: kycStats ?? { pending: 0, approved: 0 },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/admin/users", async (req, res, next) => {
  try {
    await requireAdmin(req.headers.authorization);
    const users = await db
      .select()
      .from(usersTable)
      .orderBy(desc(usersTable.joinedAt));
    res.json({ users: users.map(toPublicUser) });
  } catch (error) {
    next(error);
  }
});

router.get("/admin/transactions", async (req, res, next) => {
  try {
    await requireAdmin(req.headers.authorization);
    const rows = await db
      .select({
        id: transactionsTable.id,
        userId: transactionsTable.userId,
        recipient: transactionsTable.recipient,
        recipientPhone: transactionsTable.recipientPhone,
        countryCode: transactionsTable.countryCode,
        countryName: transactionsTable.countryName,
        networkFlag: transactionsTable.networkFlag,
        network: transactionsTable.network,
        amountFcfa: transactionsTable.amountFcfa,
        amountCrypto: transactionsTable.amountCrypto,
        cryptoCurrency: transactionsTable.cryptoCurrency,
        rate: transactionsTable.rate,
        fee: transactionsTable.fee,
        status: transactionsTable.status,
        txHash: transactionsTable.txHash,
        paymentAddress: transactionsTable.paymentAddress,
        createdAt: transactionsTable.createdAt,
        updatedAt: transactionsTable.updatedAt,
        customer: usersTable.fullName,
      })
      .from(transactionsTable)
      .innerJoin(usersTable, eq(transactionsTable.userId, usersTable.id))
      .orderBy(desc(transactionsTable.createdAt));
    res.json({ transactions: rows });
  } catch (error) {
    next(error);
  }
});

router.get("/admin/kyc", async (req, res, next) => {
  try {
    await requireAdmin(req.headers.authorization);
    const rows = await db
      .select({
        id: kycSubmissionsTable.id,
        userId: kycSubmissionsTable.userId,
        name: usersTable.fullName,
        email: usersTable.email,
        country: usersTable.country,
        description: kycSubmissionsTable.description,
        status: kycSubmissionsTable.status,
        submittedAt: kycSubmissionsTable.submittedAt,
      })
      .from(kycSubmissionsTable)
      .innerJoin(usersTable, eq(kycSubmissionsTable.userId, usersTable.id))
      .orderBy(desc(kycSubmissionsTable.submittedAt));
    res.json({ submissions: rows });
  } catch (error) {
    next(error);
  }
});

router.patch("/admin/transactions/:id", async (req, res, next) => {
  try {
    await requireAdmin(req.headers.authorization);
    const { status } = req.body as { status?: string };
    if (status !== "completed" && status !== "pending" && status !== "failed") {
      res.status(400).json({ message: "Statut de transaction invalide." });
      return;
    }
    const [tx] = await db
      .update(transactionsTable)
      .set({ status, updatedAt: new Date() })
      .where(eq(transactionsTable.id, req.params.id))
      .returning();
    if (!tx) {
      res.status(404).json({ message: "Transaction introuvable." });
      return;
    }
    res.json({ transaction: tx });
  } catch (error) {
    next(error);
  }
});

router.patch("/admin/users/:id/role", async (req, res, next) => {
  try {
    await requireAdmin(req.headers.authorization);
    const { role } = req.body as { role?: string };
    if (role !== "admin" && role !== "user") {
      res.status(400).json({ message: "Rôle invalide. Valeurs acceptées : 'admin' ou 'user'." });
      return;
    }
    const [updated] = await db
      .update(usersTable)
      .set({ role })
      .where(eq(usersTable.id, req.params.id))
      .returning();
    if (!updated) {
      res.status(404).json({ message: "Utilisateur introuvable." });
      return;
    }
    res.json({ user: toPublicUser(updated) });
  } catch (error) {
    next(error);
  }
});

router.patch("/admin/kyc/:id", async (req, res, next) => {
  try {
    await requireAdmin(req.headers.authorization);
    const status = req.body?.status;
    if (status !== "approved" && status !== "rejected") {
      res.status(400).json({ message: "Statut KYC invalide." });
      return;
    }
    const [submission] = await db
      .update(kycSubmissionsTable)
      .set({ status })
      .where(eq(kycSubmissionsTable.id, req.params.id))
      .returning();
    if (!submission) {
      res.status(404).json({ message: "Dossier KYC introuvable." });
      return;
    }
    await db
      .update(usersTable)
      .set({ verified: status === "approved" })
      .where(eq(usersTable.id, submission.userId));
    res.json({ submission });
  } catch (error) {
    next(error);
  }
});

// ── GET /admin/notifications — all users' notifications ───────────────────────
router.get("/admin/notifications", async (req, res, next) => {
  try {
    await requireAdmin(req.headers.authorization);
    const rows = await db
      .select({
        id: notificationsTable.id,
        userId: notificationsTable.userId,
        type: notificationsTable.type,
        title: notificationsTable.title,
        message: notificationsTable.message,
        details: notificationsTable.details,
        read: notificationsTable.read,
        actionLabel: notificationsTable.actionLabel,
        actionHref: notificationsTable.actionHref,
        createdAt: notificationsTable.createdAt,
        userFullName: usersTable.fullName,
        userEmail: usersTable.email,
        userAvatar: usersTable.avatar,
      })
      .from(notificationsTable)
      .innerJoin(usersTable, eq(notificationsTable.userId, usersTable.id))
      .orderBy(desc(notificationsTable.createdAt));

    const notifications = rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      type: r.type,
      title: r.title,
      message: r.message,
      details: r.details,
      read: r.read,
      actionLabel: r.actionLabel,
      actionHref: r.actionHref,
      createdAt: r.createdAt,
      user: { id: r.userId, fullName: r.userFullName, email: r.userEmail, avatar: r.userAvatar },
    }));

    res.json({ notifications });
  } catch (error) {
    next(error);
  }
});

// ── DELETE /admin/notifications/all ──────────────────────────────────────────
router.delete("/admin/notifications/all", async (req, res, next) => {
  try {
    await requireAdmin(req.headers.authorization);
    await db.delete(notificationsTable);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

// ── DELETE /admin/notifications/:id ──────────────────────────────────────────
router.delete("/admin/notifications/:id", async (req, res, next) => {
  try {
    await requireAdmin(req.headers.authorization);
    const { id } = req.params;
    const [deleted] = await db
      .delete(notificationsTable)
      .where(eq(notificationsTable.id, id))
      .returning();
    if (!deleted) {
      res.status(404).json({ message: "Notification introuvable." });
      return;
    }
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

export default router;