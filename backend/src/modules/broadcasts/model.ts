import { t } from 'elysia'

export const CreateBroadcastDto = t.Object({
  title: t.String(),
  content: t.Any(),
  audienceFilter: t.Optional(t.Any()),
  scheduledAt: t.Optional(t.String({ format: 'date-time' })),
})

export const BroadcastDto = t.Object({
  id: t.String({ format: 'uuid' }),
  businessId: t.String({ format: 'uuid' }),
  title: t.String(),
  content: t.Any(),
  audienceFilter: t.Optional(t.Any()),
  sentCount: t.Integer(),
  deliveredCount: t.Integer(),
  failedCount: t.Integer(),
  status: t.String(),
  scheduledAt: t.Optional(t.String({ format: 'date-time' })),
  createdAt: t.String({ format: 'date-time' }),
})
