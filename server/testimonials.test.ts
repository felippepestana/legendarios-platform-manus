import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock DB functions
const mockGetFeaturedTestimonials = vi.fn();
const mockGetAllTestimonials = vi.fn();
const mockCreateTestimonial = vi.fn();
const mockUpdateTestimonial = vi.fn();
const mockDeleteTestimonial = vi.fn();

vi.mock("./db", () => ({
  getFeaturedTestimonials: (...args: any[]) => mockGetFeaturedTestimonials(...args),
  getAllTestimonials: (...args: any[]) => mockGetAllTestimonials(...args),
  createTestimonial: (...args: any[]) => mockCreateTestimonial(...args),
  updateTestimonial: (...args: any[]) => mockUpdateTestimonial(...args),
  deleteTestimonial: (...args: any[]) => mockDeleteTestimonial(...args),
  createLead: vi.fn(),
  getLeads: vi.fn(),
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

vi.mock("./stripe", () => ({
  createCheckoutSession: vi.fn(),
}));

vi.mock("./stripe-products", () => ({
  PRODUCTS: {
    TOP_PIX: { name: "TOP PIX", description: "desc", amountCents: 100, currency: "brl" },
    TOP_CARD: { name: "TOP Card", description: "desc", amountCents: 100, currency: "brl" },
  },
}));

// Import router after mocks
import { appRouter } from "./routers";

const mockAdminUser = { id: 1, openId: "admin-123", name: "Admin", email: "admin@test.com", role: "admin" as const, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(), loginMethod: "email", stripeCustomerId: null };
const mockRegularUser = { id: 2, openId: "user-456", name: "User", email: "user@test.com", role: "user" as const, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(), loginMethod: "email", stripeCustomerId: null };

const createCaller = (user: any) => {
  const mockReq = { headers: { origin: "http://localhost:3000" } } as any;
  const mockRes = { clearCookie: vi.fn() } as any;
  return appRouter.createCaller({ req: mockReq, res: mockRes, user });
};

describe("Testimonials CRUD", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Public endpoints", () => {
    it("should return featured testimonials", async () => {
      const mockData = [
        { id: 1, name: "João", city: "Porto Velho/RO", event: "TOP 1670", quote: "Experiência incrível!", rating: 5, featured: 1, avatarUrl: null, createdAt: new Date() },
      ];
      mockGetFeaturedTestimonials.mockResolvedValue(mockData);

      const caller = createCaller(null);
      const result = await caller.testimonials.featured();

      expect(result).toEqual(mockData);
      expect(mockGetFeaturedTestimonials).toHaveBeenCalledOnce();
    });

    it("should return all testimonials", async () => {
      const mockData = [
        { id: 1, name: "João", city: "Porto Velho/RO", event: "TOP 1670", quote: "Experiência incrível!", rating: 5, featured: 1, avatarUrl: null, createdAt: new Date() },
        { id: 2, name: "Pedro", city: "Manaus/AM", event: "TOP 1670", quote: "Mudou minha vida!", rating: 5, featured: 0, avatarUrl: null, createdAt: new Date() },
      ];
      mockGetAllTestimonials.mockResolvedValue(mockData);

      const caller = createCaller(null);
      const result = await caller.testimonials.all();

      expect(result).toEqual(mockData);
      expect(mockGetAllTestimonials).toHaveBeenCalledOnce();
    });
  });

  describe("Admin-only endpoints", () => {
    it("should create testimonial as admin", async () => {
      mockCreateTestimonial.mockResolvedValue(true);

      const caller = createCaller(mockAdminUser);
      const result = await caller.testimonials.create({
        name: "Carlos",
        city: "Porto Velho/RO",
        event: "TOP 1870",
        quote: "Uma experiência transformadora que mudou minha vida!",
        rating: 5,
        featured: 1,
      });

      expect(result).toEqual({ success: true });
      expect(mockCreateTestimonial).toHaveBeenCalledWith({
        name: "Carlos",
        city: "Porto Velho/RO",
        event: "TOP 1870",
        quote: "Uma experiência transformadora que mudou minha vida!",
        rating: 5,
        featured: 1,
      });
    });

    it("should reject create from regular user", async () => {
      const caller = createCaller(mockRegularUser);

      await expect(
        caller.testimonials.create({
          name: "Carlos",
          city: "Porto Velho/RO",
          event: "TOP 1870",
          quote: "Uma experiência transformadora que mudou minha vida!",
          rating: 5,
          featured: 1,
        })
      ).rejects.toThrow();
    });

    it("should reject create from unauthenticated user", async () => {
      const caller = createCaller(null);

      await expect(
        caller.testimonials.create({
          name: "Carlos",
          city: "Porto Velho/RO",
          event: "TOP 1870",
          quote: "Uma experiência transformadora que mudou minha vida!",
          rating: 5,
          featured: 1,
        })
      ).rejects.toThrow();
    });

    it("should update testimonial as admin", async () => {
      mockUpdateTestimonial.mockResolvedValue(true);

      const caller = createCaller(mockAdminUser);
      const result = await caller.testimonials.update({
        id: 1,
        featured: 0,
        quote: "Texto atualizado do depoimento pelo admin!",
      });

      expect(result).toEqual({ success: true });
      expect(mockUpdateTestimonial).toHaveBeenCalledWith(1, {
        featured: 0,
        quote: "Texto atualizado do depoimento pelo admin!",
      });
    });

    it("should reject update from regular user", async () => {
      const caller = createCaller(mockRegularUser);

      await expect(
        caller.testimonials.update({ id: 1, featured: 0 })
      ).rejects.toThrow();
    });

    it("should delete testimonial as admin", async () => {
      mockDeleteTestimonial.mockResolvedValue(true);

      const caller = createCaller(mockAdminUser);
      const result = await caller.testimonials.delete({ id: 1 });

      expect(result).toEqual({ success: true });
      expect(mockDeleteTestimonial).toHaveBeenCalledWith(1);
    });

    it("should reject delete from regular user", async () => {
      const caller = createCaller(mockRegularUser);

      await expect(
        caller.testimonials.delete({ id: 1 })
      ).rejects.toThrow();
    });
  });
});
