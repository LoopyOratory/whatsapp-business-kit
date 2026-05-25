import { pgTable, uuid, text, timestamp, numeric, integer, boolean, jsonb, pgEnum } from 'drizzle-orm/pg-core'

// Enums
export const userRoleEnum = pgEnum('user_role', ['owner', 'admin', 'staff'])
export const subscriptionTierEnum = pgEnum('subscription_tier', ['free', 'starter', 'growth', 'business'])

export const businesses = pgTable('businesses', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  phone: text('phone').notNull().unique(),
  email: text('email'),
  logoUrl: text('logo_url'),
  address: text('address'),
  currency: text('currency').default('GHS'),
  settings: jsonb('settings').default('{}'),
  subscriptionTier: subscriptionTierEnum('subscription_tier').default('free').notNull(),
  subscriptionStatus: text('subscription_status').default('active'),
  subscriptionExpiresAt: timestamp('subscription_expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const pricingTiers = pgTable('pricing_tiers', {
  id: uuid('id').defaultRandom().primaryKey(),
  tier: subscriptionTierEnum('tier').unique().notNull(),
  name: text('name').notNull(),
  priceGhs: numeric('price_ghs').notNull(),
  priceUsd: numeric('price_usd').notNull(),
  maxUsers: integer('max_users').notNull(),
  maxProducts: integer('max_products').notNull(),
  maxMessages: integer('max_messages').notNull(),
  maxBroadcasts: integer('max_broadcasts').notNull(),
  broadcastsEnabled: boolean('broadcasts_enabled').default(false),
  analyticsEnabled: boolean('analytics_enabled').default(false),
  prioritySupport: boolean('priority_support').default(false),
  apiAccess: boolean('api_access').default(false),
  customBranding: boolean('custom_branding').default(false),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessId: uuid('business_id').references(() => businesses.id, { onDelete: 'cascade' }),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: userRoleEnum('role').default('staff').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const catalogItems = pgTable('catalog_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessId: uuid('business_id').references(() => businesses.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  price: numeric('price').notNull(),
  currency: text('currency').default('GHS'),
  category: text('category'),
  imageUrl: text('image_url'),
  isAvailable: boolean('is_available').default(true),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const customers = pgTable('customers', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessId: uuid('business_id').references(() => businesses.id, { onDelete: 'cascade' }).notNull(),
  phone: text('phone').notNull(),
  name: text('name'),
  email: text('email'),
  totalOrders: integer('total_orders').default(0),
  totalSpent: numeric('total_spent').default('0'),
  lastOrderAt: timestamp('last_order_at'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessId: uuid('business_id').references(() => businesses.id, { onDelete: 'cascade' }).notNull(),
  customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'set null' }),
  status: text('status').default('pending'),
  totalAmount: numeric('total_amount').notNull(),
  currency: text('currency').default('GHS'),
  paymentStatus: text('payment_status').default('unpaid'),
  paymentReference: text('payment_reference'),
  deliveryAddress: text('delivery_address'),
  notes: text('notes'),
  source: text('source').default('whatsapp'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const orderItems = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  catalogItemId: uuid('catalog_item_id').references(() => catalogItems.id, { onDelete: 'set null' }),
  itemName: text('item_name').notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: numeric('unit_price').notNull(),
  totalPrice: numeric('total_price').notNull(),
})

export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessId: uuid('business_id').references(() => businesses.id, { onDelete: 'cascade' }).notNull(),
  customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'set null' }),
  direction: text('direction').notNull(),
  messageType: text('message_type').notNull(),
  content: jsonb('content').default('{}'),
  waMessageId: text('wa_message_id'),
  status: text('status').default('sent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const broadcasts = pgTable('broadcasts', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessId: uuid('business_id').references(() => businesses.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  content: jsonb('content').default('{}'),
  audienceFilter: jsonb('audience_filter'),
  sentCount: integer('sent_count').default(0),
  deliveredCount: integer('delivered_count').default(0),
  failedCount: integer('failed_count').default(0),
  status: text('status').default('draft'),
  scheduledAt: timestamp('scheduled_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const paymentTransactions = pgTable('payment_transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessId: uuid('business_id').references(() => businesses.id, { onDelete: 'cascade' }).notNull(),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'set null' }),
  customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'set null' }).notNull(),
  amount: numeric('amount').notNull(),
  currency: text('currency').default('GHS'),
  paystackReference: text('paystack_reference').notNull(),
  paystackStatus: text('paystack_status'),
  channel: text('channel'),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const table = {
  businesses,
  pricingTiers,
  users,
  catalogItems,
  customers,
  orders,
  orderItems,
  messages,
  broadcasts,
  paymentTransactions,
} as const

export type Table = typeof table
