import { Elysia, t } from 'elysia'
import { betterAuth } from 'better-auth'
import { Pool } from 'pg'
import { env } from '../config/env'

const auth = betterAuth({
  database: new Pool({ connectionString: env.databaseUrl }),
  secret: env.betterAuthSecret,
  baseURL: env.betterAuthUrl,
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
