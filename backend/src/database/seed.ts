// Seed script — run with: DATABASE_URL=xxx bun run src/database/seed.ts
import { db } from '../database'
import { pricingTiers, businesses, catalogItems } from '../database/schema'
import { config } from 'dotenv'
config()

const tiers = [
  {
    tier: 'free' as const,
    name: 'Free',
    priceGhs: '0',
    priceUsd: '0',
    maxUsers: 1,
    maxProducts: 50,
    maxMessages: 100,
    maxBroadcasts: 0,
    broadcastsEnabled: false,
    analyticsEnabled: false,
    prioritySupport: false,
    apiAccess: false,
    customBranding: false,
    description: 'Get started with basic catalog management',
  },
  {
    tier: 'starter' as const,
    name: 'Starter',
    priceGhs: '99',
    priceUsd: '7',
    maxUsers: 2,
    maxProducts: 200,
    maxMessages: 1000,
    maxBroadcasts: 50,
    broadcastsEnabled: true,
    analyticsEnabled: false,
    prioritySupport: false,
    apiAccess: false,
    customBranding: false,
    description: 'For growing businesses — broadcasts and more products',
  },
  {
    tier: 'growth' as const,
    name: 'Growth',
    priceGhs: '249',
    priceUsd: '17',
    maxUsers: 5,
    maxProducts: 500,
    maxMessages: 5000,
    maxBroadcasts: 200,
    broadcastsEnabled: true,
    analyticsEnabled: true,
    prioritySupport: false,
    apiAccess: false,
    customBranding: false,
    description: 'Full analytics, unlimited potential',
  },
  {
    tier: 'business' as const,
    name: 'Business',
    priceGhs: '499',
    priceUsd: '35',
    maxUsers: 999,
    maxProducts: 9999,
    maxMessages: 99999,
    maxBroadcasts: 9999,
    broadcastsEnabled: true,
    analyticsEnabled: true,
    prioritySupport: true,
    apiAccess: true,
    customBranding: true,
    description: 'Everything unlimited with priority support',
  },
]

async function seed() {
  console.log('Seeding pricing tiers...')
  for (const tier of tiers) {
    await db.insert(pricingTiers).values(tier).onConflictDoNothing({ target: pricingTiers.tier })
    console.log(`  ✓ ${tier.name} — GHS ${tier.priceGhs}/mo`)
  }
  console.log('Done!')
}

seed().catch(console.error)
