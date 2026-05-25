import { config } from 'dotenv'
import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { swagger } from '@elysiajs/swagger'
import { createRateLimiter } from './lib/rate-limiter'
import { betterAuthPlugin } from './plugins/auth'
import { businessesModule } from './modules/businesses'
import { catalogModule } from './modules/catalog'
import { ordersModule } from './modules/orders'
import { customersModule } from './modules/customers'
import { messagesModule } from './modules/messages'
import { broadcastsModule } from './modules/broadcasts'
import { paymentsModule } from './modules/payments'
import { whatsappModule } from './modules/whatsapp'

config()

const authLimiter = createRateLimiter({ name: 'auth', windowMs: 15 * 60 * 1000, max: 10 })
const apiLimiter = createRateLimiter({ name: 'api', windowMs: 60 * 1000, max: 300 })

export const app = new Elysia()
  .onBeforeHandle(async ({ request, set }) => {
    const url = new URL(request.url)
    const path = url.pathname
    // Skip health check
    if (path === '/health') return
    const limiter = path.startsWith('/api/auth/') ? authLimiter : apiLimiter
    const result = await limiter(request.headers)
    if (!result.pass) {
      set.status = 429
      for (const [k, v] of Object.entries(result.headers)) set.headers[k] = v
      return { error: 'Too many requests', retryAfter: result.headers['Retry-After'] }
    }
    for (const [k, v] of Object.entries(result.headers)) set.headers[k] = v
  })
  .use(swagger({
    path: '/docs',
    documentation: {
      info: { title: 'WhatsApp Business Kit API', version: '1.0.0', description: 'API for managing WhatsApp-based business operations' },
    },
  }))
  .use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  }))
  .use(betterAuthPlugin)
  .use(businessesModule)
  .use(catalogModule)
  .use(ordersModule)
  .use(customersModule)
  .use(messagesModule)
  .use(broadcastsModule)
  .use(paymentsModule)
  .use(whatsappModule)
  .get('/health', async ({ db: _db }) => {
    let dbStatus = 'disconnected'
    try {
      const { db } = await import('./database')
      await db.execute({ query: 'SELECT 1', params: [] } as any)
      dbStatus = 'connected'
    } catch {}
    return {
      status: 'ok',
      database: dbStatus,
      timestamp: Date.now(),
      uptime: process.uptime(),
    }
  })

export type App = typeof app
