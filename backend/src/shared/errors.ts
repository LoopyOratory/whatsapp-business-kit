import { Elysia } from 'elysia'

export const sharedErrors = new Elysia({ name: 'shared-errors' })
  .onError(({ code, error, status }) => {
    if (code === 'NOT_FOUND') return status(404, { error: 'Resource not found' })
    if (code === 'VALIDATION') return status(400, { error: error.message })
    console.error(error)
    return status(500, { error: 'Internal server error' })
  })
