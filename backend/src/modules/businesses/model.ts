import { t } from 'elysia'

export const CreateBusinessDto = t.Object({
  name: t.String(),
  phone: t.String(),
  email: t.Optional(t.String()),
})

export const UpdateBusinessDto = t.Object({
  name: t.String(),
  phone: t.Optional(t.String()),
  email: t.Optional(t.String()),
  logoUrl: t.Optional(t.String()),
  address: t.Optional(t.String()),
  currency: t.Optional(t.String()),
})

export const BusinessDto = t.Object({
  id: t.String({ format: 'uuid' }),
  name: t.String(),
  phone: t.String(),
  email: t.String(),
  logoUrl: t.Optional(t.String()),
  address: t.Optional(t.String()),
  currency: t.String(),
  createdAt: t.String(),
  updatedAt: t.String(),
})
