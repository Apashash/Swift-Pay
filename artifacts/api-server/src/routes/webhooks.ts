import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db, transactionsTable, notificationsTable } from "@workspace/db";
import { logger } from "../lib/logger";

const router: IRouter = Router();

/**
 * POST /webhooks/ashtechpay
 *
 * Receives AshtechPay payment events delivered as JSON to the notify_url
 * registered at collect-address creation time.
 *
 * AshtechPay does not sign webhooks — verify by matching transaction_id
 * against our own DB records.
 *
 * Supported events:
 *   payment.completed  → mark transaction completed
 *   payment.failed     → mark transaction failed
 */
router.post(
  "/webhooks/ashtechpay",
  async (req: Request, res: Response): Promise<void> => {
    // Ack immediately — AshtechPay expects HTTP 200 right away
    res.json({ received: true });

    try {
      await processWebhookEvent(req.body as Record<string, unknown>);
    } catch (err) {
      logger.error({ err }, "Error processing AshtechPay webhook event");
    }
  },
);

async function processWebhookEvent(payload: Record<string, unknown>) {
  const event = payload.event as string | undefined;
  // AshtechPay uses our reference (= our transaction UUID) to link back
  const reference = payload.reference as string | undefined;
  // Also available: transaction_id (AshtechPay's own ID)
  const ashpayTxId = payload.transaction_id as string | undefined;

  logger.info({ event, reference, ashpayTxId }, "Processing AshtechPay webhook");

  if (!event) {
    logger.warn({ payload }, "AshtechPay webhook missing event field");
    return;
  }

  // Look up by reference (= our transaction UUID set as reference at creation)
  if (!reference) {
    logger.warn({ payload }, "AshtechPay webhook missing reference field");
    return;
  }

  switch (event) {
    case "payment.completed": {
      const txHash = (payload.tx_hash ?? payload.txHash ?? null) as string | null;

      const [updated] = await db
        .update(transactionsTable)
        .set({
          status: "completed",
          txHash: txHash ?? undefined,
          updatedAt: new Date(),
        })
        .where(eq(transactionsTable.id, reference))
        .returning();

      if (updated?.userId) {
        await db.insert(notificationsTable).values({
          userId: updated.userId,
          type: "transaction",
          title: "Transfert confirmé ✓",
          message: `Votre transfert de ${updated.amountFcfa.toLocaleString("fr-FR")} FCFA vers ${updated.recipient} a été effectué.`,
          details: `${updated.amountCrypto} ${updated.cryptoCurrency} reçus via ${updated.cryptoNetwork ?? updated.cryptoCurrency}. Le destinataire a été crédité.`,
          read: false,
          actionLabel: "Voir la transaction",
          actionHref: `/transactions/${updated.id}`,
        });
      }
      break;
    }

    case "payment.failed": {
      const [updated] = await db
        .update(transactionsTable)
        .set({ status: "failed", updatedAt: new Date() })
        .where(eq(transactionsTable.id, reference))
        .returning();

      if (updated?.userId) {
        await db.insert(notificationsTable).values({
          userId: updated.userId,
          type: "info",
          title: "Transfert échoué",
          message: `Votre transfert de ${updated.amountFcfa.toLocaleString("fr-FR")} FCFA n'a pas abouti.`,
          details: "Aucun paiement n'a été reçu dans le délai imparti. Vous pouvez réessayer.",
          read: false,
          actionLabel: "Réessayer",
          actionHref: "/",
        });
      }
      break;
    }

    default:
      logger.info({ event }, "Unhandled AshtechPay event type (ignored)");
  }
}

export default router;
