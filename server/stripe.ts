import Stripe from "stripe";
import type { Express, Request, Response } from "express";
import { getDb } from "./db";
import { orders } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";

// Lazy init to avoid crashing when key is not set
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    _stripe = new Stripe(secretKey, { apiVersion: "2025-04-30.basil" as any });
  }
  return _stripe;
}

export interface CreateCheckoutParams {
  productName: string;
  description: string;
  amountCents: number;
  currency: string;
  paymentMethod: "pix" | "card";
  customerName?: string;
  customerEmail?: string;
  userId?: number;
  leadId?: number;
  origin: string;
}

export async function createCheckoutSession(params: CreateCheckoutParams) {
  const stripe = getStripe();

  const paymentMethodTypes: string[] =
    params.paymentMethod === "pix" ? ["pix"] : ["card"];

  const sessionParams: any = {
    mode: "payment",
    payment_method_types: paymentMethodTypes,
    line_items: [
      {
        price_data: {
          currency: params.currency,
          product_data: {
            name: params.productName,
            description: params.description,
          },
          unit_amount: params.amountCents,
        },
        quantity: 1,
      },
    ],
    success_url: `${params.origin}/pagamento/sucesso?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${params.origin}/pagamento/cancelado`,
    allow_promotion_codes: true,
    metadata: {
      event: "TOP Destemidos Pioneiros",
      payment_method: params.paymentMethod,
      user_id: params.userId?.toString() ?? "",
      lead_id: params.leadId?.toString() ?? "",
      customer_name: params.customerName ?? "",
    },
  };

  if (params.customerEmail) {
    sessionParams.customer_email = params.customerEmail;
  }

  if (params.userId) {
    sessionParams.client_reference_id = params.userId.toString();
  }

  const session = await stripe.checkout.sessions.create(sessionParams);

  // Save order to database
  const db = await getDb();
  if (db) {
    await db.insert(orders).values({
      userId: params.userId ?? null,
      leadId: params.leadId ?? null,
      stripeSessionId: session.id,
      event: "TOP Destemidos Pioneiros",
      paymentMethod: params.paymentMethod,
      status: "pending",
      amountCents: params.amountCents,
      customerName: params.customerName ?? null,
      customerEmail: params.customerEmail ?? null,
    });
  }

  return { url: session.url, sessionId: session.id };
}

export function registerStripeWebhook(app: Express) {
  // IMPORTANT: This must be registered BEFORE express.json() middleware
  // But since index.ts already has express.json(), we use express.raw here
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req: Request, res: Response) => {
      const stripe = getStripe();
      const sig = req.headers["stripe-signature"];
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!sig || !webhookSecret) {
        console.warn("[Stripe Webhook] Missing signature or webhook secret");
        return res.status(400).json({ error: "Missing signature or webhook secret" });
      }

      let event: Stripe.Event;

      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          webhookSecret
        );
      } catch (err: any) {
        console.error("[Stripe Webhook] Signature verification failed:", err.message);
        return res.status(400).json({ error: "Webhook signature verification failed" });
      }

      // Handle test events
      if (event.id.startsWith("evt_test_")) {
        console.log("[Stripe Webhook] Test event detected, returning verification response");
        return res.json({ verified: true });
      }

      console.log(`[Stripe Webhook] Received event: ${event.type} (${event.id})`);

      try {
        switch (event.type) {
          case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            const db = await getDb();
            if (db && session.id) {
              await db
                .update(orders)
                .set({
                  status: "paid",
                  stripePaymentIntentId:
                    typeof session.payment_intent === "string"
                      ? session.payment_intent
                      : session.payment_intent?.id ?? null,
                })
                .where(eq(orders.stripeSessionId, session.id));

              // Notify owner
              try {
                await notifyOwner({
                  title: "Novo Pagamento Confirmado!",
                  content: `Pagamento confirmado para ${session.metadata?.customer_name ?? "N/A"}\nEvento: ${session.metadata?.event ?? "TOP Destemidos Pioneiros"}\nValor: R$ ${((session.amount_total ?? 0) / 100).toFixed(2)}`,
                });
              } catch (e) {
                console.warn("[Stripe Webhook] Failed to notify owner:", e);
              }
            }
            break;
          }

          case "payment_intent.payment_failed": {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            const db = await getDb();
            if (db) {
              // Find order by payment intent
              const [order] = await db
                .select()
                .from(orders)
                .where(eq(orders.stripePaymentIntentId, paymentIntent.id))
                .limit(1);
              if (order) {
                await db
                  .update(orders)
                  .set({ status: "failed" })
                  .where(eq(orders.id, order.id));
              }
            }
            break;
          }

          default:
            console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
        }
      } catch (err) {
        console.error("[Stripe Webhook] Error processing event:", err);
      }

      return res.json({ received: true });
    }
  );
}

// Need to import express for express.raw
import express_module from "express";
const express = express_module;
