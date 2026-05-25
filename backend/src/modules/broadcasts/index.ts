import { Elysia, status } from 'elysia'
import { db } from '../../database'
import { eq } from 'drizzle-orm'
import { businesses } from '../../database/schema'
import { CreateBroadcastDto } from './model'
import { BroadcastService } from './service'

export const broadcastsModule = new Elysia({ name: 'broadcasts-module', prefix: '/api/broadcasts' })
  .get('/', async ({ user, query }) => {
    if (!user?.id) return status(401)
    const items = await BroadcastService.list(
      user.id,
      query.limit ? Number(query.limit) : undefined,
      query.offset ? Number(query.offset) : undefined
    )
    return items
  }, { auth: true })
  .post('/', async ({ user, body }) => {
    if (!user?.id) return status(401)
    const broadcast = await BroadcastService.create({ ...body, businessId: user.id })
    return broadcast
  }, { auth: true, body: CreateBroadcastDto })
  .post('/:id/send', async ({ user, params }) => {
    if (!user?.id) return status(401)
    const result = await BroadcastService.send(params.id, user.id)
    return result
  }, { auth: true })
  .get('/:id/stats', async ({ user, params }) => {
    if (!user?.id) return status(401)
    const stats = await BroadcastService.getStats(params.id, user.id)
    return stats
  }, { auth: true })
