import request from 'supertest'
import app from '../src/app'

describe('Goals API', () => {
  let authToken: string
  const testEmail = `goals${Date.now()}@test.com`
  const testPassword = 'GoalsTest123!'

  beforeAll(async () => {
    // Register a test user and get auth token
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({ email: testEmail, password: testPassword })

    authToken = registerResponse.body.token
  })

  describe('GET /api/goals', () => {
    it('should return empty array for new user', async () => {
      const response = await request(app)
        .get('/api/goals')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toEqual([])
    })
  })

  describe('POST /api/goals', () => {
    it('should create a new goal', async () => {
      const goalData = {
        title: 'Test Weight Loss Goal',
        description: 'Lose 10 pounds',
        target: 10,
        unit: 'lbs',
        category: 'WEIGHT',
        deadline: '2024-12-31'
      }

      const response = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send(goalData)

      expect(response.status).toBe(201)
      expect(response.body).toMatchObject({
        title: goalData.title,
        target: goalData.target,
        unit: goalData.unit,
        category: goalData.category,
        status: 'ACTIVE'
      })
      expect(response.body.userId).toBeDefined()
    })
  })

  describe('GET /api/analytics/goals', () => {
    it('should return goals with progress', async () => {
      const response = await request(app)
        .get('/api/analytics/goals')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)

      if (response.body.length > 0) {
        const goal = response.body[0]
        expect(goal).toHaveProperty('percentage')
        expect(goal).toHaveProperty('isCompleted')
        expect(goal).toHaveProperty('current')
      }
    })
  })
})