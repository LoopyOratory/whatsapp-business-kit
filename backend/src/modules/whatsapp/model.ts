import { t } from 'elysia'

export const ConnectDto = t.Object({
  phone: t.String(),
})

export const DisconnectDto = t.Object({
  sessionId: t.String(),
})

export const StatusDto = t.Object({
  connected: t.Boolean(),
  sessionId: t.Optional(t.String()),
  phone: t.Optional(t.String()),
  qrCode: t.Optional(t.String()),
})

export const WebhookMessageDto = t.Object({
  from: t.String(),
  text: t.Optional(t.String()),
  messageId: t.Optional(t.String()),
  timestamp: t.Optional(t.Numeric()),
})
