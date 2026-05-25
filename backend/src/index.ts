import { Elysia } from 'elysia'
import { app } from './app'
import { env } from './config/env'
import { sharedErrors } from './shared/errors'

const server = new Elysia()
  .use(sharedErrors)
  .use(app)
  .listen(env.port)

console.log(`🦊 Server running at http://localhost:${env.port}`)
export type Server = typeof server
