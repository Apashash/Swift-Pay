import { Router, type IRouter } from "express";
import { and, desc, eq, sql } from "drizzle-orm";
import {
  db,
  kycSubmissionsTable,
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

export default router;