import { Elysia, t } from 'elysia';
import { env } from '../../config/env';
import { MessageService } from './service';
import { SendMessageDto, SendCatalogDto, SendPaymentLinkDto, MessageDto } from './model';
import { betterAuthPlugin } from '../../plugins/auth';
import { db } from '../../database';
import { messages, customers } from '../../database/schema';
import { eq } from 'drizzle-orm';

export const messagesModule = new Elysia({ name: 'messages-module' })
  .use(betterAuthPlugin)
  .prefix('/api/messages')
  .get(
    '/',
    async ({ query, auth: { user } }) => {
      // Get businessId from user (assuming user has businessId)
      const businessId = user.businessId; // Adjust based on your user structure
      
      const limit = Number(query.limit) || 50;
      const offset = Number(query.offset) || 0;
      const customerId = query.customerId || undefined;
      
      const result = await MessageService.list(businessId, limit, offset, customerId);
      
      return result;
    },
    {
      query: t.Object({
        limit: t.Optional(t.String()),
        offset: t.Optional(t.String()),
        customerId: t.Optional(t.String({ format: 'uuid' })),
      }),
      detail: {
        summary: 'List messages',
        security: [{ Bearer: [] }],
      },
    }
  )
  .post(
    '/send',
    async ({ body, auth: { user } }) => {
      const businessId = user.businessId;
      
      // Get customer by phone number to get customerId
      const [customer] = await db
        .select()
        .from(customers)
        .where(eq(customers.phone, body.to))
        .limit(1);
      
      if (!customer) {
        throw new Error('Customer not found');
      }
      
      // Send via WAHA
      const wahaResponse = await MessageService.sendWhatsApp(body.to, body.text);
      
      // Log the message
      const message = await MessageService.logMessage({
        businessId,
        customerId: customer.id,
        direction: 'outbound',
        messageType: 'text',
        content: { text: body.text },
        waMessageId: wahaResponse.id,
        status: 'sent',
      });
      
      return message;
    },
    {
      body: SendMessageDto,
      detail: {
        summary: 'Send WhatsApp message',
        security: [{ Bearer: [] }],
      },
    }
  )
  .post(
    '/send-catalog',
    async ({ body, auth: { user } }) => {
      const businessId = user.businessId;
      
      // Get customer
      const [customer] = await db
        .select()
        .from(customers)
        .where(eq(customers.id, body.customerId))
        .limit(1);
      
      if (!customer) {
        throw new Error('Customer not found');
      }
      
      // Get catalog items for this business
      const catalogItems = await db
        .select()
        .from(catalogItemsTable)
        .where(eq(catalogItemsTable.businessId, businessId))
        .where(eq(catalogItemsTable.isAvailable, true));
      
      // Send via WAHA
      const wahaResponse = await MessageService.sendCatalogViaWAHA(
        customer.phone,
        catalogItems.map(item => ({
          name: item.name,
          description: item.description,
          price: Number(item.price),
          currency: item.currency,
        }))
      );
      
      // Log the message
      const message = await MessageService.logMessage({
        businessId,
        customerId: customer.id,
        direction: 'outbound',
        messageType: 'catalog',
        content: { items: catalogItems },
        waMessageId: wahaResponse.id,
        status: 'sent',
      });
      
      return message;
    },
    {
      body: SendCatalogDto,
      detail: {
        summary: 'Send catalog to customer',
        security: [{ Bearer: [] }],
      },
    }
  )
  .post(
    '/send-payment-link',
    async ({ body, auth: { user } }) => {
      const businessId = user.businessId;
      
      // Verify customer and order belong to this business
      const [customer] = await db
        .select()
        .from(customers)
        .where(and(
          eq(customers.id, body.customerId),
          eq(customers.businessId, businessId)
        ))
        .limit(1);
      
      if (!customer) {
        throw new Error('Customer not found');
      }
      
      const [order] = await db
        .select()
        .from(orders)
        .where(and(
          eq(orders.id, body.orderId),
          eq(orders.businessId, businessId),
          eq(orders.customerId, body.customerId)
        ))
        .limit(1);
      
      if (!order) {
        throw new Error('Order not found');
      }
      
      // In a real app, you would generate a payment link via Paystack or similar
      // For now, we'll use a placeholder
      const paymentUrl = `https://paystack.com/pay/${Math.random().toString(36).substr(2, 9)}`;
      
      // Send via WAHA
      const wahaResponse = await MessageService.sendPaymentLink(
        customer.phone,
        paymentUrl,
        body.amount
      );
      
      // Log the message
      const message = await MessageService.logMessage({
        businessId,
        customerId: customer.id,
        direction: 'outbound',
        messageType: 'payment_link',
        content: { 
          paymentUrl,
          amount: body.amount,
          orderId: body.orderId 
        },
        waMessageId: wahaResponse.id,
        status: 'sent',
      });
      
      return message;
    },
    {
      body: SendPaymentLinkDto,
      detail: {
        summary: 'Send payment link',
        security: [{ Bearer: [] }],
      },
    }
  );

// Need to import catalogItemsTable and ordersTable
import { catalogItems as catalogItemsTable, orders as ordersTable } from '../../database/schema';