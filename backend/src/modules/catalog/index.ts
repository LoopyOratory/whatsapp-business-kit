import { Elysia, t, status } from 'elysia'
import { db } from '../../database'
import { catalogItems, businesses } from '../../database/schema'
import { eq, and } from 'drizzle-orm'
import { CreateCatalogItemDto, UpdateCatalogItemDto, CatalogItemDto } from './model'
import { CatalogService } from './service'
import { checkProductLimit } from '../../lib/subscription'

export const catalogModule = new Elysia({ name: 'catalog-module', prefix: '/api/catalog' })
  .get('/', async ({ user, query }) => {
    if (!user?.id) return status(401)
    const business = await db.select().from(businesses).where(eq(businesses.id, user.id)).limit(1)
    if (!business[0]) return status(404)
    
    const items = await CatalogService.list(
      user.id, 
      query.limit ? Number(query.limit) : undefined,
      query.offset ? Number(query.offset) : undefined,
      query.category
    )
    return items
  }, { auth: true })
  .post('/', async ({ user, body }) => {
    if (!user?.id) return status(401)
    const business = await db.select().from(businesses).where(eq(businesses.id, user.id)).limit(1)
    if (!business[0]) return status(404)
    
    const limitResult = await checkProductLimit(user.id)
    if (!limitResult.allowed) {
      return status(403, { error: `Product limit reached (${limitResult.current}/${limitResult.limit}). Upgrade your plan.` })
    }
    
    const item = await CatalogService.create({ ...body, businessId: user.id })
    return item
  }, { auth: true, body: CreateCatalogItemDto })
  .get('/public/:businessId', async ({ params }) => {
    const items = await CatalogService.listPublic(params.businessId)
    return items
  }) // No auth needed - public route
  .get('/:id', async ({ user, params }) => {
    if (!user?.id) return status(401)
    const item = await CatalogService.getById(params.id, user.id)
    if (!item) return status(404)
    return item
  }, { auth: true })
  .put('/:id', async ({ user, params, body }) => {
    if (!user?.id) return status(401)
    const item = await CatalogService.update(params.id, user.id, body as any)
    if (!item) return status(404)
    return item
  }, { auth: true, body: UpdateCatalogItemDto })
  .delete('/:id', async ({ user, params }) => {
    if (!user?.id) return status(401)
    const item = await CatalogService.remove(params.id, user.id)
    if (!item) return status(404)
    return item
  }, { auth: true })
  .post('/reorder', async ({ user, body }) => {
    if (!user?.id) return status(401)
    const business = await db.select().from(businesses).where(eq(businesses.id, user.id)).limit(1)
    if (!business[0]) return status(404)
    
    const result = await CatalogService.reorder(user.id, body.items)
    return result
  }, { auth: true, body: t.Object({
    items: t.Array(t.Object({
      id: t.String({ format: 'uuid' }),
      sortOrder: t.Integer()
    }))
  }) })