import { t } from 'elysia'
import { catalogItems } from '../../database/schema'

// DTOs for Catalog Item operations
export const CreateCatalogItemDto = t.Object({
  name: t.String(),
  description: t.Optional(t.String()),
  price: t.Numeric(),
  currency: t.Optional(t.String()),
  category: t.Optional(t.String()),
  imageUrl: t.Optional(t.String()),
  isAvailable: t.Optional(t.Boolean()),
  sortOrder: t.Optional(t.Integer())
})

export const UpdateCatalogItemDto = t.Partial(CreateCatalogItemDto)

export const CatalogItemDto = t.Object({
  id: t.String({ format: 'uuid' }),
  businessId: t.String({ format: 'uuid' }),
  name: t.String(),
  description: t.Optional(t.String()),
  price: t.Numeric(),
  currency: t.String(),
  category: t.Optional(t.String()),
  imageUrl: t.Optional(t.String()),
  isAvailable: t.Boolean(),
  sortOrder: t.Integer(),
  createdAt: t.String({ format: 'date-time' }),
  updatedAt: t.String({ format: 'date-time' })
})