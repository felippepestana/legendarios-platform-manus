import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { createLead, getLeads, getLeadsFiltered, updateLeadStatus, getFeaturedTestimonials, getAllTestimonials, createTestimonial, updateTestimonial, deleteTestimonial, createRegistration, getRegistrations, getRegistrationById, updateRegistrationStatus, createChurch, listChurches, searchChurches, createSpiritualLeader, listSpiritualLeaders, searchSpiritualLeaders, createEmergencyContact, getEmergencyContactsByRegistration, getWhatsappDashboardStats, getWhatsappMessagesByRegistration, getAllSettings, getSettingsByCategory, upsertSetting, updateSettingValue, deleteSetting, createCheckin, getCheckinByToken, getCheckinByRegistrationId, performCheckin, manualCheckin, cancelCheckin, getAllCheckins, getCheckinStats } from "./db";
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

  settings: router({
    getAll: adminProcedure.query(async () => {
      return getAllSettings();
    }),
    getByCategory: adminProcedure
      .input(z.object({ category: z.string() }))
      .query(async ({ input }) => {
        return getSettingsByCategory(input.category);
      }),
    upsert: adminProcedure
      .input(z.object({
        category: z.string(),
        key: z.string(),
        value: z.string().nullable(),
        label: z.string(),
        description: z.string().optional(),
        fieldType: z.enum(["text", "password", "textarea", "number", "boolean", "select", "date"]).optional(),
        isEncrypted: z.number().optional(),
        isRequired: z.number().optional(),
        sortOrder: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return upsertSetting({ ...input, updatedBy: ctx.user.id });
      }),
    updateValue: adminProcedure
      .input(z.object({ id: z.number(), value: z.string().nullable() }))
      .mutation(async ({ input, ctx }) => {
        return updateSettingValue(input.id, input.value, ctx.user.id);
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return deleteSetting(input.id);
      }),
    seed: adminProcedure.mutation(async ({ ctx }) => {
      const defaults = [
        { category: "whatsapp", key: "phone_number_id", label: "Phone Number ID", description: "ID do numero de telefone no WhatsApp Business API (Meta Business Manager > WhatsApp > API Setup)", fieldType: "text", isRequired: 1, sortOrder: 1 },
        { category: "whatsapp", key: "access_token", label: "Access Token", description: "Token de acesso permanente do WhatsApp Business API", fieldType: "password", isEncrypted: 1, isRequired: 1, sortOrder: 2 },
        { category: "whatsapp", key: "verify_token", label: "Verify Token", description: "Token de verificacao do webhook (qualquer string segura)", fieldType: "password", isEncrypted: 1, isRequired: 1, sortOrder: 3 },
        { category: "whatsapp", key: "business_account_id", label: "Business Account ID", description: "ID da conta business no Meta (opcional)", fieldType: "text", isRequired: 0, sortOrder: 4 },
        { category: "evento", key: "nome_evento", label: "Nome do Evento", description: "Nome do proximo TOP", fieldType: "text", isRequired: 1, sortOrder: 1 },
        { category: "evento", key: "data_inicio", label: "Data de Inicio", description: "Data de inicio do evento (YYYY-MM-DD)", fieldType: "date", isRequired: 1, sortOrder: 2 },
        { category: "evento", key: "data_fim", label: "Data de Termino", description: "Data de termino do evento (YYYY-MM-DD)", fieldType: "date", isRequired: 1, sortOrder: 3 },
        { category: "evento", key: "local", label: "Local do Evento", description: "Cidade/Estado onde ocorrera o evento", fieldType: "text", isRequired: 1, sortOrder: 4 },
        { category: "evento", key: "vagas_participantes", label: "Vagas Participantes", description: "Numero maximo de participantes", fieldType: "number", isRequired: 0, sortOrder: 5 },
        { category: "evento", key: "vagas_servos", label: "Vagas Servos", description: "Numero maximo de servos", fieldType: "number", isRequired: 0, sortOrder: 6 },
        { category: "mensagens", key: "msg_autorizacao_familiar", label: "Mensagem Autorizacao Familiar", description: "Template da mensagem enviada ao familiar. Variaveis: {nome}, {evento}, {data_inicio}, {data_fim}, {local}", fieldType: "textarea", isRequired: 1, sortOrder: 1 },
        { category: "mensagens", key: "msg_autorizacao_lider", label: "Mensagem Autorizacao Lider", description: "Template da mensagem enviada ao lider espiritual. Variaveis: {nome}, {evento}, {data_inicio}, {data_fim}, {local}, {igreja}", fieldType: "textarea", isRequired: 1, sortOrder: 2 },
        { category: "mensagens", key: "msg_confirmacao_inscricao", label: "Mensagem Confirmacao", description: "Mensagem enviada ao inscrito apos confirmacao. Variaveis: {nome}, {evento}, {data_inicio}", fieldType: "textarea", isRequired: 0, sortOrder: 3 },
        { category: "geral", key: "whatsapp_atendimento", label: "WhatsApp Atendimento", description: "Numero do WhatsApp para atendimento (com codigo do pais)", fieldType: "text", isRequired: 1, sortOrder: 1 },
        { category: "geral", key: "email_contato", label: "Email de Contato", description: "Email para contato geral", fieldType: "text", isRequired: 0, sortOrder: 2 },
        { category: "geral", key: "instagram_url", label: "Instagram", description: "URL do perfil no Instagram", fieldType: "text", isRequired: 0, sortOrder: 3 },
      ];
      for (const setting of defaults) {
        await upsertSetting({ ...setting, value: null, updatedBy: ctx.user.id } as any);
      }
      return { success: true, count: defaults.length };
    }),
  }),

  // ─── Check-in Router ───────────────────────────────────────────────────────
  checkin: router({
    // Generate QR Code for a registration
    generate: adminProcedure.input(z.object({ registrationId: z.number() })).mutation(async ({ input }) => {
      const { randomBytes } = await import("crypto");
      const QRCode = await import("qrcode");
      
      // Check if already has a checkin
      const existing = await getCheckinByRegistrationId(input.registrationId);
      if (existing) {
        return { checkin: existing, alreadyExists: true };
      }
      
      // Generate unique token
      const token = randomBytes(32).toString("hex");
      
      // Generate QR Code as data URL
      const qrDataUrl = await QRCode.toDataURL(
        JSON.stringify({ token, registrationId: input.registrationId, type: "legendarios_checkin" }),
        { width: 400, margin: 2, color: { dark: "#000000", light: "#ffffff" } }
      );
      
      const checkin = await createCheckin({
        registrationId: input.registrationId,
        qrCodeToken: token,
        qrCodeDataUrl: qrDataUrl,
      });
      
      return { checkin, alreadyExists: false };
    }),

    // Get checkin info by registration ID (for confirmation page)
    getByRegistration: protectedProcedure.input(z.object({ registrationId: z.number() })).query(async ({ input }) => {
      return getCheckinByRegistrationId(input.registrationId);
    }),

    // Validate QR Code and perform check-in
    validate: protectedProcedure.input(z.object({ token: z.string() })).mutation(async ({ ctx, input }) => {
      const checkin = await getCheckinByToken(input.token);
      if (!checkin) {
        return { success: false, error: "QR Code inv\u00e1lido. Token n\u00e3o encontrado.", checkin: null };
      }
      if (checkin.status === "checked_in") {
        return { success: false, error: "Este participante j\u00e1 realizou o check-in.", checkin };
      }
      if (checkin.status === "cancelled") {
        return { success: false, error: "Esta inscri\u00e7\u00e3o foi cancelada.", checkin: null };
      }
      
      const updated = await performCheckin(input.token, ctx.user.id);
      // Get registration details
      const registration = await getRegistrationById(checkin.registrationId);
      return { success: true, error: null, checkin: updated, registration };
    }),

    // Manual check-in by admin
    manualCheckin: adminProcedure.input(z.object({ registrationId: z.number(), notes: z.string().optional() })).mutation(async ({ ctx, input }) => {
      const result = await manualCheckin(input.registrationId, ctx.user.id, input.notes);
      if (!result) {
        return { success: false, error: "Inscri\u00e7\u00e3o n\u00e3o encontrada ou sem QR Code gerado." };
      }
      return { success: true, checkin: result };
    }),

    // Cancel a checkin
    cancel: adminProcedure.input(z.object({ token: z.string() })).mutation(async ({ input }) => {
      await cancelCheckin(input.token);
      return { success: true };
    }),

    // List all check-ins (admin dashboard)
    list: adminProcedure.query(async () => {
      return getAllCheckins();
    }),

    // Get check-in stats
    stats: adminProcedure.query(async () => {
      return getCheckinStats();
    }),

    // Generate QR Codes in bulk for all confirmed registrations
    generateBulk: adminProcedure.mutation(async () => {
      const { randomBytes } = await import("crypto");
      const QRCode = await import("qrcode");
      const registrations = await getRegistrations();
      const confirmed = registrations.filter((r: any) => r.status === "confirmed");
      let generated = 0;
      
      for (const reg of confirmed) {
        const existing = await getCheckinByRegistrationId(reg.id);
        if (!existing) {
          const token = randomBytes(32).toString("hex");
          const qrDataUrl = await QRCode.toDataURL(
            JSON.stringify({ token, registrationId: reg.id, type: "legendarios_checkin" }),
            { width: 400, margin: 2, color: { dark: "#000000", light: "#ffffff" } }
          );
          await createCheckin({ registrationId: reg.id, qrCodeToken: token, qrCodeDataUrl: qrDataUrl });
          generated++;
        }
      }
      
      return { success: true, generated, total: confirmed.length };
    }),
  }),
});
export type AppRouter = typeof appRouter;
