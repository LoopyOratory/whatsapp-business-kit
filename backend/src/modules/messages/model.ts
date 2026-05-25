import { Type } from '@sinclair/typebox';

export const SendMessageDto = Type.Object({
  to: Type.String(),
  text: Type.String(),
});

export const SendCatalogDto = Type.Object({
  customerId: Type.String({ format: 'uuid' }),
});

export const SendPaymentLinkDto = Type.Object({
  customerId: Type.String({ format: 'uuid' }),
  orderId: Type.String({ format: 'uuid' }),
  amount: Type.Number(),
});

export const MessageDto = Type.Object({
  id: Type.String({ format: 'uuid' }),
  businessId: Type.String({ format: 'uuid' }),
  customerId: Type.String({ format: 'uuid' }),
  direction: Type.String(),
  messageType: Type.String(),
  content: Type.Object(),
  waMessageId: Type.Optional(Type.String()),
  status: Type.String(),
  createdAt: Type.String({ format: 'date-time' }),
});