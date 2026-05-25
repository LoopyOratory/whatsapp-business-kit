// Simple in-memory rate limiter for Elysia
// Stores request counts per IP in sliding windows

interface RateLimitEntry {
  count: number
  resetAt: number
}

const stores = new Map<string, Map<string, RateLimitEntry>>()

// Cleanup expired entries every 60 seconds
setInterval(() => {
  const now = Date.now()
  for (const [, store] of stores) {
    for (const [key, entry] of store) {
      if (entry.resetAt <= now) store.delete(key)
    }
  }
}, 60_000)

export function createRateLimiter(opts: {
  name: string
  windowMs: number
  max: number
  message?: string
}) {
  if (!stores.has(opts.name)) {
    stores.set(opts.name, new Map())
  }
  const store = stores.get(opts.name)!

  return async (headers: Headers): Promise<{ pass: boolean; headers: Record<string, string> }> => {
    const ip = headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
      || headers.get('x-real-ip') 
      || 'unknown'
    const now = Date.now()
    const entry = store.get(ip)

    if (!entry || entry.resetAt <= now) {
      store.set(ip, { count: 1, resetAt: now + opts.windowMs })
      return { 
        pass: true, 
        headers: { 
          'X-RateLimit-Limit': String(opts.max),
          'X-RateLimit-Remaining': String(opts.max - 1),
          'X-RateLimit-Reset': String(Math.ceil((now + opts.windowMs) / 1000)),
        } 
      }
    }

    entry.count++
    const remaining = Math.max(0, opts.max - entry.count)

    if (entry.count > opts.max) {
      return { 
        pass: false, 
        headers: { 
          'Retry-After': String(Math.ceil((entry.resetAt - now) / 1000)),
          'X-RateLimit-Limit': String(opts.max),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(entry.resetAt / 1000)),
        } 
      }
    }

    return { 
      pass: true, 
      headers: { 
        'X-RateLimit-Limit': String(opts.max),
        'X-RateLimit-Remaining': String(remaining),
        'X-RateLimit-Reset': String(Math.ceil(entry.resetAt / 1000)),
      } 
    }
  }
}
