import { APIRequestContext } from '@playwright/test'

export async function waitForHealth(request: APIRequestContext, timeout = 120000) {
  const backend = process.env.BACKEND_URL || 'http://localhost:4000'
  const healthUrl = `${backend}/api/health`
  const start = Date.now()
  while (Date.now() - start < timeout) {
    try {
      const res = await request.get(healthUrl)
      if (res && res.status() === 200) return
    } catch (e) {
      // ignore network errors while server is starting
    }
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new Error(`Server ${healthUrl} did not respond in time`)
}

export async function waitForFrontend(request: APIRequestContext, timeout = 30000) {
  const frontend = process.env.FRONTEND_URL || 'http://localhost:5173'
  const start = Date.now()
  while (Date.now() - start < timeout) {
    try {
      const res = await request.get(frontend)
      if (res && res.status() === 200) return
    } catch (e) {
      // ignore while frontend starts
    }
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new Error(`Frontend ${frontend} did not respond in time`)
}
