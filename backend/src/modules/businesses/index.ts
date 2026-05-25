import { Elysia, t, status } from 'elysia'
import { db } from '../../database'
import { businesses } from '../../database/schema'
import { eq } from 'drizzle-orm'
import { BusinessDto, UpdateBusinessDto, CreateBusinessDto } from './model'
import { createInsertSchema } from 'drizzle-typebox'

const _insertBusiness = createInsertSchema(businesses)
export const InsertBusiness = t.Omit(_insertBusiness, ['id', 'createdAt', 'updatedAt'])

export abstract class BusinessService {
  static async getById(id: string) {
    const result = await db.select().from(businesses).where(eq(businesses.id, id)).limit(1)
    return result[0] || null
  }

  static async update(id: string, data: Partial<typeof businesses.$inferInsert>) {
    const result = await db.update(businesses).set({ ...data, updatedAt: new Date() }).where(eq(businesses.id, id)).returning()
    return result[0]
  }

  static async create(data: typeof businesses.$inferInsert) {
    const result = await db.insert(businesses).values(data).returning()
    return result[0]
  }
}

export const businessesModule = new Elysia({ name: 'businesses-module', prefix: '/api/businesses' })
  .get('/', async ({ user }) => {
    if (!user?.id) return status(401)
    const business = await BusinessService.getById(user.id)
    if (!business) return status(404)
    return business
  }, { auth: true })
  .put('/', async ({ user, body }) => {
    if (!user?.id) return status(401)
    const updated = await BusinessService.update(user.id, body as any)
    if (!updated) return status(404)
    return updated
  }, { auth: true, body: UpdateBusinessDto })
  .post('/onboard', async ({ body }) => {
    const business = await BusinessService.create(body as any)
    return business
  }, { body: CreateBusinessDto })
  .put('/settings', async ({ user, body }) => {
    if (!user?.id) return status(401)
    const updated = await BusinessService.update(user.id, { settings: body } as any)
    if (!updated) return status(404)
    return updated
  }, { auth: true, body: t.Record(t.String(), t.Any()) })
