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
    role: text("role").notNull().default("user"), // 'user' | 'admin'
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
      .references(() => usersTable.id, { onDelete: "set null" }),
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

export const notificationsTable = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    type: text("type").notNull().default("info"), // 'transaction' | 'security' | 'info'
    title: text("title").notNull(),
    message: text("message").notNull(),
    details: text("details").notNull().default(""),
    read: boolean("read").notNull().default(false),
    actionLabel: text("action_label"),
    actionHref: text("action_href"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdIdx: index("notifications_user_id_idx").on(table.userId),
    readIdx: index("notifications_read_idx").on(table.read),
    createdAtIdx: index("notifications_created_at_idx").on(table.createdAt),
  }),
);

export const kycSubmissionsTable = pgTable(
  "kyc_submissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    frontPhoto: text("front_photo").notNull(),
    backPhoto: text("back_photo").notNull(),
    selfiePhoto: text("selfie_photo").notNull(),
    description: text("description").notNull(),
    status: text("status").notNull().default("pending"), // 'pending' | 'approved' | 'rejected'
    submittedAt: timestamp("submitted_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdIdx: index("kyc_submissions_user_id_idx").on(table.userId),
    statusIdx: index("kyc_submissions_status_idx").on(table.status),
  }),
);

export type User = typeof usersTable.$inferSelect;
export type Transaction = typeof transactionsTable.$inferSelect;
export type NewTransaction = typeof transactionsTable.$inferInsert;
export type Notification = typeof notificationsTable.$inferSelect;
export type NewNotification = typeof notificationsTable.$inferInsert;
export type KycSubmission = typeof kycSubmissionsTable.$inferSelect;
