import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Leads table for event registration interest
export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 20 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  event: varchar("event", { length: 100 }).default("TOP Destemidos Pioneiros").notNull(),
  status: mysqlEnum("status", ["new", "contacted", "registered", "confirmed"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

// Testimonials table
export const testimonials = mysqlTable("testimonials", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  event: varchar("event", { length: 100 }).notNull(),
  quote: text("quote").notNull(),
  avatarUrl: text("avatarUrl"),
  rating: int("rating").default(5).notNull(),
  featured: int("featured").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Orders table - tracks Stripe checkout sessions
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  leadId: int("leadId"),
  stripeSessionId: varchar("stripeSessionId", { length: 255 }).notNull().unique(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  event: varchar("event", { length: 100 }).default("TOP Destemidos Pioneiros").notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["pix", "card"]).notNull(),
  status: mysqlEnum("orderStatus", ["pending", "paid", "failed", "refunded"]).default("pending").notNull(),
  amountCents: int("amountCents").notNull(),
  customerName: varchar("customerName", { length: 255 }),
  customerEmail: varchar("customerEmail", { length: 320 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// ============================================================
// SISTEMA DE INSCRIÇÃO COMPLETA (Formulário Multi-Step)
// ============================================================

// Churches - Igrejas e comunidades religiosas
export const churches = mysqlTable("churches", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  denomination: varchar("denomination", { length: 100 }).notNull(),
  pastorName: varchar("pastorName", { length: 255 }),
  address: text("address"),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 2 }),
  phone: varchar("phone", { length: 20 }),
  whatsapp: varchar("whatsapp", { length: 20 }),
  createdBy: int("createdBy"),
  isVerified: int("isVerified").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Church = typeof churches.$inferSelect;
export type InsertChurch = typeof churches.$inferInsert;

// Spiritual Leaders - Líderes espirituais (pastores, apóstolos, discipuladores)
export const spiritualLeaders = mysqlTable("spiritual_leaders", {
  id: int("id").autoincrement().primaryKey(),
  title: mysqlEnum("title", ["Pastor", "Apostolo", "Bispo", "Presbitero", "Discipulador", "Lider", "Padre", "Outro"]).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  churchId: int("churchId"),
  phone: varchar("phone", { length: 20 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 20 }).notNull(),
  email: varchar("email", { length: 320 }),
  createdBy: int("createdBy"),
  isVerified: int("isVerified").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SpiritualLeader = typeof spiritualLeaders.$inferSelect;
export type InsertSpiritualLeader = typeof spiritualLeaders.$inferInsert;

// Registrations - Inscrição completa (participante ou servo)
export const registrations = mysqlTable("registrations", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("regType", ["participante", "servo"]).notNull(),
  event: varchar("event", { length: 100 }).default("TOP 1870").notNull(),
  status: mysqlEnum("regStatus", ["draft", "submitted", "approved", "rejected"]).default("draft").notNull(),

  // Dados Pessoais
  fullName: varchar("fullName", { length: 255 }).notNull(),
  cpf: varchar("cpf", { length: 14 }).notNull(),
  rg: varchar("rg", { length: 20 }),
  birthDate: varchar("birthDate", { length: 10 }).notNull(),
  maritalStatus: mysqlEnum("maritalStatus", ["solteiro", "casado", "divorciado", "viuvo", "uniao_estavel"]).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 20 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  address: text("address").notNull(),
  neighborhood: varchar("neighborhood", { length: 100 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 2 }).notNull(),
  zipCode: varchar("zipCode", { length: 9 }).notNull(),
  profession: varchar("profession", { length: 100 }),
  shirtSize: mysqlEnum("shirtSize", ["PP", "P", "M", "G", "GG", "XG", "XXG"]).notNull(),

  // Dados Médicos
  bloodType: mysqlEnum("bloodType", ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "nao_sei"]).notNull(),
  hasAllergy: int("hasAllergy").default(0).notNull(),
  allergyDetails: text("allergyDetails"),
  hasMedication: int("hasMedication").default(0).notNull(),
  medicationDetails: text("medicationDetails"),
  hasChronicDisease: int("hasChronicDisease").default(0).notNull(),
  chronicDiseaseDetails: text("chronicDiseaseDetails"),
  hasPhysicalRestriction: int("hasPhysicalRestriction").default(0).notNull(),
  physicalRestrictionDetails: text("physicalRestrictionDetails"),
  hasFoodRestriction: int("hasFoodRestriction").default(0).notNull(),
  foodRestrictionDetails: text("foodRestrictionDetails"),
  healthInsurance: varchar("healthInsurance", { length: 100 }),
  healthObservations: text("healthObservations"),

  // Dados Eclesiásticos
  churchId: int("churchId"),
  churchName: varchar("churchName", { length: 255 }),
  denomination: varchar("denomination", { length: 100 }),
  spiritualLeaderId: int("spiritualLeaderId"),
  memberSince: varchar("memberSince", { length: 10 }),
  ministryRole: varchar("ministryRole", { length: 100 }),
  baptized: int("baptized").default(0).notNull(),
  baptizedHolySpirit: int("baptizedHolySpirit").default(0).notNull(),

  // Dados Específicos de Servo
  servantRole: varchar("servantRole", { length: 100 }),
  previousTops: int("previousTops").default(0),
  legendaryNumber: varchar("legendaryNumber", { length: 20 }),

  // Metadados
  userId: int("userId"),
  leadId: int("leadId"),
  orderId: int("orderId"),
  submittedAt: timestamp("submittedAt"),
  approvedAt: timestamp("approvedAt"),
  approvedBy: int("approvedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Registration = typeof registrations.$inferSelect;
export type InsertRegistration = typeof registrations.$inferInsert;

// Emergency Contacts - Contatos de emergência vinculados a uma inscrição
export const emergencyContacts = mysqlTable("emergency_contacts", {
  id: int("id").autoincrement().primaryKey(),
  registrationId: int("registrationId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  relationship: mysqlEnum("relationship", ["esposa", "mae", "pai", "irmao", "irma", "filho", "filha", "tio", "tia", "avo", "outro"]).notNull(),
  relationshipOther: varchar("relationshipOther", { length: 100 }),
  phone: varchar("phone", { length: 20 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 20 }).notNull(),
  email: varchar("email", { length: 320 }),
  isAuthorizationContact: int("isAuthorizationContact").default(0).notNull(),
  isPrimaryContact: int("isPrimaryContact").default(0).notNull(),
  city: varchar("city", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmergencyContact = typeof emergencyContacts.$inferSelect;
export type InsertEmergencyContact = typeof emergencyContacts.$inferInsert;

// WhatsApp Messages - Mensagens de autorização enviadas e respostas recebidas
export const whatsappMessages = mysqlTable("whatsapp_messages", {
  id: int("id").autoincrement().primaryKey(),
  registrationId: int("registrationId").notNull(),
  contactId: int("contactId").notNull(),
  recipientType: mysqlEnum("recipientType", ["familiar", "lider_espiritual"]).notNull(),
  recipientName: varchar("recipientName", { length: 255 }).notNull(),
  recipientWhatsapp: varchar("recipientWhatsapp", { length: 20 }).notNull(),
  templateId: int("templateId"),
  messageContent: text("messageContent").notNull(),
  status: mysqlEnum("msgStatus", ["queued", "sent", "delivered", "read", "responded", "failed", "expired"]).default("queued").notNull(),
  sentAt: timestamp("sentAt"),
  deliveredAt: timestamp("deliveredAt"),
  readAt: timestamp("readAt"),
  respondedAt: timestamp("respondedAt"),
  responseType: mysqlEnum("responseType", ["text", "audio", "image", "video", "document"]),
  responseContent: text("responseContent"),
  responseStorageKey: varchar("responseStorageKey", { length: 255 }),
  authorizationStatus: mysqlEnum("authorizationStatus", ["pending", "authorized", "denied", "unclear"]).default("pending"),
  authorizationNotes: text("authorizationNotes"),
  processedBy: int("processedBy"),
  processedAt: timestamp("processedAt"),
  retryCount: int("retryCount").default(0),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WhatsappMessage = typeof whatsappMessages.$inferSelect;
export type InsertWhatsappMessage = typeof whatsappMessages.$inferInsert;

// Message Templates - Templates editáveis para mensagens de autorização
export const messageTemplates = mysqlTable("message_templates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  type: mysqlEnum("templateType", ["autorizacao_familiar", "autorizacao_lider", "confirmacao", "lembrete"]).notNull(),
  targetAudience: mysqlEnum("targetAudience", ["esposa", "mae_responsavel", "lider_espiritual", "todos"]).notNull(),
  content: text("content").notNull(),
  isActive: int("isActive").default(1).notNull(),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MessageTemplate = typeof messageTemplates.$inferSelect;
export type InsertMessageTemplate = typeof messageTemplates.$inferInsert;

// App Settings - Configurações dinâmicas da aplicação (WhatsApp, evento, mensagens, geral)
export const appSettings = mysqlTable("app_settings", {
  id: int("id").autoincrement().primaryKey(),
  category: varchar("category", { length: 50 }).notNull(),
  key: varchar("key", { length: 100 }).notNull(),
  value: text("value"),
  label: varchar("label", { length: 200 }).notNull(),
  description: text("description"),
  fieldType: mysqlEnum("fieldType", ["text", "password", "textarea", "number", "boolean", "select", "date"]).default("text").notNull(),
  isEncrypted: int("isEncrypted").default(0).notNull(),
  isRequired: int("isRequired").default(0).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  updatedBy: int("updatedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type AppSetting = typeof appSettings.$inferSelect;
export type InsertAppSetting = typeof appSettings.$inferInsert;
