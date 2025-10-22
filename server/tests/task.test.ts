import request from 'supertest'
import app from '../src/app'

import { TextEncoder } from 'util'
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder as any
}

describe('Task endpoints', () => {
  let token: string
  let taskId: string
  const testEmail = `task${Date.now()}@test.com`
  const testPassword = 'TaskTest123!'

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: testEmail, password: testPassword })
    token = res.body.token
  })

  it('should add a task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test Task', description: 'Automated test', status: 'PENDING' })
    expect(res.status).toBe(201)
    expect(res.body.title).toBe('Test Task')
    taskId = res.body.id
  })

  it('should get tasks', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)
  })

  it('should delete a task', async () => {
    const res = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(204)
  })
})
