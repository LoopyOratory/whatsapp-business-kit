import { Elysia, status } from 'elysia'
import { WhatsAppService } from './service'

export const whatsappModule = new Elysia({ name: 'whatsapp-module', prefix: '/api/whatsapp' })
  .get('/status', async ({ user }) => {
    if (!user?.id) return status(401)
    const result = await WhatsAppService.getStatus()
    return result
  }, { auth: true })
  .post('/webhook', async ({ body }) => {
    const result = await WhatsAppService.handleWebhook(body)
    return result
  })
