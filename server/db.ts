import { eq, desc, and, like, SQL } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, leads, InsertLead, Lead, testimonials, appSettings, AppSetting, InsertAppSetting, checkins, Checkin, InsertCheckin } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ─── Lead helpers ──────────────────────────────────────────
export async function createLead(lead: InsertLead): Promise<Lead | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create lead: database not available");
    return null;
  }
  try {
    await db.insert(leads).values(lead);
    const [created] = await db.select().from(leads).where(eq(leads.email, lead.email)).orderBy(desc(leads.createdAt)).limit(1);
    return created ?? null;
  } catch (error) {
    console.error("[Database] Failed to create lead:", error);
    throw error;
  }
}

export async function getLeads() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(leads).orderBy(desc(leads.createdAt));
}

export async function getLeadsFiltered(filters?: { status?: string; city?: string; search?: string }) {
  const db = await getDb();
  if (!db) return [];
  const conditions: SQL[] = [];
  if (filters?.status) conditions.push(eq(leads.status, filters.status as any));
  if (filters?.city) conditions.push(eq(leads.city, filters.city));
  if (filters?.search) conditions.push(like(leads.name, `%${filters.search}%`));
  if (conditions.length === 0) return db.select().from(leads).orderBy(desc(leads.createdAt));
  return db.select().from(leads).where(and(...conditions)).orderBy(desc(leads.createdAt));
}

export async function updateLeadStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) return null;
  await db.update(leads).set({ status: status as any }).where(eq(leads.id, id));
  return { success: true };
}

// ─── Testimonial helpers ───────────────────────────────────
export async function getFeaturedTestimonials() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(testimonials).where(eq(testimonials.featured, 1)).orderBy(desc(testimonials.createdAt));
}

export async function getAllTestimonials() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(testimonials).orderBy(desc(testimonials.createdAt));
}

export async function createTestimonial(data: { name: string; city: string; event: string; quote: string; avatarUrl?: string; rating?: number; featured?: number }) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(testimonials).values(data);
  return true;
}

export async function updateTestimonial(id: number, data: Partial<{ name: string; city: string; event: string; quote: string; avatarUrl: string | null; rating: number; featured: number }>) {
  const db = await getDb();
  if (!db) return null;
  await db.update(testimonials).set(data).where(eq(testimonials.id, id));
  return true;
}

export async function deleteTestimonial(id: number) {
  const db = await getDb();
  if (!db) return null;
  await db.delete(testimonials).where(eq(testimonials.id, id));
  return true;
}

// ─── Registration helpers ─────────────────────────────────
import { registrations, InsertRegistration, Registration, churches, InsertChurch, Church, spiritualLeaders, InsertSpiritualLeader, SpiritualLeader, emergencyContacts, InsertEmergencyContact, EmergencyContact, whatsappMessages, InsertWhatsappMessage, WhatsappMessage, messageTemplates } from "../drizzle/schema";

export async function createRegistration(data: InsertRegistration): Promise<Registration | null> {
  const db = await getDb();
  if (!db) return null;
  try {
    await db.insert(registrations).values(data);
    const [created] = await db.select().from(registrations).where(eq(registrations.cpf, data.cpf)).orderBy(desc(registrations.createdAt)).limit(1);
    return created ?? null;
  } catch (error) {
    console.error("[Database] Failed to create registration:", error);
    throw error;
  }
}

export async function getRegistrations(type?: "participante" | "servo") {
  const db = await getDb();
  if (!db) return [];
  if (type) {
    return db.select().from(registrations).where(eq(registrations.type, type)).orderBy(desc(registrations.createdAt));
  }
  return db.select().from(registrations).orderBy(desc(registrations.createdAt));
}

export async function getRegistrationById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [reg] = await db.select().from(registrations).where(eq(registrations.id, id)).limit(1);
  return reg ?? null;
}

export async function updateRegistrationStatus(id: number, status: "draft" | "submitted" | "approved" | "rejected", approvedBy?: number) {
  const db = await getDb();
  if (!db) return null;
  const updateData: any = { status };
  if (status === "approved") {
    updateData.approvedAt = new Date();
    if (approvedBy) updateData.approvedBy = approvedBy;
  }
  await db.update(registrations).set(updateData).where(eq(registrations.id, id));
  return true;
}

// ─── Church helpers ───────────────────────────────────────
export async function createChurch(data: InsertChurch): Promise<Church | null> {
  const db = await getDb();
  if (!db) return null;
  await db.insert(churches).values(data);
  const [created] = await db.select().from(churches).where(eq(churches.name, data.name)).orderBy(desc(churches.createdAt)).limit(1);
  return created ?? null;
}

export async function listChurches(city?: string) {
  const db = await getDb();
  if (!db) return [];
  if (city) {
    return db.select().from(churches).where(like(churches.city, `%${city}%`)).orderBy(churches.name);
  }
  return db.select().from(churches).orderBy(churches.name);
}

export async function searchChurches(query: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(churches).where(like(churches.name, `%${query}%`)).orderBy(churches.name).limit(20);
}

// ─── Spiritual Leader helpers ─────────────────────────────
export async function createSpiritualLeader(data: InsertSpiritualLeader): Promise<SpiritualLeader | null> {
  const db = await getDb();
  if (!db) return null;
  await db.insert(spiritualLeaders).values(data);
  const [created] = await db.select().from(spiritualLeaders).where(eq(spiritualLeaders.name, data.name)).orderBy(desc(spiritualLeaders.createdAt)).limit(1);
  return created ?? null;
}

export async function listSpiritualLeaders(churchId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (churchId) {
    return db.select().from(spiritualLeaders).where(eq(spiritualLeaders.churchId, churchId)).orderBy(spiritualLeaders.name);
  }
  return db.select().from(spiritualLeaders).orderBy(spiritualLeaders.name);
}

export async function searchSpiritualLeaders(query: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(spiritualLeaders).where(like(spiritualLeaders.name, `%${query}%`)).orderBy(spiritualLeaders.name).limit(20);
}

// ─── Emergency Contact helpers ────────────────────────────
export async function createEmergencyContact(data: InsertEmergencyContact): Promise<EmergencyContact | null> {
  const db = await getDb();
  if (!db) return null;
  await db.insert(emergencyContacts).values(data);
  const [created] = await db.select().from(emergencyContacts).where(eq(emergencyContacts.registrationId, data.registrationId)).orderBy(desc(emergencyContacts.createdAt)).limit(1);
  return created ?? null;
}

export async function getEmergencyContactsByRegistration(registrationId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(emergencyContacts).where(eq(emergencyContacts.registrationId, registrationId));
}

// ─── WhatsApp Message helpers ─────────────────────────────
export async function createWhatsappMessage(data: InsertWhatsappMessage): Promise<WhatsappMessage | null> {
  const db = await getDb();
  if (!db) return null;
  await db.insert(whatsappMessages).values(data);
  return null;
}

export async function getWhatsappMessagesByRegistration(registrationId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(whatsappMessages).where(eq(whatsappMessages.registrationId, registrationId)).orderBy(desc(whatsappMessages.createdAt));
}

export async function updateWhatsappMessageStatus(id: number, data: Partial<InsertWhatsappMessage>) {
  const db = await getDb();
  if (!db) return null;
  await db.update(whatsappMessages).set(data).where(eq(whatsappMessages.id, id));
  return true;
}

export async function getWhatsappDashboardStats() {
  const db = await getDb();
  if (!db) return { total: 0, sent: 0, delivered: 0, read: 0, responded: 0, authorized: 0, pending: 0, failed: 0 };
  const all = await db.select().from(whatsappMessages);
  return {
    total: all.length,
    sent: all.filter(m => m.status === "sent").length,
    delivered: all.filter(m => m.status === "delivered").length,
    read: all.filter(m => m.status === "read").length,
    responded: all.filter(m => m.status === "responded").length,
    authorized: all.filter(m => m.authorizationStatus === "authorized").length,
    pending: all.filter(m => m.authorizationStatus === "pending").length,
    failed: all.filter(m => m.status === "failed").length,
  };
}

// ─── Message Template helpers ─────────────────────────────
export async function getActiveTemplates() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(messageTemplates).where(eq(messageTemplates.isActive, 1)).orderBy(messageTemplates.name);
}

// ============================================================
// APP SETTINGS HELPERS
// ============================================================

export async function getSettingsByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(appSettings).where(eq(appSettings.category, category)).orderBy(appSettings.sortOrder);
}

export async function getAllSettings() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(appSettings).orderBy(appSettings.category, appSettings.sortOrder);
}

export async function getSettingValue(category: string, key: string): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  const results = await db.select().from(appSettings)
    .where(and(eq(appSettings.category, category), eq(appSettings.key, key)))
    .limit(1);
  return results[0]?.value ?? null;
}

export async function upsertSetting(data: { category: string; key: string; value: string | null; label: string; description?: string | null; fieldType?: string; isEncrypted?: number; isRequired?: number; sortOrder?: number; updatedBy?: number }) {
  const db = await getDb();
  if (!db) return null;
  const existing = await db.select().from(appSettings)
    .where(and(eq(appSettings.category, data.category), eq(appSettings.key, data.key)))
    .limit(1);
  if (existing.length > 0) {
    await db.update(appSettings)
      .set({ value: data.value, updatedBy: data.updatedBy })
      .where(eq(appSettings.id, existing[0].id));
    return { ...existing[0], value: data.value };
  } else {
    const result = await db.insert(appSettings).values({
      category: data.category,
      key: data.key,
      value: data.value,
      label: data.label,
      description: data.description ?? null,
      fieldType: (data.fieldType as any) ?? "text",
      isEncrypted: data.isEncrypted ?? 0,
      isRequired: data.isRequired ?? 0,
      sortOrder: data.sortOrder ?? 0,
      updatedBy: data.updatedBy,
    });
    return { id: result[0].insertId, ...data };
  }
}

export async function updateSettingValue(id: number, value: string | null, updatedBy?: number) {
  const db = await getDb();
  if (!db) return null;
  await db.update(appSettings)
    .set({ value, updatedBy })
    .where(eq(appSettings.id, id));
  return { success: true };
}

export async function deleteSetting(id: number) {
  const db = await getDb();
  if (!db) return null;
  await db.delete(appSettings).where(eq(appSettings.id, id));
  return { success: true };
}

export async function getWhatsAppConfig() {
  const phoneNumberId = await getSettingValue("whatsapp", "phone_number_id");
  const accessToken = await getSettingValue("whatsapp", "access_token");
  const verifyToken = await getSettingValue("whatsapp", "verify_token");
  const businessAccountId = await getSettingValue("whatsapp", "business_account_id");
  return { phoneNumberId, accessToken, verifyToken, businessAccountId };
}


// ─── Check-in Helpers ─────────────────────────────────────────────────────────

export async function createCheckin(data: InsertCheckin): Promise<Checkin> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(checkins).values(data);
  const [row] = await db.select().from(checkins).where(eq(checkins.id, result[0].insertId));
  return row;
}

export async function getCheckinByToken(token: string): Promise<Checkin | null> {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db.select().from(checkins).where(eq(checkins.qrCodeToken, token));
  return row || null;
}

export async function getCheckinByRegistrationId(registrationId: number): Promise<Checkin | null> {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db.select().from(checkins).where(eq(checkins.registrationId, registrationId));
  return row || null;
}

export async function performCheckin(token: string, checkedInBy: number): Promise<Checkin | null> {
  const db = await getDb();
  if (!db) return null;
  const [existing] = await db.select().from(checkins).where(eq(checkins.qrCodeToken, token));
  if (!existing) return null;
  if (existing.status === "checked_in") return existing; // already checked in
  
  await db.update(checkins)
    .set({ 
      status: "checked_in", 
      checkedInAt: new Date(), 
      checkedInBy,
      checkedInMethod: "qr_scan"
    })
    .where(eq(checkins.qrCodeToken, token));
  
  const [updated] = await db.select().from(checkins).where(eq(checkins.qrCodeToken, token));
  return updated;
}

export async function manualCheckin(registrationId: number, checkedInBy: number, notes?: string): Promise<Checkin | null> {
  const db = await getDb();
  if (!db) return null;
  const [existing] = await db.select().from(checkins).where(eq(checkins.registrationId, registrationId));
  if (!existing) return null;
  
  await db.update(checkins)
    .set({ 
      status: "checked_in", 
      checkedInAt: new Date(), 
      checkedInBy,
      checkedInMethod: "manual",
      notes: notes || "Check-in manual pelo admin"
    })
    .where(eq(checkins.registrationId, registrationId));
  
  const [updated] = await db.select().from(checkins).where(eq(checkins.registrationId, registrationId));
  return updated;
}

export async function cancelCheckin(token: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(checkins)
    .set({ status: "cancelled" })
    .where(eq(checkins.qrCodeToken, token));
}

export async function getAllCheckins(): Promise<Checkin[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(checkins).orderBy(desc(checkins.createdAt));
}

export async function getCheckinStats() {
  const db = await getDb();
  if (!db) return { total: 0, checkedIn: 0, pending: 0, cancelled: 0 };
  const all = await db.select().from(checkins);
  const total = all.length;
  const checkedIn = all.filter(c => c.status === "checked_in").length;
  const pending = all.filter(c => c.status === "pending").length;
  const cancelled = all.filter(c => c.status === "cancelled").length;
  return { total, checkedIn, pending, cancelled };
}
