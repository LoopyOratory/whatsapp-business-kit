import { Elysia, t, status } from 'elysia'
import { db } from '../../database'
import { orders } from '../../database/schema'
import { eq, and } from 'drizzle-orm'
import { CreateOrderDto, UpdateOrderStatusDto, UpdatePaymentStatusDto, OrderDto } from './model'
import { OrderService } from './service'

export const ordersModule = new Elysia({ name: 'orders-module', prefix: '/api/orders' })
  .get('/', async ({ user, query: { limit, offset, status, paymentStatus } }) => {
    if (!user?.id) return status(401)
    const result = await OrderService.list(
      user.id, 
      Number(limit), 
      Number(offset), 
      status as string,
      paymentStatus as string
    )
    return result
  }, { auth: true })
  .post('/', async ({ user, body }) => {
    if (!user?.id) return status(401)
    const order = await OrderService.create(user.id, body as any)
    return order
  }, { auth: true, body: CreateOrderDto })
  .get('/stats', async ({ user }) => {
    if (!user?.id) return status(401)
    const stats = await OrderService.getStats(user.id)
    return stats
  }, { auth: true })
  .get('/:id', async ({ user, params: { id } }) => {
    if (!user?.id) return status(401)
    const order = await OrderService.getById(id, user.id)
    if (!order) return status(404)
    return order
  }, { auth: true })
  .put('/:id/status', async ({ user, params: { id }, body }) => {
    if (!user?.id) return status(401)
    const updated = await OrderService.updateStatus(id, user.id, body.status)
    if (!updated) return status(404)
    return updated
  }, { auth: true, body: UpdateOrderStatusDto })
  .put('/:id/payment', async ({ user, params: { id }, body }) => {
    if (!user?.id) return status(401)
    const updated = await OrderService.updatePayment(
      id, 
      user.id, 
      body.paymentStatus, 
      body.paymentReference
    )
    if (!updated) return status(404)
    return updated
  }, { auth: true, body: UpdatePaymentStatusDto })