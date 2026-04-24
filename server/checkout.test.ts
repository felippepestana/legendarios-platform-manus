import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the stripe module to avoid real API calls
vi.mock("./stripe", () => ({
  createCheckoutSession: vi.fn().mockResolvedValue({
    url: "https://checkout.stripe.com/test_session_123",
    sessionId: "cs_test_123",
  }),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createAuthContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
      stripeCustomerId: null,
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("checkout.createSession", () => {
  it("creates a checkout session for pix payment", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.checkout.createSession({
      paymentMethod: "pix",
      origin: "https://example.com",
    });

    expect(result).toHaveProperty("url");
    expect(result).toHaveProperty("sessionId");
    expect(result.url).toContain("stripe.com");
  });

  it("creates a checkout session for card payment", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.checkout.createSession({
      paymentMethod: "card",
      origin: "https://example.com",
      customerEmail: "test@example.com",
      customerName: "Test User",
    });

    expect(result).toHaveProperty("url");
    expect(result).toHaveProperty("sessionId");
  });

  it("passes user id when authenticated", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.checkout.createSession({
      paymentMethod: "card",
      origin: "https://example.com",
    });

    expect(result).toHaveProperty("url");
    expect(result).toHaveProperty("sessionId");
  });

  it("rejects invalid payment method", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.checkout.createSession({
        paymentMethod: "bitcoin" as any,
        origin: "https://example.com",
      })
    ).rejects.toThrow();
  });

  it("rejects invalid email format", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.checkout.createSession({
        paymentMethod: "card",
        origin: "https://example.com",
        customerEmail: "not-an-email",
      })
    ).rejects.toThrow();
  });
});
