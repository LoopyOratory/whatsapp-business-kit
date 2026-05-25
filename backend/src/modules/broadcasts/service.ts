import { env } from '../../config/env';
import { db } from '../../database';
import { broadcasts, customers } from '../../database/schema';
import { eq, and, gt, ilike, sql } from 'drizzle-orm';
import { MessageService } from '../messages/service';

export abstract class BroadcastService {
  static async list(businessId: string, limit: number = 50, offset: number = 0) {
    const result = await db
      .select()
      .from(broadcasts)
      .where(eq(broadcasts.businessId, businessId))
      .orderBy(broadcasts.createdAt)
      .limit(limit)
      .offset(offset);

    return result;
  }

  static async getById(id: string, businessId: string) {
    const [broadcast] = await db
      .select()
      .from(broadcasts)
      .where(and(eq(broadcasts.id, id), eq(broadcasts.businessId, businessId)));

    return broadcast;
  }

  static async create(data: {
    title: string;
    content: Record<string, unknown>;
    audienceFilter?: Record<string, unknown>;
    scheduledAt?: string;
    businessId: string;
  }) {
    const [broadcast] = await db
      .insert(broadcasts)
      .values({
        businessId: data.businessId,
        title: data.title,
        content: data.content,
        audienceFilter: data.audienceFilter ?? null,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        status: data.scheduledAt ? 'draft' : 'draft',
      })
      .returning();

    return broadcast;
  }

  static async send(broadcastId: string, businessId: string) {
    // Get the broadcast
    const broadcast = await this.getById(broadcastId, businessId);
    if (!broadcast) {
      throw new Error('Broadcast not found');
    }

    // Update status to sending
    await db
      .update(broadcasts)
      .set({ status: 'sending' })
      .where(and(eq(broadcasts.id, broadcastId), eq(broadcasts.businessId, businessId)));

    try {
      // Get all customer phones for this business
      const customerList = await db
        .select({ phone: customers.phone })
        .from(customers)
        .where(eq(customers.businessId, businessId));

      let sentCount = 0;
      let failedCount = 0;

      // Send message to each customer
      for (const customer of customerList) {
        try {
          await MessageService.sendWhatsApp(customer.phone, broadcast.content.text || '');
          
          // Log the sent message
          await MessageService.logMessage({
            businessId,
            direction: 'outbound',
            messageType: 'text',
            content: broadcast.content,
            status: 'sent',
          });

          sentCount++;
        } catch (error) {
          console.error(`Failed to send message to ${customer.phone}:`, error);
          
          // Log the failed message
          await MessageService.logMessage({
            businessId,
            direction: 'outbound',
            messageType: 'text',
            content: broadcast.content,
            status: 'failed',
          });

          failedCount++;
        }
      }

      // Update broadcast with final counts and status
      await db
        .update(broadcasts)
        .set({
          sentCount,
          failedCount,
          status: 'completed',
        })
        .where(and(eq(broadcasts.id, broadcastId), eq(broadcasts.businessId, businessId)));

      return {
        sentCount,
        failedCount,
        status: 'completed',
      };
    } catch (error) {
      // If something goes wrong, update status to cancelled
      await db
        .update(broadcasts)
        .set({ status: 'cancelled' })
        .where(and(eq(broadcasts.id, broadcastId), eq(broadcasts.businessId, businessId)));

      throw error;
    }
  }

  static async getStats(id: string, businessId: string) {
    const [broadcast] = await db
      .select({
        sentCount: broadcasts.sentCount,
        deliveredCount: broadcasts.deliveredCount,
        failedCount: broadcasts.failedCount,
      })
      .from(broadcasts)
      .where(and(eq(broadcasts.id, id), eq(broadcasts.businessId, businessId)));

    if (!broadcast) {
      throw new Error('Broadcast not found');
    }

    return broadcast;
  }
}