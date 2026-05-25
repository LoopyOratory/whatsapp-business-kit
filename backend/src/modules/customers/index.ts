import { Elysia, t, status } from 'elysia'
import { db } from '../../database'
import { customers } from '../../database/schema'
import { eq, and } from 'drizzle-orm'
import { CreateCustomerDto, UpdateCustomerDto, CustomerDto } from './model'
import { CustomerService } from './service'

export const customersModule = new Elysia({ name: 'customers-module', prefix: '/api/customers' })
  .get('/', async ({ user, query: { limit, offset, search } }) => {
    if (!user?.id) return status(401)
    const result = await CustomerService.list(user.id, Number(limit), Number(offset), search as string)
    return result
  }, { auth: true })
  .post('/', async ({ user, body }) => {
    if (!user?.id) return status(401)
    const customer = await CustomerService.create(user.id, body.phone, body)
    return customer
  }, { auth: true, body: CreateCustomerDto })
  .get('/:id', async ({ user, params: { id } }) => {
    if (!user?.id) return status(401)
    const customer = await CustomerService.getById(id, user.id)
    if (!customer) return status(404)
    return customer
  }, { auth: true })
  .put('/:id', async ({ user, params: { id }, body }) => {
    if (!user?.id) return status(401)
    const updated = await CustomerService.update(id, user.id, body)
    if (!updated) return status(404)
    return updated
  }, { auth: true, body: UpdateCustomerDto })
  .get('/:id/orders', async ({ user, params: { id } }) => {
    if (!user?.id) return status(401)
    const orders = await CustomerService.getOrderHistory(id, user.id)
    return orders
  }, { auth: true })