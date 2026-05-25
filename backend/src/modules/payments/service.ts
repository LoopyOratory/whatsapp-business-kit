import { db } from '../../database'
import { paymentTransactions, orders } from '../../database/schema'
import { eq, and, desc } from 'drizzle-orm'
import { env } from '../../config/env'
import { httpErrors } from '../../shared/errors'
import crypto from 'crypto'
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'

export abstract class PaymentService {
  static async initialize(
    email: string,
    amount: number,
    orderId: string,
    customerId: string,
    businessId: string
  ) {
    // Convert amount to kobo (smallest currency unit for Paystack)
    const amountInKobo = Math.round(amount * 100)

    // Call Paystack API to initialize transaction
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amountInKobo,
        metadata: {
          orderId,
          customerId,
          businessId,
        },
      }),
    })

    const data = await response.json()

    if (!data.status) {
      throw new Error(data.message || 'Failed to initialize payment')
    }

    // Save payment transaction record
    const [paymentTransaction] = await db
      .insert(paymentTransactions)
      .values({
        businessId,
        orderId,
        customerId,
        amount,
        currency: 'GHS', // Default currency, could be made configurable
        paystackReference: data.data.reference,
        paystackStatus: 'pending',
        channel: null,
        paidAt: null,
      })
      .returning()

    return {
      authorization_url: data.data.authorization_url,
      reference: data.data.reference,
    }
  }

  static async verify(reference: string) {
    // Call Paystack API to verify transaction
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${env.paystackSecretKey}`,
      },
    })

    const data = await response.json()

    if (!data.status) {
      throw new Error(data.message || 'Failed to verify payment')
    }

    const paystackData = data.data

    // If payment was successful, update records
    if (paystackData.status === 'success') {
      // Update payment transaction
      await db
        .update(paymentTransactions)
        .set({
          paystackStatus: paystackData.status,
          channel: paystackData.channel,
          paidAt: paystackData.paid_at ? new Date(paystackData.paid_at) : null,
        })
        .where(eq(paymentTransactions.paystackReference, reference))

      // Update order payment status and reference
      await db
        .update(orders)
        .set({
          paymentStatus: 'paid',
          paymentReference: reference,
        })
        .where(eq(orders.id, paystackData.metadata.orderId))
    }

    return paystackData
  }

  static async handleWebhook(body: any, signature: string) {
    // Verify webhook signature
    const hash = crypto
      .createHmac('sha512', env.paystackSecretKey)
      .update(JSON.stringify(body))
      .digest('hex')

    if (hash !== signature) {
      throw new Error('Invalid webhook signature')
    }

    const event = body.event

    // Handle charge.success event
    if (event === 'charge.success') {
      const { reference } = body.data
      
      // Verify the payment (this will update records if successful)
      await this.verify(reference)
    }

    return { received: true }
  }

  static async history(businessId: string, limit?: number, offset?: number) {
    return await db
      .select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.businessId, businessId))
      .orderBy(desc(paymentTransactions.createdAt))
      .limit(limit ?? 50)
      .offset(offset ?? 0)
  }

  static async getByReference(reference: string) {
    const result = await db
      .select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.paystackReference, reference))
      .limit(1)

    return result[0] || null
  }
}