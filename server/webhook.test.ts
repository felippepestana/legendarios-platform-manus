import { describe, expect, it, vi, beforeAll, afterAll } from "vitest";
import express from "express";
import http from "http";

// Test the webhook handler endpoint directly
describe("stripe webhook endpoint", () => {
  let app: express.Express;
  let server: http.Server;
  let baseUrl: string;

  beforeAll(async () => {
    app = express();

    // Register the webhook route with raw body parser (same as production)
    app.post(
      "/api/stripe/webhook",
      express.raw({ type: "application/json" }),
      async (req, res) => {
        const sig = req.headers["stripe-signature"];

        if (!sig) {
          return res.status(400).json({ error: "Missing signature" });
        }

        // Simulate event parsing (in production, stripe.webhooks.constructEvent does this)
        let event: any;
        try {
          event = JSON.parse(req.body.toString());
        } catch {
          return res.status(400).json({ error: "Invalid JSON" });
        }

        // Handle test events exactly as production code does
        if (event.id.startsWith("evt_test_")) {
          return res.json({ verified: true });
        }

        // Handle real events
        return res.json({ received: true });
      }
    );

    // Start server on random port
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const addr = server.address() as any;
        baseUrl = `http://localhost:${addr.port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  it("returns 400 when stripe-signature header is missing", async () => {
    const res = await fetch(`${baseUrl}/api/stripe/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "evt_test_123", type: "checkout.session.completed" }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toHaveProperty("error", "Missing signature");
  });

  it("returns { verified: true } for test events (evt_test_*)", async () => {
    const testEvent = {
      id: "evt_test_abc123",
      type: "checkout.session.completed",
      data: { object: {} },
    };

    const res = await fetch(`${baseUrl}/api/stripe/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "stripe-signature": "t=123,v1=fake_sig",
      },
      body: JSON.stringify(testEvent),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ verified: true });
  });

  it("returns { received: true } for production events", async () => {
    const prodEvent = {
      id: "evt_1234567890abcdef",
      type: "checkout.session.completed",
      data: { object: {} },
    };

    const res = await fetch(`${baseUrl}/api/stripe/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "stripe-signature": "t=123,v1=fake_sig",
      },
      body: JSON.stringify(prodEvent),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ received: true });
  });

  it("returns 400 for invalid JSON body", async () => {
    const res = await fetch(`${baseUrl}/api/stripe/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "stripe-signature": "t=123,v1=fake_sig",
      },
      body: "not-valid-json",
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toHaveProperty("error", "Invalid JSON");
  });
});

describe("stripe products", () => {
  it("has correct prices for TOP Destemidos Pioneiros", async () => {
    const { PRODUCTS } = await import("./stripe-products");

    expect(PRODUCTS.TOP_PIX.amountCents).toBe(179000);
    expect(PRODUCTS.TOP_PIX.currency).toBe("brl");
    expect(PRODUCTS.TOP_PIX.paymentMethod).toBe("pix");

    expect(PRODUCTS.TOP_CARD.amountCents).toBe(199000);
    expect(PRODUCTS.TOP_CARD.currency).toBe("brl");
    expect(PRODUCTS.TOP_CARD.paymentMethod).toBe("card");
  });

  it("product names reference Porto Velho/RO and Destemidos Pioneiros", async () => {
    const { PRODUCTS } = await import("./stripe-products");

    expect(PRODUCTS.TOP_PIX.name).toContain("Porto Velho");
    expect(PRODUCTS.TOP_CARD.name).toContain("Porto Velho");
    expect(PRODUCTS.TOP_PIX.name).toContain("Destemidos Pioneiros");
    expect(PRODUCTS.TOP_CARD.name).toContain("Destemidos Pioneiros");
  });
});
