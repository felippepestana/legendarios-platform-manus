import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import {
  createLead, getLeads, getLeadsFiltered, updateLeadStatus,
  getFeaturedTestimonials, getAllTestimonials, createTestimonial, updateTestimonial, deleteTestimonial,
  getAdminMetrics, getOrders,
} from "./db";
import { notifyOwner } from "./_core/notification";
import { createCheckoutSession } from "./stripe";
import { PRODUCTS } from "./stripe-products";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Leads ────────────────────────────────────────────────
  leads: router({
    create: publicProcedure
      .input(z.object({
        name: z.string().min(2, "Nome é obrigatório"),
        email: z.string().email("E-mail inválido"),
        whatsapp: z.string().min(10, "WhatsApp inválido"),
        city: z.string().min(2, "Cidade é obrigatória"),
        event: z.string().default("TOP Destemidos Pioneiros"),
      }))
      .mutation(async ({ input }) => {
        const lead = await createLead(input);
        try {
          await notifyOwner({
            title: `🔥 Novo Lead: ${input.name}`,
            content: `Nome: ${input.name}\nE-mail: ${input.email}\nWhatsApp: ${input.whatsapp}\nCidade: ${input.city}\nEvento: ${input.event}`,
          });
        } catch (e) {
          console.warn("[Notification] Failed to notify owner:", e);
        }
        return { success: true, lead };
      }),

    list: protectedProcedure.query(async () => getLeads()),
  }),

  // ─── Checkout ─────────────────────────────────────────────
  checkout: router({
    createSession: publicProcedure
      .input(z.object({
        paymentMethod: z.enum(["pix", "card"]),
        customerName: z.string().optional(),
        customerEmail: z.string().email().optional(),
        origin: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const product = input.paymentMethod === "pix" ? PRODUCTS.TOP_PIX : PRODUCTS.TOP_CARD;
        return createCheckoutSession({
          productName: product.name,
          description: product.description,
          amountCents: product.amountCents,
          currency: product.currency,
          paymentMethod: input.paymentMethod,
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          userId: ctx.user?.id,
          origin: input.origin,
        });
      }),
  }),

  // ─── Testimonials ─────────────────────────────────────────
  testimonials: router({
    featured: publicProcedure.query(async () => getFeaturedTestimonials()),
    all: publicProcedure.query(async () => getAllTestimonials()),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(2),
        city: z.string().min(2),
        event: z.string().min(2),
        quote: z.string().min(10),
        avatarUrl: z.string().optional(),
        rating: z.number().min(1).max(5).default(5),
        featured: z.number().min(0).max(1).default(0),
      }))
      .mutation(async ({ input }) => {
        await createTestimonial(input);
        return { success: true };
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(2).optional(),
        city: z.string().min(2).optional(),
        event: z.string().min(2).optional(),
        quote: z.string().min(10).optional(),
        avatarUrl: z.string().optional(),
        rating: z.number().min(1).max(5).optional(),
        featured: z.number().min(0).max(1).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateTestimonial(id, data);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteTestimonial(input.id);
        return { success: true };
      }),
  }),

  // ─── Admin ────────────────────────────────────────────────
  admin: router({
    metrics: adminProcedure.query(async () => getAdminMetrics()),

    leads: adminProcedure
      .input(z.object({
        city: z.string().optional(),
        event: z.string().optional(),
        status: z.string().optional(),
      }).optional())
      .query(async ({ input }) => getLeadsFiltered(input ?? {})),

    updateLeadStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["new", "contacted", "registered", "confirmed"]),
      }))
      .mutation(async ({ input }) => {
        await updateLeadStatus(input.id, input.status);
        return { success: true };
      }),

    orders: adminProcedure.query(async () => getOrders()),

    testimonials: adminProcedure.query(async () => getAllTestimonials()),
  }),

  // ─── WhatsApp ─────────────────────────────────────────────
  whatsapp: router({
    getWelcomeLink: publicProcedure
      .input(z.object({
        name: z.string(),
        event: z.string().default("TOP Destemidos Pioneiros"),
        phone: z.string(),
      }))
      .query(({ input }) => {
        const cleanPhone = input.phone.replace(/\D/g, "");
        const message = encodeURIComponent(
          `Olá ${input.name}! 🔥\n\nSeu interesse no *${input.event}* foi registrado com sucesso!\n\nEm breve nossa equipe entrará em contato com todos os detalhes.\n\nBem-vindo à jornada Legendária! 🦁\n\n_Movimento Legendários — Porto Velho/RO_`
        );
        return {
          url: `https://wa.me/${cleanPhone}?text=${message}`,
          message: decodeURIComponent(message),
        };
      }),

    getReminderLink: adminProcedure
      .input(z.object({
        name: z.string(),
        phone: z.string(),
        eventDate: z.string(),
        location: z.string().default("Porto Velho/RO"),
      }))
      .query(({ input }) => {
        const cleanPhone = input.phone.replace(/\D/g, "");
        const message = encodeURIComponent(
          `Olá ${input.name}! 🔥\n\nLembrete do seu evento:\n\n📅 *TOP Destemidos Pioneiros*\n📍 ${input.location}\n🗓️ ${input.eventDate}\n\nPrepare-se! Você está prestes a viver uma experiência transformadora. 🦁\n\n_Movimento Legendários_`
        );
        return {
          url: `https://wa.me/${cleanPhone}?text=${message}`,
          message: decodeURIComponent(message),
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
