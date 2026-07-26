import {
  boolean,
  doublePrecision,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fullName: text("full_name").notNull(),
    email: text("email").notNull().unique(),
    phone: text("phone").unique(),
    country: text("country").notNull(),
    countryCode: text("country_code").notNull(),
    passwordHash: text("password_hash").notNull(),
    verified: boolean("verified").notNull().default(false),
    avatar: text("avatar"),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    emailIdx: index("users_email_idx").on(table.email),
    phoneIdx: index("users_phone_idx").on(table.phone),
  }),
);

export const authSessionsTable = pgTable(
  "auth_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tokenHashIdx: index("auth_sessions_token_hash_idx").on(table.tokenHash),
    userIdIdx: index("auth_sessions_user_id_idx").on(table.userId),
  }),
);

export const transactionsTable = pgTable(
  "transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    recipient: text("recipient").notNull(),
    recipientPhone: text("recipient_phone").notNull(),
    countryCode: text("country_code").notNull(),
    countryName: text("country_name").notNull(),
    networkFlag: text("network_flag").notNull(),
    network: text("network").notNull(),
    amountFcfa: integer("amount_fcfa").notNull(),
    amountCrypto: doublePrecision("amount_crypto").notNull(),
    cryptoCurrency: text("crypto_currency").notNull(), // 'USDT' | 'BTC'
    rate: doublePrecision("rate").notNull(),
    fee: doublePrecision("fee").notNull(),
    status: text("status").notNull().default("pending"), // 'pending' | 'completed' | 'failed'
    txHash: text("tx_hash"),
    paymentAddress: text("payment_address"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdIdx: index("transactions_user_id_idx").on(table.userId),
    statusIdx: index("transactions_status_idx").on(table.status),
    createdAtIdx: index("transactions_created_at_idx").on(table.createdAt),
  }),
);

export type User = typeof usersTable.$inferSelect;
export type Transaction = typeof transactionsTable.$inferSelect;
export type NewTransaction = typeof transactionsTable.$inferInsert;
