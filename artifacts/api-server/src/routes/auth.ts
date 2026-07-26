import { Router, type IRouter } from "express";
import { and, desc, eq, gt, or } from "drizzle-orm";
import {
  authSessionsTable,
  db,
  usersTable,
} from "@workspace/db";
import {
  createSession,
  deleteSession,
  findUserByIdentifier,
  getBearerToken,
  getUserFromToken,
  hashPassword,
  hashSessionToken,
  normalizeEmail,
  normalizePhone,
  toPublicUser,
  verifyPassword,
} from "../lib/auth";

const router: IRouter = Router();

function invalid(message: string): never {
  const error = new Error(message);
  error.name = "ValidationError";
  throw error;
}

router.post("/auth/register", async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      phone,
      country,
      countryCode,
      password,
    } = req.body as Record<string, unknown>;

    if (
      typeof fullName !== "string" ||
      typeof email !== "string" ||
      typeof country !== "string" ||
      typeof countryCode !== "string" ||
      typeof password !== "string" ||
      fullName.trim().length < 2 ||
      !email.includes("@") ||
      password.length < 8
    ) {
      invalid("Les informations d'inscription sont invalides.");
    }

    const normalizedEmail = normalizeEmail(email);
    const normalizedPhone = typeof phone === "string" ? normalizePhone(phone) : null;
    const existing = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(
        normalizedPhone
          ? or(eq(usersTable.email, normalizedEmail), eq(usersTable.phone, normalizedPhone))
          : eq(usersTable.email, normalizedEmail),
      )
      .limit(1);

    if (existing.length > 0) {
      res.status(409).json({ message: "Un compte existe déjà avec cet email ou ce numéro." });
      return;
    }

    const [user] = await db
      .insert(usersTable)
      .values({
        fullName: fullName.trim(),
        email: normalizedEmail,
        phone: normalizedPhone,
        country: country.trim(),
        countryCode: countryCode.trim(),
        passwordHash: await hashPassword(password),
      })
      .returning();

    const token = await createSession(user.id);
    res.status(201).json({ user: toPublicUser(user), token });
  } catch (error) {
    next(error);
  }
});

router.post("/auth/login", async (req, res, next) => {
  try {
    const { identifier, password } = req.body as Record<string, unknown>;
    if (typeof identifier !== "string" || typeof password !== "string") {
      invalid("Identifiants invalides.");
    }

    const user = await findUserByIdentifier(identifier);
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      res.status(401).json({ message: "Identifiants incorrects." });
      return;
    }

    const token = await createSession(user.id);
    res.json({ user: toPublicUser(user), token });
  } catch (error) {
    next(error);
  }
});

router.get("/auth/me", async (req, res, next) => {
  try {
    const user = await getUserFromToken(getBearerToken(req.headers.authorization));
    if (!user) {
      res.status(401).json({ message: "Session expirée." });
      return;
    }
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

router.post("/auth/logout", async (req, res, next) => {
  try {
    await deleteSession(getBearerToken(req.headers.authorization));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.patch("/auth/me", async (req, res, next) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const user = await getUserFromToken(token);
    if (!user) {
      res.status(401).json({ message: "Session expirée." });
      return;
    }

    const { fullName, email, phone, avatar } = req.body as Record<string, unknown>;
    const updates: Partial<typeof usersTable.$inferInsert> = {};
    if (typeof fullName === "string" && fullName.trim()) updates.fullName = fullName.trim();
    if (typeof email === "string" && email.includes("@")) updates.email = normalizeEmail(email);
    if (typeof phone === "string") updates.phone = normalizePhone(phone);
    if (typeof avatar === "string" || avatar === null) updates.avatar = avatar;

    if (Object.keys(updates).length > 0) {
      const conflictWhere =
        updates.email && updates.phone
          ? or(eq(usersTable.email, updates.email), eq(usersTable.phone, updates.phone))
          : updates.email
            ? eq(usersTable.email, updates.email)
            : updates.phone
              ? eq(usersTable.phone, updates.phone)
              : undefined;
      const conflicts = conflictWhere
        ? await db
            .select({ id: usersTable.id })
            .from(usersTable)
            .where(conflictWhere)
            .limit(1)
        : [];
      if (conflicts.some((row) => row.id !== user.id)) {
        res.status(409).json({ message: "Cet email ou ce numéro est déjà utilisé." });
        return;
      }
      const [updated] = await db.update(usersTable).set(updates).where(eq(usersTable.id, user.id)).returning();
      res.json({ user: toPublicUser(updated) });
      return;
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

// POST /auth/password — change password
router.post("/auth/password", async (req, res, next) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const user = await getUserFromToken(token);
    if (!user) {
      res.status(401).json({ message: "Session expirée." });
      return;
    }

    const { currentPassword, newPassword } = req.body as Record<string, unknown>;
    if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
      invalid("Données invalides.");
    }
    if (newPassword.length < 8) {
      res.status(400).json({ message: "Le nouveau mot de passe doit contenir au moins 8 caractères." });
      return;
    }

    const [fullUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, user.id))
      .limit(1);

    if (!fullUser || !(await verifyPassword(currentPassword, fullUser.passwordHash))) {
      res.status(401).json({ message: "Mot de passe actuel incorrect." });
      return;
    }

    await db
      .update(usersTable)
      .set({ passwordHash: await hashPassword(newPassword) })
      .where(eq(usersTable.id, user.id));

    res.json({ message: "Mot de passe modifié avec succès." });
  } catch (error) {
    next(error);
  }
});

// GET /auth/sessions — list active sessions for current user
router.get("/auth/sessions", async (req, res, next) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const user = await getUserFromToken(token);
    if (!user) {
      res.status(401).json({ message: "Session expirée." });
      return;
    }

    const currentHash = token ? hashSessionToken(token) : null;

    const rows = await db
      .select({
        id: authSessionsTable.id,
        createdAt: authSessionsTable.createdAt,
        expiresAt: authSessionsTable.expiresAt,
        tokenHash: authSessionsTable.tokenHash,
      })
      .from(authSessionsTable)
      .where(
        and(
          eq(authSessionsTable.userId, user.id),
          gt(authSessionsTable.expiresAt, new Date()),
        ),
      )
      .orderBy(desc(authSessionsTable.createdAt));

    res.json({
      sessions: rows.map((s) => ({
        id: s.id,
        createdAt: s.createdAt,
        expiresAt: s.expiresAt,
        isCurrent: s.tokenHash === currentHash,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /auth/sessions/:id — revoke a session
router.delete("/auth/sessions/:id", async (req, res, next) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const user = await getUserFromToken(token);
    if (!user) {
      res.status(401).json({ message: "Session expirée." });
      return;
    }

    const { id } = req.params;
    await db
      .delete(authSessionsTable)
      .where(
        and(
          eq(authSessionsTable.id, id),
          eq(authSessionsTable.userId, user.id),
        ),
      );

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;