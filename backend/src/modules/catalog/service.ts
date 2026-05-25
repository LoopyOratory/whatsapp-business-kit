import { db } from '../../database'
import { catalogItems } from '../../database/schema'
import { eq, and, desc, asc, sql } from 'drizzle-orm'
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'

export abstract class CatalogService {
  static async list(businessId: string, limit?: number, offset?: number, category?: string) {
    let query = db
      .select()
      .from(catalogItems)
      .where(eq(catalogItems.businessId, businessId))

    if (category) {
      query = query.where(eq(catalogItems.category, category))
    }

    query = query
      .orderBy(asc(catalogItems.sortOrder), asc(catalogItems.createdAt))
      .limit(limit ?? 50)
      .offset(offset ?? 0)

    return query.execute()
  }

  static async getById(id: string, businessId: string) {
    const result = await db
      .select()
      .from(catalogItems)
      .where(and(eq(catalogItems.id, id), eq(catalogItems.businessId, businessId)))
      .limit(1)

    return result[0] || null
  }

  static async create(data: InferInsertModel<typeof catalogItems>) {
    const result = await db
      .insert(catalogItems)
      .values(data)
      .returning()

    return result[0]
  }

  static async update(id: string, businessId: string, data: Partial<InferInsertModel<typeof catalogItems>>) {
    const result = await db
      .update(catalogItems)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(catalogItems.id, id), eq(catalogItems.businessId, businessId)))
      .returning()

    return result[0]
  }

  static async remove(id: string, businessId: string) {
    const result = await db
      .delete(catalogItems)
      .where(and(eq(catalogItems.id, id), eq(catalogItems.businessId, businessId)))
      .returning()

    return result[0]
  }

  static async reorder(businessId: string, items: { id: string; sortOrder: number }[]) {
    // We'll update each item's sortOrder in a transaction for safety
    // But for simplicity, we'll do individual updates (acceptable for small catalogs)
    const results = []
    for (const item of items) {
      const result = await db
        .update(catalogItems)
        .set({ sortOrder: item.sortOrder, updatedAt: new Date() })
        .where(and(eq(catalogItems.id, item.id), eq(catalogItems.businessId, businessId)))
        .returning()
      results.push(result[0])
    }
    return results
  }

  static async listPublic(businessId: string) {
    const result = await db
      .select()
      .from(catalogItems)
      .where(and(eq(catalogItems.businessId, businessId), eq(catalogItems.isAvailable, true)))
      .orderBy(asc(catalogItems.sortOrder), asc(catalogItems.createdAt))

    return result
  }
}