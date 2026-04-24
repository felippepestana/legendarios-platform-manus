import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { createLead, getLeads, getFeaturedTestimonials, getAllTestimonials, createTestimonial } from "./db";
import { notifyOwner } from "./_core/notification";
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

  leads: router({
    create: publicProcedure
      .input(
        z.object({
          name: z.string().min(2, "Nome é obrigatório"),
          email: z.string().email("E-mail inválido"),
          whatsapp: z.string().min(10, "WhatsApp inválido"),
          city: z.string().min(2, "Cidade é obrigatória"),
          event: z.string().default("TOP Destemidos Pioneiros"),
        })
      )
      .mutation(async ({ input }) => {
        const lead = await createLead(input);

        // Notify owner about new lead
        try {
          await notifyOwner({
            title: `Novo Lead: ${input.name}`,
            content: `Nome: ${input.name}\nE-mail: ${input.email}\nWhatsApp: ${input.whatsapp}\nCidade: ${input.city}\nEvento: ${input.event}`,
          });
        } catch (e) {
          console.warn("[Notification] Failed to notify owner:", e);
        }

        return { success: true, lead };
      }),

    list: protectedProcedure.query(async () => {
      return getLeads();
    }),
  }),

  testimonials: router({
    featured: publicProcedure.query(async () => {
      return getFeaturedTestimonials();
    }),

    all: publicProcedure.query(async () => {
      return getAllTestimonials();
    }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(2),
          city: z.string().min(2),
          event: z.string().min(2),
          quote: z.string().min(10),
          avatarUrl: z.string().optional(),
          rating: z.number().min(1).max(5).default(5),
          featured: z.number().min(0).max(1).default(0),
        })
      )
      .mutation(async ({ input }) => {
        await createTestimonial(input);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
