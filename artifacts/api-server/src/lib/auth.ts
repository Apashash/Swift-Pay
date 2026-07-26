import { createHash, randomBytes, randomUUID, scrypt as nodeScrypt } from "node:crypto";
import { promisify } from "node:util";
import { and, eq, gt, or } from "drizzle-orm";
import { authSessionsTable, usersTable, type User } from "@workspace/db";

const scrypt = promisify(nodeScrypt);
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30;

export type PublicUser = Omit<User, "passwordHash">;

function toPublicUser(user: User): PublicUser {
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const [salt, expectedHex] = storedHash.split(":");
  if (!salt || !expectedHex) return false;
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return derivedKey.toString("hex") === expectedHex;
}

function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string): Promise<string> {
  const token = `${randomUUID()}${randomBytes(24).toString("hex")}`;
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const { db } = await import("@workspace/db");
  await db.insert(authSessionsTable).values({
    userId,
    tokenHash: hashSessionToken(token),
    expiresAt,
  });
  return token;
}

export async function getUserFromToken(token: string | undefined): Promise<PublicUser | null> {
  if (!token) return null;
  const { db } = await import("@workspace/db");
  const rows = await db
    .select({ user: usersTable })
    .from(authSessionsTable)
    .innerJoin(usersTable, eq(authSessionsTable.userId, usersTable.id))
    .where(
      and(
        eq(authSessionsTable.tokenHash, hashSessionToken(token)),
        gt(authSessionsTable.expiresAt, new Date()),
      ),
    )
    .limit(1);
  return rows[0] ? toPublicUser(rows[0].user) : null;
}

export async function deleteSession(token: string | undefined): Promise<void> {
  if (!token) return;
  const { db } = await import("@workspace/db");
  await db
    .delete(authSessionsTable)
    .where(eq(authSessionsTable.tokenHash, hashSessionToken(token)));
}

export function getBearerToken(authorization: string | undefined): string | undefined {
  return authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : undefined;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function normalizePhone(phone: string): string | null {
  const normalized = phone.trim();
  return normalized || null;
}

export async function findUserByIdentifier(identifier: string): Promise<User | null> {
  const { db } = await import("@workspace/db");
  const normalized = identifier.trim();
  const rows = await db
    .select()
    .from(usersTable)
    .where(
      or(
        eq(usersTable.email, normalizeEmail(normalized)),
        eq(usersTable.phone, normalized),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

export { toPublicUser, hashSessionToken };