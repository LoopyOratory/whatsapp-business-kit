import { env } from '../../config/env'
import { db } from '../../database'
import { messages, customers } from '../../database/schema'
import { eq } from 'drizzle-orm'

export abstract class WhatsAppService {
  static async getStatus() {
    try {
      const response = await fetch(`${env.wahaApiUrl}/sessions`, {
        headers: {
          Authorization: `Bearer ${env.wahaApiKey}`,
        },
      })
      const sessions = await response.json()
      const active = Array.isArray(sessions) ? sessions.find((s: any) => s.status === 'connected') : null
      return {
        connected: !!active,
        sessionId: active?.id || null,
        phone: active?.phone || null,
      }
    } catch {
      return { connected: false, sessionId: null, phone: null }
    }
  }

  static async connect(phone: string) {
    const response = await fetch(`${env.wahaApiUrl}/sessions/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.wahaApiKey}`,
      },
      body: JSON.stringify({ name: `business_${phone}`, phone }),
    })

    if (!response.ok) {
      throw new Error(`WAHA connect error: ${response.statusText}`)
    }

    const data = await response.json()
    return { sessionId: data.id, qrCode: data.qrCode || null }
  }

  static async disconnect(sessionId: string) {
    const response = await fetch(`${env.wahaApiUrl}/sessions/${sessionId}/delete`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${env.wahaApiKey}`,
      },
    })

    if (!response.ok) {
      throw new Error(`WAHA disconnect error: ${response.statusText}`)
    }

    return { disconnected: true }
  }

  static async handleWebhook(payload: any) {
    const { from: fromPhone, text, messageId, timestamp } = payload

    // Try to find customer by phone - webhook comes from WAHA without business context
    let customer = await db
      .select()
      .from(customers)
      .where(eq(customers.phone, fromPhone))
      .limit(1)
      .then(r => r[0])

    if (!customer) {
      // Can't create customer without businessId from webhook context
      // Just log the message without a customer association
      return { received: true, customerId: null }
    }

    // Log the incoming message
    await db.insert(messages).values({
      businessId: customer.businessId!,
      customerId: customer.id,
      direction: 'inbound',
      messageType: text ? 'text' : 'unknown',
      content: { text, messageId, timestamp },
      waMessageId: messageId,
      status: 'delivered',
    })

    return { received: true, customerId: customer.id }
  }
}
