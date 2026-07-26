import { Router, type IRouter } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db, notificationsTable } from "@workspace/db";
import { getBearerToken, getUserFromToken } from "../lib/auth";

const router: IRouter = Router();

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

// ── GET /api/notifications ────────────────────────────────────────────────────

router.get("/notifications", async (req, res, next) => {
  try {
    const user = await requireUser(req.headers.authorization);

    const notifications = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.userId, user.id))
      .orderBy(desc(notificationsTable.createdAt));

    res.json({ notifications });
  } catch (error) {
    next(error);
  }
});

// ── PATCH /api/notifications/:id/read ─────────────────────────────────────────

router.patch("/notifications/:id/read", async (req, res, next) => {
  try {
    const user = await requireUser(req.headers.authorization);
    const { id } = req.params;

    const [updated] = await db
      .update(notificationsTable)
      .set({ read: true })
      .where(
        and(
          eq(notificationsTable.id, id),
          eq(notificationsTable.userId, user.id),
        ),
      )
      .returning();

    if (!updated) {
      res.status(404).json({ message: "Notification introuvable." });
      return;
    }
    res.json({ notification: updated });
  } catch (error) {
    next(error);
  }
});

// ── PATCH /api/notifications/read-all ────────────────────────────────────────

router.patch("/notifications/read-all", async (req, res, next) => {
  try {
    const user = await requireUser(req.headers.authorization);

    await db
      .update(notificationsTable)
      .set({ read: true })
      .where(eq(notificationsTable.userId, user.id));

    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

// ── DELETE /api/notifications/all ────────────────────────────────────────────

router.delete("/notifications/all", async (req, res, next) => {
  try {
    const user = await requireUser(req.headers.authorization);

    await db
      .delete(notificationsTable)
      .where(eq(notificationsTable.userId, user.id));

    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

// ── DELETE /api/notifications/:id ────────────────────────────────────────────

router.delete("/notifications/:id", async (req, res, next) => {
  try {
    const user = await requireUser(req.headers.authorization);
    const { id } = req.params;

    const [deleted] = await db
      .delete(notificationsTable)
      .where(
        and(
          eq(notificationsTable.id, id),
          eq(notificationsTable.userId, user.id),
        ),
      )
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
