import { t } from 'elysia'

export const CreateOrderDto = t.Object({
  customerId: t.String({ format: 'uuid' }),
  items: t.Array(
    t.Object({
      catalogItemId: t.Optional(t.String({ format: 'uuid' })),
      itemName: t.String(),
      quantity: t.Number(),
      unitPrice: t.Number(),
    })
  ),
  deliveryAddress: t.Optional(t.String()),
  notes: t.Optional(t.String()),
  source: t.Optional(t.String(), 'whatsapp'),
})

export const UpdateOrderStatusDto = t.Object({
  status: t.Union([
    t.Literal('pending'),
    t.Literal('confirmed'),
    t.Literal('processing'),
    t.Literal('completed'),
    t.Literal('cancelled'),
  ]),
})

export const UpdatePaymentStatusDto = t.Object({
  paymentStatus: t.Union([
    t.Literal('unpaid'),
    t.Literal('paid'),
    t.Literal('failed'),
    t.Literal('refunded'),
  ]),
  paymentReference: t.Optional(t.String()),
})

export const OrderItemDto = t.Object({
  id: t.String({ format: 'uuid' }),
  orderId: t.String({ format: 'uuid' }),
  catalogItemId: t.Optional(t.String({ format: 'uuid' })),
  itemName: t.String(),
  quantity: t.Number(),
  unitPrice: t.Number(),
  totalPrice: t.Number(),
})

export const OrderDto = t.Object({
  id: t.String({ format: 'uuid' }),
  businessId: t.String({ format: 'uuid' }),
  customerId: t.String({ format: 'uuid' }),
  status: t.String(),
  totalAmount: t.Number(),
  currency: t.String(),
  paymentStatus: t.String(),
  paymentReference: t.Optional(t.String()),
  deliveryAddress: t.Optional(t.String()),
  notes: t.Optional(t.String()),
  source: t.String(),
  createdAt: t.String(),
  updatedAt: t.String(),
})