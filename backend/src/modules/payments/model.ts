import { t } from 'elysia'

export const InitializePaymentDto = t.Object({
  email: t.String({ format: 'email' }),
  amount: t.Numeric(),
  orderId: t.String({ format: 'uuid' }),
  customerId: t.String({ format: 'uuid' }),
})

export const VerifyPaymentDto = t.Object({
  reference: t.String(),
})

export const PaymentDto = t.Object({
  id: t.String({ format: 'uuid' }),
  businessId: t.String({ format: 'uuid' }),
  orderId: t.String({ format: 'uuid' }),
  customerId: t.String({ format: 'uuid' }),
  amount: t.Numeric(),
  currency: t.String(),
  paystackReference: t.String(),
  paystackStatus: t.String(),
  channel: t.Optional(t.String()),
  paidAt: t.Optional(t.String({ format: 'date-time' })),
  createdAt: t.String({ format: 'date-time' }),
})
