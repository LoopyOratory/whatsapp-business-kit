import { Elysia, t, status } from 'elysia'
import { PaymentService } from './service'
import { InitializePaymentDto } from './model'

export const paymentsModule = new Elysia({ name: 'payments-module', prefix: '/api/payments' })
  .post('/initialize', async ({ user, body }) => {
    if (!user?.id) return status(401)
    const result = await PaymentService.initialize(
      body.email,
      Number(body.amount),
      body.orderId,
      body.customerId,
      user.id
    )
    return result
  }, { auth: true, body: InitializePaymentDto })
  .get('/verify/:reference', async ({ user, params }) => {
    if (!user?.id) return status(401)
    const result = await PaymentService.verify(params.reference)
    return result
  }, { auth: true })
  .post('/webhook', async ({ body, request }) => {
    const signature = request.headers.get('x-paystack-signature') || ''
    const result = await PaymentService.handleWebhook(body, signature)
    return result
  }, { body: t.Any() })
  .get('/history', async ({ user, query }) => {
    if (!user?.id) return status(401)
    const result = await PaymentService.history(
      user.id,
      query.limit ? Number(query.limit) : undefined,
      query.offset ? Number(query.offset) : undefined
    )
    return result
  }, { auth: true })
