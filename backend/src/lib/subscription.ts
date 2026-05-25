import { db } from '../database'
import { businesses, pricingTiers, catalogItems, users, messages } from '../database/schema'
import { eq, and, gte, count } from 'drizzle-orm'

export interface TierLimitResult {
  allowed: boolean
  limit: number
  current: number
  tier: string
}

export interface TierInfo {
  tier: string
  name: string
  maxUsers: number
  maxProducts: number
  maxMessages: number
  maxBroadcasts: number
  broadcastsEnabled: boolean
  analyticsEnabled: boolean
}

export async function getBusinessTier(businessId: string): Promise<TierInfo | null> {
  const result = await db
    .select({
      tier: pricingTiers.tier,
      name: pricingTiers.name,
      maxUsers: pricingTiers.maxUsers,
      maxProducts: pricingTiers.maxProducts,
      maxMessages: pricingTiers.maxMessages,
      maxBroadcasts: pricingTiers.maxBroadcasts,
      broadcastsEnabled: pricingTiers.broadcastsEnabled,
      analyticsEnabled: pricingTiers.analyticsEnabled,
    })
    .from(businesses)
    .innerJoin(pricingTiers, eq(businesses.subscriptionTier, pricingTiers.tier))
    .where(eq(businesses.id, businessId))
    .limit(1)

  if (!result[0]) return null
  return result[0]
}

export async function checkProductLimit(businessId: string): Promise<TierLimitResult> {
  const tier = await getBusinessTier(businessId)
  if (!tier) {
    return { allowed: false, limit: 0, current: 0, tier: 'unknown' }
  }

  const [countResult] = await db
    .select({ count: count() })
    .from(catalogItems)
    .where(eq(catalogItems.businessId, businessId))

  const current = countResult?.count ?? 0
  const limit = tier.maxProducts

  return {
    allowed: current < limit,
    limit,
    current,
    tier: tier.tier,
  }
}

export async function checkMessageLimit(businessId: string): Promise<TierLimitResult> {
  const tier = await getBusinessTier(businessId)
  if (!tier) {
    return { allowed: false, limit: 0, current: 0, tier: 'unknown' }
  }

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [countResult] = await db
    .select({ count: count() })
    .from(messages)
    .where(
      and(
        eq(messages.businessId, businessId),
        gte(messages.createdAt, startOfMonth),
      ),
    )

  const current = countResult?.count ?? 0
  const limit = tier.maxMessages

  return {
    allowed: current < limit,
    limit,
    current,
    tier: tier.tier,
  }
}

export async function checkUserLimit(businessId: string): Promise<TierLimitResult> {
  const tier = await getBusinessTier(businessId)
  if (!tier) {
    return { allowed: false, limit: 0, current: 0, tier: 'unknown' }
  }

  const [countResult] = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.businessId, businessId))

  const current = countResult?.count ?? 0
  const limit = tier.maxUsers

  return {
    allowed: current < limit,
    limit,
    current,
    tier: tier.tier,
  }
}
