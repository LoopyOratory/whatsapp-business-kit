import { env } from '../../config/env';
import { db } from '../../database';
import { messages } from '../../database/schema';
import { eq, and, desc } from 'drizzle-orm';

export abstract class MessageService {
  static async list(businessId: string, limit: number = 50, offset: number = 0, customerId?: string) {
    const whereConditions = [eq(messages.businessId, businessId)];
    
    if (customerId) {
      whereConditions.push(eq(messages.customerId, customerId));
    }

    const result = await db
      .select()
      .from(messages)
      .where(and(...whereConditions))
      .orderBy(desc(messages.createdAt))
      .limit(limit)
      .offset(offset);

    return result;
  }

  static async logMessage(data: {
    businessId: string;
    customerId?: string;
    direction: 'inbound' | 'outbound';
    messageType: string;
    content: unknown;
    waMessageId?: string;
    status?: 'sent' | 'delivered' | 'read' | 'failed';
  }) {
    const [message] = await db
      .insert(messages)
      .values({
        businessId: data.businessId,
        customerId: data.customerId,
        direction: data.direction,
        messageType: data.messageType,
        content: data.content,
        waMessageId: data.waMessageId,
        status: data.status ?? 'sent',
      })
      .returning();

    return message;
  }

  static async sendWhatsApp(to: string, text: string) {
    const response = await fetch(`${env.wahaApiUrl}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.wahaApiKey}`,
      },
      body: JSON.stringify({
        chatId: to,
        text,
      }),
    });

    if (!response.ok) {
      throw new Error(`WAHA API error: ${response.statusText}`);
    }

    return response.json();
  }

  static async sendCatalogViaWAHA(customerPhone: string, catalogItems: Array<{ name: string; description?: string; price: number }>) {
    // Format catalog items as a text message
    const catalogText = catalogItems
      .map(item => `*${item.name}*\n${item.description || ''}\nPrice: ${item.currency || 'GHS'} ${item.price}\n`)
      .join('\n---\n');

    const message = `Here are our available products:\n\n${catalogText}`;

    return this.sendWhatsApp(customerPhone, message);
  }

  static async sendPaymentLink(customerPhone: string, paymentUrl: string, amount: number) {
    const message = `Your payment link for GHS ${amount} is ready:\n${paymentUrl}\n\nPlease complete your payment to confirm the order.`;

    return this.sendWhatsApp(customerPhone, message);
  }
}