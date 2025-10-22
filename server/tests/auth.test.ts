
import request from 'supertest'
import app from '../src/app'

// Polyfill TextEncoder for Node.js 18+ test environment
import { TextEncoder } from 'util'
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder as any
}

describe('Auth endpoints', () => {
  const testEmail = `user${Date.now()}@test.com`
  const testPassword = 'TestPass123!'
  // token assigned in tests when registering; keep for reuse across tests
  let token: string

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: testEmail, password: testPassword })
    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
    token = res.body.token
    // use token variable to satisfy lint rule about unused vars
    expect(token).toBeDefined()
  })

  it('should login with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: testPassword })
    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
  })

  it('should fail login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: 'wrongpass' })
    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Invalid credentials')
  })
})
