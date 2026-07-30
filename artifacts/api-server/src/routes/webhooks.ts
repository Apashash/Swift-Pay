import { Router, type IRouter, type Request, type Response } from "express";
import { IziPayClient, IziPayWebhookError } from "izichangepay-sdk";
import { eq } from "drizzle-orm";
import { db, transactionsTable, notificationsTable } from "@workspace/db";
import { logger } from "../lib/logger";

const router: IRouter = Router();

/**
 * POST /webhooks/izipay
 *
 * Receives izichange payment events.
 * IMPORTANT: this route must receive the raw body (Buffer) — do NOT parse it
 * with express.json() first. It is mounted in app.ts before the JSON middleware.
 *
 * Supported events:
 *   - payment_intent.completed  → mark transaction completed
 *   - payment_intent.failed     → mark transaction failed
 */
router.post(
  "/webhooks/izipay",
  async (req: Request, res: Response): Promise<void> => {
    const webhookSecret = process.env.IZIPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      logger.warn("IZIPAY_WEBHOOK_SECRET not set — rejecting webhook");
      res.status(500).json({ error: "Webhook not configured." });
      return;
    }

    let event: ReturnType<typeof IziPayClient.validateWebhook>;
    try {
      event = IziPayClient.validateWebhook(
        req.body as Buffer,
        req.headers["x-izipay-signature"] as string,
        webhookSecret,
      );
    } catch (err) {
      if (err instanceof IziPayWebhookError) {
        logger.warn({ reason: err.reason }, "Invalid izichange webhook");
        res.status(400).json({ error: "invalid_webhook" });
        return;
      }
      logger.error({ err }, "Webhook validation error");
      res.status(400).json({ error: "invalid_webhook" });
      return;
    }

    // Acquit immédiatement, traitement en async
    res.json({ received: true });

    try {
      await processWebhookEvent(event);
    } catch (err) {
      logger.error({ err, eventType: event.type }, "Error processing webhook event");
    }
  },
);

async function processWebhookEvent(
  event: ReturnType<typeof IziPayClient.validateWebhook>,
) {
  const data = event.data as Record<string, unknown>;
  // merchantReference = our transaction UUID, set at creation time
  const txId = (data.merchantReference ?? data.intentId) as string | undefined;

  logger.info({ type: event.type, txId }, "Processing izichange webhook event");

  if (!txId) {
    logger.warn({ event }, "Webhook event missing merchantReference");
    return;
  }

  switch (event.type) {
    case "payment_intent.completed": {
      const txHash = (data.txHash ?? data.transactionHash ?? null) as string | null;

      const [updated] = await db
        .update(transactionsTable)
        .set({
          status: "completed",
          txHash: txHash ?? undefined,
          updatedAt: new Date(),
        })
        .where(eq(transactionsTable.id, txId))
        .returning();

      if (updated?.userId) {
        await db.insert(notificationsTable).values({
          userId: updated.userId,
          type: "transaction",
          title: "Transfert confirmé ✓",
          message: `Votre transfert de ${updated.amountFcfa.toLocaleString("fr-FR")} FCFA vers ${updated.recipient} a été effectué.`,
          details: `${updated.amountCrypto} ${updated.cryptoCurrency} reçus via ${updated.network}. Le destinataire a été crédité.`,
          read: false,
          actionLabel: "Voir la transaction",
          actionHref: `/transactions/${updated.id}`,
        });
      }
      break;
    }

    case "payment_intent.failed":
    case "payment_intent.expired": {
      const [updated] = await db
        .update(transactionsTable)
        .set({ status: "failed", updatedAt: new Date() })
        .where(eq(transactionsTable.id, txId))
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
          actionHref: `/`,
        });
      }
      break;
    }

    default:
      logger.info({ type: event.type }, "Unhandled izichange event type (ignored)");
  }
}

export default router;
