let Sentry: typeof import('@sentry/bun') | null = null

export function initSentry() {
  const dsn = process.env.SENTRY_DSN
  if (!dsn) {
    console.log('[sentry] disabled — SENTRY_DSN not set')
    return
  }
  try {
    const sentryModule = require('@sentry/bun') as typeof import('@sentry/bun')
    sentryModule.init({
      dsn,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    })
    Sentry = sentryModule
    console.log('[sentry] initialized')
  } catch (err) {
    console.error('[sentry] init failed:', err)
  }
}

export function captureException(error: unknown, context?: Record<string, unknown>) {
  if (Sentry) {
    Sentry.captureException(error, { extra: context })
  }
}
