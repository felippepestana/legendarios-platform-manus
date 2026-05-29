import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

// Mock db functions for deterministic tests
vi.mock("./db", () => {
  const testimonials = [
    {
      id: 1,
      name: "Thiago Oliveira",
      city: "Porto Velho/RO",
      event: "TOP 1670 Destemidos Pioneiros",
      quote: "O TOP não é físico, é espiritual! Só quem vive o processo, o caminho, entenderá.",
      avatarUrl: null,
      rating: 5,
      featured: 1,
      createdAt: new Date("2026-04-20"),
    },
    {
      id: 2,
      name: "Marcos Antônio",
      city: "Balneário Camboriú/SC",
      event: "TOP Vale Europeu",
      quote: "IMPOSSÍVEL explicar, só vivendo! Participar do TOP foi a decisão mais corajosa que já tomei.",
      avatarUrl: null,
      rating: 5,
      featured: 1,
      createdAt: new Date("2026-04-21"),
    },
    {
      id: 3,
      name: "Rafael Mendes",
      city: "Porto Velho/RO",
      event: "TOP 1570 Destemidos Pioneiros",
      quote: "Cheguei ao TOP achando que era só uma trilha na Amazônia. Saí entendendo que era uma jornada de volta para Deus.",
      avatarUrl: null,
      rating: 5,
      featured: 0,
      createdAt: new Date("2026-02-15"),
    },
  ];

  return {
    createLead: vi.fn().mockImplementation((input: any) => {
      return Promise.resolve({ id: 1, ...input, status: "new", createdAt: new Date(), updatedAt: new Date() });
    }),
    getLeads: vi.fn().mockResolvedValue([
      { id: 1, name: "Test Lead", email: "test@test.com", whatsapp: "69999999999", city: "Porto Velho/RO", event: "TOP Destemidos Pioneiros", status: "new", createdAt: new Date(), updatedAt: new Date() },
    ]),
    getFeaturedTestimonials: vi.fn().mockResolvedValue(
      testimonials.filter((t) => t.featured === 1)
    ),
    getAllTestimonials: vi.fn().mockResolvedValue(testimonials),
    createTestimonial: vi.fn().mockResolvedValue(undefined),
    getLeadsFiltered: vi.fn().mockResolvedValue([
      { id: 1, name: "Test Lead", email: "test@test.com", whatsapp: "69999999999", city: "Porto Velho/RO", event: "TOP Destemidos Pioneiros", status: "new", createdAt: new Date(), updatedAt: new Date() },
    ]),
    updateLeadStatus: vi.fn().mockResolvedValue(undefined),
  };
});

// Mock notification to avoid real calls
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

// Mock stripe to avoid real calls
vi.mock("./stripe", () => ({
  createCheckoutSession: vi.fn().mockResolvedValue({
    url: "https://checkout.stripe.com/test",
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
    stripeCustomerId: null,
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

beforeEach(() => {
  vi.clearAllMocks();
});

describe("leads.create", () => {
  it("creates a lead with valid data", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.leads.create({
      name: "Test User",
      email: "test@example.com",
      whatsapp: "69999999999",
      city: "Porto Velho/RO",
      event: "TOP Destemidos Pioneiros",
    });

    expect(result).toHaveProperty("success", true);
    expect(result).toHaveProperty("lead");
    expect(result.lead).toHaveProperty("name", "Test User");
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
  it("returns only featured testimonials", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.testimonials.featured();

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
    result.forEach((t: any) => {
      expect(t.featured).toBe(1);
      expect(t).toHaveProperty("name");
      expect(t).toHaveProperty("quote");
      expect(t).toHaveProperty("city");
      expect(t).toHaveProperty("event");
      expect(t).toHaveProperty("rating");
    });
  });
});

describe("testimonials.all", () => {
  it("returns all testimonials", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.testimonials.all();

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(3);
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
    expect(result).toHaveLength(1);
  });

  it("accepts filter parameters", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.leads.list({ status: "new" });
    expect(Array.isArray(result)).toBe(true);
  });

  it("accepts city filter", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.leads.list({ city: "Porto Velho/RO" });
    expect(Array.isArray(result)).toBe(true);
  });

  it("accepts search filter", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.leads.list({ search: "Test" });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("leads.exportCsv (protected)", () => {
  it("requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.leads.exportCsv()).rejects.toThrow();
  });

  it("returns CSV string with headers", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.leads.exportCsv();
    expect(result).toHaveProperty("csv");
    expect(result).toHaveProperty("count");
    expect(result.csv).toContain("ID,Nome,Email,WhatsApp,Cidade,Evento,Status,Data Cadastro");
    expect(result.count).toBeGreaterThan(0);
  });

  it("respects filters in CSV export", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.leads.exportCsv({ status: "new" });
    expect(result).toHaveProperty("csv");
    expect(result.csv).toContain("ID,Nome,Email,WhatsApp,Cidade,Evento,Status,Data Cadastro");
  });
});

describe("leads.updateStatus (protected)", () => {
  it("requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.leads.updateStatus({ id: 1, status: "contacted" })).rejects.toThrow();
  });

  it("updates lead status when authenticated", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Should not throw - mutation completes successfully
    await expect(
      caller.leads.updateStatus({ id: 1, status: "contacted" })
    ).resolves.not.toThrow();
  });
});
