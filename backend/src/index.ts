import { Elysia } from 'elysia'
import { app } from './app'
import { sharedErrors } from './shared/errors'
import { getEnv } from './config/validate'
import { logger } from './lib/logger'
import { initSentry } from './lib/sentry'

initSentry()

try {
  const env = getEnv()
  logger.info({ port: env.port, nodeEnv: env.NODE_ENV }, 'Starting server')
  
  const server = new Elysia()
    .use(sharedErrors)
    .use(app)
    .listen(env.port)
  
  logger.info(`🦊 Server running at http://localhost:${env.port}`)
} catch (err: any) {
  logger.error(err, 'Failed to start server')
  console.error(err.message)
  process.exit(1)
}
