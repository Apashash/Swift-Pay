import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db, transactionsTable, notificationsTable } from "@workspace/db";
import { logger } from "../lib/logger";

const router: IRouter = Router();

/**
 * POST /webhooks/oxapay
 *
 * Receives OxaPay payment status callbacks delivered as JSON to the callback_url
 * registered at white-label payment creation time.
 *
 * OxaPay sends the full payment object. We identify the transaction via `order_id`
 * (set to our transaction UUID at creation time).
 *
 * Status mapping:
 *   "paid"              → completed
 *   "expired" / "failed" → failed
 *   anything else       → ignored (e.g. "pending")
 */
router.post(
  "/webhooks/oxapay",
  async (req: Request, res: Response): Promise<void> => {
    // Ack immediately — OxaPay expects HTTP 200 right away
    res.json({ received: true });

    try {
      await processWebhookEvent(req.body as Record<string, unknown>);
    } catch (err) {
      logger.error({ err }, "Error processing OxaPay webhook event");
    }
  },
);

async function processWebhookEvent(payload: Record<string, unknown>) {
  // OxaPay sends `order_id` = our transaction UUID, and `track_id` = OxaPay's own ID
  const status   = payload.status   as string | undefined;
  const orderId  = payload.order_id as string | undefined;
  const trackId  = payload.track_id as string | undefined;

  logger.info({ status, orderId, trackId }, "Processing OxaPay webhook");

  if (!status) {
    logger.warn({ payload }, "OxaPay webhook missing status field");
    return;
  }

  if (!orderId) {
    logger.warn({ payload }, "OxaPay webhook missing order_id field");
    return;
  }

  switch (status) {
    case "paid": {
      // Extract tx_hash from the first transaction in txs array (if present)
      const txs = (payload.txs as Record<string, unknown>[] | undefined) ?? [];
      const txHash = (txs[0]?.tx_hash ?? null) as string | null;

      const [updated] = await db
        .update(transactionsTable)
        .set({
          status: "completed",
          txHash: txHash ?? undefined,
          updatedAt: new Date(),
        })
        .where(eq(transactionsTable.id, orderId))
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

    case "expired":
    case "failed": {
      const [updated] = await db
        .update(transactionsTable)
        .set({ status: "failed", updatedAt: new Date() })
        .where(eq(transactionsTable.id, orderId))
        .returning();

      if (updated?.userId) {
        await db.insert(notificationsTable).values({
          userId: updated.userId,
          type: "info",
          title: status === "expired" ? "Transfert expiré" : "Transfert échoué",
          message: `Votre transfert de ${updated.amountFcfa.toLocaleString("fr-FR")} FCFA n'a pas abouti.`,
          details:
            status === "expired"
              ? "Aucun paiement n'a été reçu dans le délai imparti. Vous pouvez réessayer."
              : "Le paiement a échoué. Vous pouvez réessayer.",
          read: false,
          actionLabel: "Réessayer",
          actionHref: "/",
        });
      }
      break;
    }

    default:
      logger.info({ status }, "OxaPay webhook status ignored (not actionable)");
  }
}

export default router;
