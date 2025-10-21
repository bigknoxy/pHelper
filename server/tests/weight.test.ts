import request from 'supertest'
import app from '../src/app'

import { TextEncoder } from 'util'
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder
}

describe('Weight endpoints', () => {
  let token: string
  let entryId: string
  const testEmail = `weight${Date.now()}@test.com`
  const testPassword = 'WeightTest123!'

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: testEmail, password: testPassword })
    token = res.body.token
  })

  it('should add a weight entry', async () => {
    const res = await request(app)
      .post('/api/weights')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: new Date().toISOString(), weight: 175.5, note: 'Test entry' })
    expect(res.status).toBe(201)
    expect(res.body.weight).toBe(175.5)
    entryId = res.body.id
  })

  it('should get weight entries', async () => {
    const res = await request(app)
      .get('/api/weights')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)
  })

  it('should delete a weight entry', async () => {
    const res = await request(app)
      .delete(`/api/weights/${entryId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(204)
  })
})
