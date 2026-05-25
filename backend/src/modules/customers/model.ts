import { t } from 'elysia'

export const CreateCustomerDto = t.Object({
  phone: t.String(),
  name: t.Optional(t.String()),
  email: t.Optional(t.String()),
  notes: t.Optional(t.String()),
})

export const UpdateCustomerDto = t.Object({
  phone: t.Optional(t.String()),
  name: t.Optional(t.String()),
  email: t.Optional(t.String()),
  notes: t.Optional(t.String()),
})

export const CustomerDto = t.Object({
  id: t.String({ format: 'uuid' }),
  businessId: t.String({ format: 'uuid' }),
  phone: t.String(),
  name: t.String(),
  email: t.String(),
  totalOrders: t.Number(),
  totalSpent: t.Number(),
  lastOrderAt: t.Optional(t.String()),
  notes: t.Optional(t.String()),
  createdAt: t.String(),
  updatedAt: t.String(),
})