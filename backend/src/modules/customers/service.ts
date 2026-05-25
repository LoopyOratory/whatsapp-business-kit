import { db } from '../../database'
import { customers, orders } from '../../database/schema'
import { eq, and, desc, asc, sql } from 'drizzle-orm'
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'

export abstract class CustomerService {
  static async list(businessId: string, limit?: number, offset?: number, search?: string) {
    let query = db
      .select()
      .from(customers)
      .where(eq(customers.businessId, businessId))

    if (search) {
      query = query.where(
        and(
          eq(customers.businessId, businessId),
          sql`${customers.name} ILIKE ${`%${search}%`} OR ${customers.phone} ILIKE ${`%${search}%`}`
        )
      )
    }

    query = query
      .orderBy(desc(customers.createdAt))
      .limit(limit ?? 50)
      .offset(offset ?? 0)

    return query.execute()
  }

  static async getById(id: string, businessId: string) {
    const result = await db
      .select()
      .from(customers)
      .where(and(eq(customers.id, id), eq(customers.businessId, businessId)))
      .limit(1)

    return result[0] || null
  }

  static async getByPhone(businessId: string, phone: string) {
    const result = await db
      .select()
      .from(customers)
      .where(and(eq(customers.businessId, businessId), eq(customers.phone, phone)))
      .limit(1)

    return result[0] || null
  }

  static async upsertByPhone(businessId: string, phone: string, data: Partial<InferInsertModel<typeof customers>>) {
    // Check if customer exists
    const existing = await this.getByPhone(businessId, phone)
    
    if (existing) {
      // Update existing customer
      return await this.update(existing.id, businessId, data)
    } else {
      // Create new customer
      return await this.create(businessId, phone, data)
    }
  }

  static async create(businessId: string, phone: string, data: Partial<InferInsertModel<typeof customers>>) {
    const result = await db
      .insert(customers)
      .values({
        businessId,
        phone,
        ...data,
      })
      .returning()

    return result[0]
  }

  static async update(id: string, businessId: string, data: Partial<InferInsertModel<typeof customers>>) {
    const result = await db
      .update(customers)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(customers.id, id), eq(customers.businessId, businessId)))
      .returning()

    return result[0]
  }

  static async getOrderHistory(customerId: string, businessId: string) {
    const result = await db
      .select()
      .from(orders)
      .where(and(eq(orders.customerId, customerId), eq(orders.businessId, businessId)))
      .orderBy(desc(orders.createdAt))

    return result.execute()
  }

  static async incrementStats(customerId: string, businessId: string, amount: number) {
    const result = await db
      .update(customers)
      .set({
        totalOrders: sql`${customers.totalOrders} + 1`,
        totalSpent: sql`${customers.totalSpent} + ${amount}`,
        lastOrderAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(customers.id, customerId), eq(customers.businessId, businessId)))
      .returning()

    return result[0]
  }
}