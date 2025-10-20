import request from 'supertest'
import app from '../src/app'

describe('Health endpoint', () => {
  it('should return status ok', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok' })
  })
})
