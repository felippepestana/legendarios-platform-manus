import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-admin",
    email: "admin@test.com",
    name: "Test Admin",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("leads.create", () => {
  it("creates a lead with valid data", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.leads.create({
      name: "Test User",
      email: `test-${Date.now()}@example.com`,
      whatsapp: "69999999999",
      city: "Porto Velho/RO",
      event: "TOP Destemidos Pioneiros",
    });

    expect(result).toHaveProperty("success", true);
    expect(result).toHaveProperty("lead");
  });

  it("rejects invalid email", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.leads.create({
        name: "Test User",
        email: "invalid-email",
        whatsapp: "69999999999",
        city: "Porto Velho/RO",
        event: "TOP Destemidos Pioneiros",
      })
    ).rejects.toThrow();
  });

  it("rejects empty name", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.leads.create({
        name: "",
        email: "test@example.com",
        whatsapp: "69999999999",
        city: "Porto Velho/RO",
        event: "TOP Destemidos Pioneiros",
      })
    ).rejects.toThrow();
  });
});

describe("testimonials.featured", () => {
  it("returns an array of featured testimonials", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.testimonials.featured();

    expect(Array.isArray(result)).toBe(true);
    if (result.length > 0) {
      expect(result[0]).toHaveProperty("name");
      expect(result[0]).toHaveProperty("quote");
      expect(result[0]).toHaveProperty("city");
      expect(result[0]).toHaveProperty("event");
      expect(result[0]).toHaveProperty("rating");
      expect(result[0].featured).toBe(1);
    }
  });
});

describe("testimonials.all", () => {
  it("returns all testimonials", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.testimonials.all();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThanOrEqual(6); // We seeded 6
  });
});

describe("leads.list (protected)", () => {
  it("requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.leads.list()).rejects.toThrow();
  });

  it("returns leads when authenticated", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.leads.list();
    expect(Array.isArray(result)).toBe(true);
  });
});
