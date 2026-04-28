import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AdminUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const adminUser: AdminUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user: adminUser,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  const regularUser: AdminUser = {
    id: 2,
    openId: "regular-user",
    email: "user@example.com",
    name: "Regular User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user: regularUser,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("admin routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("admin.metrics", () => {
    it("should allow admin to fetch metrics", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const metrics = await caller.admin.metrics();

      expect(metrics).toBeDefined();
      expect(metrics).toHaveProperty("totalLeads");
      expect(metrics).toHaveProperty("totalOrders");
      expect(metrics).toHaveProperty("totalRevenueCents");
      expect(metrics).toHaveProperty("leadsByCity");
      expect(metrics).toHaveProperty("leadsByStatus");
    });

    it("should reject non-admin users", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.admin.metrics();
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });
  });

  describe("admin.leads", () => {
    it("should allow admin to fetch leads", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const leads = await caller.admin.leads({ city: "", event: "", status: "" });

      expect(Array.isArray(leads)).toBe(true);
    });

    it("should reject non-admin users", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.admin.leads({});
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });
  });

  describe("admin.updateLeadStatus", () => {
    it("should allow admin to update lead status", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.admin.updateLeadStatus({
        id: 1,
        status: "contacted",
      });

      expect(result).toEqual({ success: true });
    });

    it("should reject non-admin users", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.admin.updateLeadStatus({ id: 1, status: "contacted" });
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });
  });

  describe("admin.orders", () => {
    it("should allow admin to fetch orders", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const orders = await caller.admin.orders();

      expect(Array.isArray(orders)).toBe(true);
    });

    it("should reject non-admin users", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.admin.orders();
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });
  });

  describe("admin.testimonials", () => {
    it("should allow admin to fetch testimonials", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const testimonials = await caller.admin.testimonials();

      expect(Array.isArray(testimonials)).toBe(true);
    });

    it("should reject non-admin users", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.admin.testimonials();
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });
  });

  describe("testimonials.delete", () => {
    it("should allow admin to delete testimonials", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.testimonials.delete({ id: 1 });

      expect(result).toEqual({ success: true });
    });

    it("should reject non-admin users", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.testimonials.delete({ id: 1 });
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });
  });

  describe("whatsapp routes", () => {
    it("should generate welcome link for public users", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.whatsapp.getWelcomeLink({
        name: "João",
        event: "TOP Destemidos Pioneiros",
        phone: "5592999999999",
      });

      expect(result).toHaveProperty("url");
      expect(result).toHaveProperty("message");
      expect(result.url).toContain("wa.me");
      expect(result.message).toContain("João");
    });

    it("should generate reminder link for admin", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.whatsapp.getReminderLink({
        name: "Maria",
        phone: "5592999999999",
        eventDate: "15 de maio",
        location: "Porto Velho/RO",
      });

      expect(result).toHaveProperty("url");
      expect(result).toHaveProperty("message");
      expect(result.url).toContain("wa.me");
      expect(result.message).toContain("Maria");
    });
  });
});
