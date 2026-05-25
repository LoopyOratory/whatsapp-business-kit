import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  BETTER_AUTH_SECRET: z.string().min(32, 'BETTER_AUTH_SECRET must be at least 32 characters'),
  BETTER_AUTH_URL: z.string().url('BETTER_AUTH_URL must be a valid URL'),
  PAYSTACK_SECRET_KEY: z.string().min(1, 'PAYSTACK_SECRET_KEY is required'),
  PAYSTACK_PUBLIC_KEY: z.string().min(1, 'PAYSTACK_PUBLIC_KEY is required'),
  WAHA_API_URL: z.string().url('WAHA_API_URL must be a valid URL').optional().default('http://localhost:3001'),
  WAHA_API_KEY: z.string().optional().default(''),
  PORT: z.coerce.number().min(1).max(65535).optional().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).optional().default('development'),
  CORS_ORIGIN: z.string().optional().default('http://localhost:5173'),
})

export type Env = z.infer<typeof envSchema>

let _env: Env | null = null
let _envError: string | null = null

export function getEnv(): Env {
  if (_env) return _env
  const result = envSchema.safeParse(process.env)
  if (!result.success) {
    const missing = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('\n  ')
    _envError = `❌ Environment validation failed:\n  ${missing}`
    throw new Error(_envError)
  }
  _env = result.data
  return _env
}

export function getEnvError(): string | null {
  if (!_envError && !_env) {
    try { getEnv() } catch {}
  }
  return _envError
}
