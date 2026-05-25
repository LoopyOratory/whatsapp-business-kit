import { config } from 'dotenv'
import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
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

export const app = new Elysia()
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
  .get('/health', () => ({ status: 'ok', timestamp: Date.now() }))

export type App = typeof app
