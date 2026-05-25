import { db } from '../../database'
import { orders, orderItems, customers, catalogItems } from '../../database/schema'
import { eq, and, sql, desc } from 'drizzle-orm'
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'

export abstract class OrderService {
  static async list(
    businessId: string, 
    limit?: number, 
    offset?: number, 
    status?: string,
    paymentStatus?: string
  ) {
    let query = db
      .select({
        id: orders.id,
        businessId: orders.businessId,
        customerId: orders.customerId,
        status: orders.status,
        totalAmount: orders.totalAmount,
        currency: orders.currency,
        paymentStatus: orders.paymentStatus,
        paymentReference: orders.paymentReference,
        deliveryAddress: orders.deliveryAddress,
        notes: orders.notes,
        source: orders.source,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        customerName: customers.name,
        items: sql<Array<typeof orderItems.$inferSelect>>`
          (SELECT json_agg(row_to_json(oi)) 
           FROM order_items oi 
           WHERE oi.order_id = orders.id)
        `.as('items')
      })
      .from(orders)
      .leftJoin(customers, eq(orders.customerId, customers.id))
      .where(eq(orders.businessId, businessId))

    if (status) {
      query = query.where(eq(orders.status, status))
    }

    if (paymentStatus) {
      query = query.where(eq(orders.paymentStatus, paymentStatus))
    }

    query = query
      .orderBy(desc(orders.createdAt))
      .limit(limit ?? 50)
      .offset(offset ?? 0)

    return query.execute()
  }

  static async getById(id: string, businessId: string) {
    const result = await db
      .select({
        id: orders.id,
        businessId: orders.businessId,
        customerId: orders.customerId,
        status: orders.status,
        totalAmount: orders.totalAmount,
        currency: orders.currency,
        paymentStatus: orders.paymentStatus,
        paymentReference: orders.paymentReference,
        deliveryAddress: orders.deliveryAddress,
        notes: orders.notes,
        source: orders.source,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        customerName: customers.name,
        customerPhone: customers.phone,
        items: sql<Array<typeof orderItems.$inferSelect>>`
          (SELECT json_agg(row_to_json(oi)) 
           FROM order_items oi 
           WHERE oi.order_id = orders.id)
        `.as('items')
      })
      .from(orders)
      .leftJoin(customers, eq(orders.customerId, customers.id))
      .where(and(eq(orders.id, id), eq(orders.businessId, businessId)))
      .limit(1)

    return result[0] || null
  }

  static async create(businessId: string, data: typeof orders.$inferInsert & { items: Array<{ catalogItemId?: string, itemName: string, quantity: number, unitPrice: number }> }) {
    return await db.transaction(async (tx) => {
      // Calculate total amount
      const totalAmount = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
      
      // Create order
      const [order] = await tx
        .insert(orders)
        .values({
          businessId,
          customerId: data.customerId,
          status: 'pending',
          totalAmount,
          currency: data.currency ?? 'GHS',
          paymentStatus: 'unpaid',
          deliveryAddress: data.deliveryAddress,
          notes: data.notes,
          source: data.source ?? 'whatsapp',
        })
        .returning()

      // Create order items
      const orderItemsData = data.items.map(item => ({
        orderId: order.id,
        catalogItemId: item.catalogItemId,
        itemName: item.itemName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice,
      }))

      await tx.insert(orderItems).values(orderItemsData)

      // Update customer stats if customerId provided
      if (data.customerId) {
        await CustomerService.updateStats(data.customerId, businessId, Number(totalAmount))
      }

      return order
    })
  }

  static async updateStatus(id: string, businessId: string, status: typeof orders.$inferSelect['status']) {
    const result = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(orders.id, id), eq(orders.businessId, businessId)))
      .returning()

    return result[0]
  }

  static async updatePayment(
    id: string, 
    businessId: string, 
    paymentStatus: typeof orders.$inferSelect['paymentStatus'],
    paymentReference?: string
  ) {
    const result = await db
      .update(orders)
      .set({ 
        paymentStatus, 
        paymentReference: paymentReference ?? null,
        updatedAt: new Date() 
      })
      .where(and(eq(orders.id, id), eq(orders.businessId, businessId)))
      .returning()

    return result[0]
  }

  static async getStats(businessId: string) {
    const result = await db
      .select({
        total: sql<number>`count(*)`,
        pending: sql<number>`count(*) filter (where ${orders.status} = 'pending')`,
        confirmed: sql<number>`count(*) filter (where ${orders.status} = 'confirmed')`,
        processing: sql<number>`count(*) filter (where ${orders.status} = 'processing')`,
        completed: sql<number>`count(*) filter (where ${orders.status} = 'completed')`,
        cancelled: sql<number>`count(*) filter (where ${orders.status} = 'cancelled')`,
        revenue: sql<number>`coalesce(sum(${orders.totalAmount}) filter (where ${orders.paymentStatus} = 'paid'), 0)`,
      })
      .from(orders)
      .where(eq(orders.businessId, businessId))

    return result[0]
  }
}

// Helper service for customer stats update
abstract class CustomerService {
  static async updateStats(customerId: string, businessId: string, amount: number) {
    await db
      .update(customers)
      .set({
        totalOrders: sql`${customers.totalOrders} + 1`,
        totalSpent: sql`${customers.totalSpent} + ${amount}`,
        lastOrderAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(customers.id, customerId), eq(customers.businessId, businessId)))
  }
}