import { Elysia, status } from 'elysia'
import { WhatsAppService } from './service'
import { ConnectDto } from './model'

export const whatsappModule = new Elysia({ name: 'whatsapp-module', prefix: '/api/whatsapp' })
  .get('/status', async ({ user }) => {
    if (!user?.id) return status(401)
    const result = await WhatsAppService.getStatus()
    return result
  }, { auth: true })
  .post('/connect', async ({ user, body }) => {
    if (!user?.id) return status(401)
    const result = await WhatsAppService.connect(body.phone)
    return result
  }, { auth: true, body: ConnectDto })
  .post('/disconnect', async ({ user, body }) => {
    if (!user?.id) return status(401)
    const result = await WhatsAppService.disconnect(body.sessionId)
    return result
  }, { auth: true })
  .post('/webhook', async ({ body }) => {
    const result = await WhatsAppService.handleWebhook(body)
    return result
  })
