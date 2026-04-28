import { eq, desc, count, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, leads, InsertLead, Lead, testimonials, orders } from "../drizzle/schema";
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

export async function updateTestimonial(id: number, data: { name?: string; city?: string; event?: string; quote?: string; avatarUrl?: string; rating?: number; featured?: number }) {
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

export async function updateLeadStatus(id: number, status: 'new' | 'contacted' | 'registered' | 'confirmed') {
  const db = await getDb();
  if (!db) return null;
  await db.update(leads).set({ status }).where(eq(leads.id, id));
  return true;
}

export async function getLeadsFiltered(filters: { city?: string; event?: string; status?: string }) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(leads).$dynamic();
  if (filters.city) query = query.where(eq(leads.city, filters.city));
  if (filters.event) query = query.where(eq(leads.event, filters.event));
  if (filters.status) query = query.where(eq(leads.status, filters.status as 'new' | 'contacted' | 'registered' | 'confirmed'));
  return query.orderBy(desc(leads.createdAt));
}

export async function getAdminMetrics() {
  const db = await getDb();
  if (!db) return { totalLeads: 0, totalOrders: 0, totalRevenueCents: 0, leadsByCity: [], leadsByStatus: [] };

  const [totalLeadsRow] = await db.select({ count: count() }).from(leads);
  const [totalOrdersRow] = await db.select({ count: count() }).from(orders).where(eq(orders.status, 'paid'));
  const [revenueRow] = await db.select({ total: sql<number>`COALESCE(SUM(${orders.amountCents}), 0)` }).from(orders).where(eq(orders.status, 'paid'));

  const leadsByCity = await db
    .select({ city: leads.city, count: count() })
    .from(leads)
    .groupBy(leads.city)
    .orderBy(desc(count()));

  const leadsByStatus = await db
    .select({ status: leads.status, count: count() })
    .from(leads)
    .groupBy(leads.status);

  return {
    totalLeads: totalLeadsRow?.count ?? 0,
    totalOrders: totalOrdersRow?.count ?? 0,
    totalRevenueCents: (revenueRow?.total as number) ?? 0,
    leadsByCity,
    leadsByStatus,
  };
}

export async function getOrders() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}
