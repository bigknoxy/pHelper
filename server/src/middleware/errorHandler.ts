import { Request, Response, NextFunction } from 'express'

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  console.error(err)
  if (res.headersSent) return next(err as unknown)

  let status = 500
  let message = 'Internal server error'

  if (err && typeof err === 'object') {
    const e = err as Record<string, unknown>
    if ('message' in e && typeof e.message === 'string') message = e.message
    if ('status' in e && typeof e.status === 'number') status = e.status
  }

  res.status(status).json({ error: message })
}
