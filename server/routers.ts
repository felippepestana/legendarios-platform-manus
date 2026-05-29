import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { createLead, getLeads, getLeadsFiltered, updateLeadStatus, getFeaturedTestimonials, getAllTestimonials, createTestimonial, updateTestimonial, deleteTestimonial, createRegistration, getRegistrations, getRegistrationById, updateRegistrationStatus, createChurch, listChurches, searchChurches, createSpiritualLeader, listSpiritualLeaders, searchSpiritualLeaders, createEmergencyContact, getEmergencyContactsByRegistration, getWhatsappDashboardStats, getWhatsappMessagesByRegistration } from "./db";
import { notifyOwner } from "./_core/notification";
import { createCheckoutSession } from "./stripe";
import { PRODUCTS } from "./stripe-products";
import { sendAuthorizationMessage } from "./whatsapp";
import { createWhatsappMessage } from "./db";
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

    list: adminProcedure
      .input(z.object({
        status: z.enum(["new", "contacted", "registered", "confirmed"]).optional(),
        city: z.string().optional(),
        search: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        return getLeadsFiltered(input);
      }),
    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["new", "contacted", "registered", "confirmed"]),
      }))
      .mutation(async ({ input }) => {
        return updateLeadStatus(input.id, input.status);
      }),
    exportCsv: adminProcedure
      .input(z.object({
        status: z.enum(["new", "contacted", "registered", "confirmed"]).optional(),
        city: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        const data = await getLeadsFiltered(input);
        const header = "ID,Nome,Email,WhatsApp,Cidade,Evento,Status,Data Cadastro";
        const rows = data.map((l: any) => 
          `${l.id},"${l.name}","${l.email}","${l.whatsapp}","${l.city}","${l.event}","${l.status}","${l.createdAt}"`
        );
        return { csv: [header, ...rows].join("\n"), count: data.length };
      }),
  }),

  checkout: router({
    createSession: publicProcedure
      .input(
        z.object({
          paymentMethod: z.enum(["pix", "card"]),
          customerName: z.string().optional(),
          customerEmail: z.string().email().optional(),
          origin: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const product = input.paymentMethod === "pix" ? PRODUCTS.TOP_PIX : PRODUCTS.TOP_CARD;

        const result = await createCheckoutSession({
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

        return result;
      }),
  }),

  testimonials: router({
    featured: publicProcedure.query(async () => {
      return getFeaturedTestimonials();
    }),

    all: publicProcedure.query(async () => {
      return getAllTestimonials();
    }),

    create: adminProcedure
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

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(2).optional(),
          city: z.string().min(2).optional(),
          event: z.string().min(2).optional(),
          quote: z.string().min(10).optional(),
          avatarUrl: z.string().nullable().optional(),
          rating: z.number().min(1).max(5).optional(),
          featured: z.number().min(0).max(1).optional(),
        })
      )
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

  registration: router({
    create: publicProcedure
      .input(
        z.object({
          type: z.enum(["participante", "servo"]),
          personal: z.object({
            fullName: z.string().min(2),
            cpf: z.string().min(11),
            rg: z.string().optional(),
            birthDate: z.string(),
            maritalStatus: z.string(),
            phone: z.string().min(10),
            whatsapp: z.string().min(10),
            email: z.string().email(),
            address: z.string(),
            neighborhood: z.string(),
            city: z.string(),
            state: z.string().max(2),
            zipCode: z.string(),
            profession: z.string().optional(),
            shirtSize: z.string(),
          }),
          medical: z.object({
            bloodType: z.string(),
            hasAllergy: z.number(),
            allergyDetails: z.string().optional(),
            hasMedication: z.number(),
            medicationDetails: z.string().optional(),
            hasChronicDisease: z.number(),
            chronicDiseaseDetails: z.string().optional(),
            hasPhysicalRestriction: z.number(),
            physicalRestrictionDetails: z.string().optional(),
            hasFoodRestriction: z.number(),
            foodRestrictionDetails: z.string().optional(),
            healthInsurance: z.string().optional(),
            healthObservations: z.string().optional(),
          }),
          emergencyContacts: z.array(z.object({
            name: z.string().min(2),
            relationship: z.string(),
            relationshipOther: z.string().optional(),
            phone: z.string().min(10),
            whatsapp: z.string().min(10),
            email: z.string().optional(),
            city: z.string().optional(),
            isAuthorizationContact: z.number(),
            isPrimaryContact: z.number(),
          })),
          church: z.object({
            churchId: z.number().optional(),
            churchName: z.string().optional(),
            denomination: z.string().optional(),
            memberSince: z.string().optional(),
            ministryRole: z.string().optional(),
            baptized: z.number(),
            baptizedHolySpirit: z.number(),
            newChurch: z.boolean().optional(),
          }),
          servant: z.object({
            servantRole: z.string().optional(),
            previousTops: z.number().optional(),
            legendaryNumber: z.string().optional(),
            spiritualLeaderId: z.number().optional(),
            newLeader: z.object({
              title: z.string(),
              name: z.string(),
              phone: z.string(),
              whatsapp: z.string(),
              email: z.string().optional(),
            }).optional(),
          }).optional(),
        })
      )
      .mutation(async ({ input }) => {
        // Create church if new
        let churchId = input.church.churchId;
        if (input.church.newChurch && input.church.churchName) {
          const newChurch = await createChurch({
            name: input.church.churchName,
            denomination: input.church.denomination || "Outra",
            city: input.personal.city,
            state: input.personal.state,
          });
          if (newChurch) churchId = newChurch.id;
        }

        // Create spiritual leader if new (servo only)
        let spiritualLeaderId: number | undefined;
        if (input.servant?.newLeader) {
          const newLeader = await createSpiritualLeader({
            title: input.servant.newLeader.title as any,
            name: input.servant.newLeader.name,
            phone: input.servant.newLeader.phone,
            whatsapp: input.servant.newLeader.whatsapp,
            email: input.servant.newLeader.email,
            churchId: churchId || undefined,
          });
          if (newLeader) spiritualLeaderId = newLeader.id;
        } else if (input.servant?.spiritualLeaderId) {
          spiritualLeaderId = input.servant.spiritualLeaderId;
        }

        // Create registration
        const reg = await createRegistration({
          type: input.type,
          status: "submitted",
          fullName: input.personal.fullName,
          cpf: input.personal.cpf,
          rg: input.personal.rg,
          birthDate: input.personal.birthDate,
          maritalStatus: input.personal.maritalStatus as any,
          phone: input.personal.phone,
          whatsapp: input.personal.whatsapp,
          email: input.personal.email,
          address: input.personal.address,
          neighborhood: input.personal.neighborhood,
          city: input.personal.city,
          state: input.personal.state,
          zipCode: input.personal.zipCode,
          profession: input.personal.profession,
          shirtSize: input.personal.shirtSize as any,
          bloodType: input.medical.bloodType as any,
          hasAllergy: input.medical.hasAllergy,
          allergyDetails: input.medical.allergyDetails,
          hasMedication: input.medical.hasMedication,
          medicationDetails: input.medical.medicationDetails,
          hasChronicDisease: input.medical.hasChronicDisease,
          chronicDiseaseDetails: input.medical.chronicDiseaseDetails,
          hasPhysicalRestriction: input.medical.hasPhysicalRestriction,
          physicalRestrictionDetails: input.medical.physicalRestrictionDetails,
          hasFoodRestriction: input.medical.hasFoodRestriction,
          foodRestrictionDetails: input.medical.foodRestrictionDetails,
          healthInsurance: input.medical.healthInsurance,
          healthObservations: input.medical.healthObservations,
          churchId: churchId,
          churchName: input.church.churchName,
          denomination: input.church.denomination,
          spiritualLeaderId: spiritualLeaderId,
          memberSince: input.church.memberSince,
          ministryRole: input.church.ministryRole,
          baptized: input.church.baptized,
          baptizedHolySpirit: input.church.baptizedHolySpirit,
          servantRole: input.servant?.servantRole,
          previousTops: input.servant?.previousTops,
          legendaryNumber: input.servant?.legendaryNumber,
          submittedAt: new Date(),
        });

        // Create emergency contacts
        if (reg) {
          for (const contact of input.emergencyContacts) {
            await createEmergencyContact({
              registrationId: reg.id,
              name: contact.name,
              relationship: contact.relationship as any,
              relationshipOther: contact.relationshipOther,
              phone: contact.phone,
              whatsapp: contact.whatsapp,
              email: contact.email,
              city: contact.city,
              isAuthorizationContact: contact.isAuthorizationContact,
              isPrimaryContact: contact.isPrimaryContact,
            });
          }
        }

        // Dispatch WhatsApp authorization messages
        if (reg) {
          const authContacts = input.emergencyContacts.filter(c => c.isAuthorizationContact);
          for (const contact of authContacts) {
            try {
              const result = await sendAuthorizationMessage({
                contactName: contact.name,
                contactWhatsapp: contact.whatsapp,
                participantName: input.personal.fullName,
                eventName: "TOP 1870 — Destemidos Pioneiros",
                relationship: contact.relationship,
                type: "familiar",
              });
              await createWhatsappMessage({
                registrationId: reg.id,
                contactId: 0, // Will be linked after contact creation
                recipientType: "familiar",
                recipientName: contact.name,
                recipientWhatsapp: contact.whatsapp,
                messageContent: `Mensagem de autorização enviada para ${contact.name} (${contact.relationship})`,
                status: result.success ? "sent" : "failed",
                sentAt: result.success ? new Date() : undefined,
              });
            } catch (e) {
              console.warn("[WhatsApp] Falha ao enviar para familiar:", e);
            }
          }

          // For servos, also send to spiritual leader
          if (input.type === "servo" && spiritualLeaderId && input.servant?.newLeader) {
            try {
              const leaderResult = await sendAuthorizationMessage({
                contactName: input.servant.newLeader.name,
                contactWhatsapp: input.servant.newLeader.whatsapp,
                participantName: input.personal.fullName,
                eventName: "TOP 1870 — Destemidos Pioneiros",
                relationship: "Líder Espiritual",
                type: "lider_espiritual",
              });
              await createWhatsappMessage({
                registrationId: reg.id,
                contactId: 0,
                recipientType: "lider_espiritual",
                recipientName: input.servant.newLeader.name,
                recipientWhatsapp: input.servant.newLeader.whatsapp,
                messageContent: `Mensagem de autorização enviada para líder ${input.servant.newLeader.name}`,
                status: leaderResult.success ? "sent" : "failed",
                sentAt: leaderResult.success ? new Date() : undefined,
              });
            } catch (e) {
              console.warn("[WhatsApp] Falha ao enviar para líder:", e);
            }
          }
        }

        // Notify owner
        try {
          await notifyOwner({
            title: `Nova Inscrição: ${input.personal.fullName} (${input.type})`,
            content: `Nome: ${input.personal.fullName}\nTipo: ${input.type}\nCidade: ${input.personal.city}/${input.personal.state}\nWhatsApp: ${input.personal.whatsapp}\nIgreja: ${input.church.churchName || "Selecionada"}`,
          });
        } catch (e) {
          console.warn("[Notification] Failed:", e);
        }

        return { success: true, registrationId: reg?.id };
      }),

    list: adminProcedure
      .input(z.object({ type: z.enum(["participante", "servo"]).optional() }).optional())
      .query(async ({ input }) => {
        return getRegistrations(input?.type);
      }),

    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const reg = await getRegistrationById(input.id);
        const contacts = reg ? await getEmergencyContactsByRegistration(reg.id) : [];
        const messages = reg ? await getWhatsappMessagesByRegistration(reg.id) : [];
        return { registration: reg, emergencyContacts: contacts, messages };
      }),

    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["draft", "submitted", "approved", "rejected"]),
      }))
      .mutation(async ({ input, ctx }) => {
        await updateRegistrationStatus(input.id, input.status, ctx.user.id);
        return { success: true };
      }),

    listChurches: publicProcedure
      .input(z.object({ city: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return listChurches(input?.city);
      }),

    searchChurches: publicProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        return searchChurches(input.query);
      }),

    listSpiritualLeaders: publicProcedure
      .input(z.object({ churchId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return listSpiritualLeaders(input?.churchId);
      }),

    searchSpiritualLeaders: publicProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        return searchSpiritualLeaders(input.query);
      }),

    whatsappDashboard: adminProcedure.query(async () => {
      return getWhatsappDashboardStats();
    }),
  }),
});

export type AppRouter = typeof appRouter;
