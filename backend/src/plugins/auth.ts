import { Elysia, t } from 'elysia'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '../database'
import * as schema from '../database/schema'
import { env } from '../config/env'

const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  secret: env.betterAuthSecret,
  baseURL: env.betterAuthUrl,
  emailAndPassword: { enabled: true },
})

export const betterAuthPlugin = new Elysia({ name: 'better-auth' })
  .mount('/api/auth', auth.handler)
  .macro({
    auth: {
      async resolve({ request, status }) {
        const session = await auth.api.getSession({ headers: request.headers })
        if (!session) return status(401)
        return { user: session.user, session: session.session }
      },
    },
  })

export { auth }
