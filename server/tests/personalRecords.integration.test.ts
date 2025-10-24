import request from 'supertest'
import app from '../src/app'
import prisma from '../src/utils/prisma'
import { PrismaClient } from '@prisma/client'

const db = prisma as unknown as PrismaClient

describe('Personal Records API Integration Tests', () => {
  let authToken: string
  let userId: string

  beforeAll(async () => {
    // Create test user and get auth token
    const user = await db.user.create({
      data: {
        email: 'test@example.com',
        passwordHash: 'hashedpassword',
      },
    })
    userId = user.id

    // Login to get token (simplified for testing)
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password',
      })

    if (loginResponse.status === 200) {
      authToken = loginResponse.body.token
    } else {
      // Create a simple token for testing
      authToken = 'test-token'
    }
  })

  beforeEach(async () => {
    // Clean up personal records, workouts, and exercises before each test
    await db.personalRecord.deleteMany()
    await db.workout.deleteMany()
    await db.exercise.deleteMany()

    // Create test exercise
    await db.exercise.create({
      data: {
        name: 'Bench Press',
        category: 'STRENGTH',
        muscleGroups: ['CHEST', 'TRICEPS'],
        equipment: ['Barbell', 'Bench'],
        difficulty: 'INTERMEDIATE',
      },
    })
  })

  afterAll(async () => {
    await db.$disconnect()
  })

  describe('GET /api/personal-records', () => {
    beforeEach(async () => {
      const exercise = await db.exercise.findFirst()
      if (exercise) {
        // Create test personal records
        await db.personalRecord.createMany({
          data: [
            {
              userId,
              recordType: 'MAX_WEIGHT',
              value: 225,
              date: new Date('2025-01-15'),
              exerciseId: exercise.id,
            },
            {
              userId,
              recordType: 'MAX_REPS',
              value: 15,
              date: new Date('2025-01-10'),
              exerciseId: exercise.id,
            },
          ],
        })
      }
    })

    it('should return all personal records', async () => {
      const response = await request(app)
        .get('/api/personal-records')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.records).toHaveLength(2)
      expect(response.body.total).toBe(2)
      expect(response.body.records[0]).toHaveProperty('recordType')
      expect(response.body.records[0]).toHaveProperty('value')
      expect(response.body.records[0]).toHaveProperty('exercise')
    })

    it('should filter records by exercise', async () => {
      const exercise = await db.exercise.findFirst()
      if (exercise) {
        const response = await request(app)
          .get(`/api/personal-records?exerciseId=${exercise.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)

        expect(response.body.records).toHaveLength(2)
        expect(response.body.records.every((r: any) => r.exerciseId === exercise.id)).toBe(true)
      }
    })

    it('should filter records by record type', async () => {
      const response = await request(app)
        .get('/api/personal-records?recordType=MAX_WEIGHT')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.records).toHaveLength(1)
      expect(response.body.records[0].recordType).toBe('MAX_WEIGHT')
    })

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/api/personal-records?limit=1&offset=0')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.records).toHaveLength(1)
      expect(response.body.limit).toBe(1)
      expect(response.body.offset).toBe(0)
    })
  })

  describe('GET /api/personal-records/:id', () => {
    let recordId: string

    beforeEach(async () => {
      const exercise = await db.exercise.findFirst()
      if (exercise) {
        const record = await db.personalRecord.create({
          data: {
            userId,
            recordType: 'MAX_WEIGHT',
            value: 225,
            date: new Date('2025-01-15'),
            exerciseId: exercise.id,
          },
        })
        recordId = record.id
      }
    })

    it('should return personal record by id', async () => {
      const response = await request(app)
        .get(`/api/personal-records/${recordId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.recordType).toBe('MAX_WEIGHT')
      expect(response.body.value).toBe(225)
      expect(response.body.exercise).toBeDefined()
    })

    it('should return 404 for non-existent record', async () => {
      const response = await request(app)
        .get('/api/personal-records/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)

      expect(response.body.error).toBe('Personal record not found')
    })
  })

  describe('POST /api/personal-records', () => {
    it('should create new personal record', async () => {
      const exercise = await db.exercise.findFirst()
      if (exercise) {
        const newRecord = {
          recordType: 'MAX_WEIGHT',
          value: 250,
          date: '2025-01-20',
          exerciseId: exercise.id,
          notes: 'New bench press PR!',
        }

        const response = await request(app)
          .post('/api/personal-records')
          .set('Authorization', `Bearer ${authToken}`)
          .send(newRecord)
          .expect(201)

        expect(response.body.recordType).toBe('MAX_WEIGHT')
        expect(response.body.value).toBe(250)
        expect(response.body.exerciseId).toBe(exercise.id)
        expect(response.body.notes).toBe('New bench press PR!')

        // Verify in database
        const dbRecord = await db.personalRecord.findUnique({
          where: { id: response.body.id },
        })
        expect(dbRecord).toBeTruthy()
      }
    })

    it('should return 400 for invalid record data', async () => {
      const invalidRecord = {
        recordType: 'INVALID_TYPE',
        value: -10, // Invalid: negative value
      }

      const response = await request(app)
        .post('/api/personal-records')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidRecord)
        .expect(400)

      expect(response.body.error).toBeDefined()
    })

    it('should return 400 when exercise does not exist', async () => {
      const invalidRecord = {
        recordType: 'MAX_WEIGHT',
        value: 225,
        date: '2025-01-20',
        exerciseId: 'non-existent-id',
      }

      const response = await request(app)
        .post('/api/personal-records')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidRecord)
        .expect(400)

      expect(response.body.error).toBe('Exercise not found')
    })
  })

  describe('PUT /api/personal-records/:id', () => {
    let recordId: string

    beforeEach(async () => {
      const exercise = await db.exercise.findFirst()
      if (exercise) {
        const record = await db.personalRecord.create({
          data: {
            userId,
            recordType: 'MAX_WEIGHT',
            value: 225,
            date: new Date('2025-01-15'),
            exerciseId: exercise.id,
          },
        })
        recordId = record.id
      }
    })

    it('should update personal record', async () => {
      const updates = {
        value: 235,
        notes: 'Updated PR!',
      }

      const response = await request(app)
        .put(`/api/personal-records/${recordId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect(200)

      expect(response.body.value).toBe(235)
      expect(response.body.notes).toBe('Updated PR!')
      expect(response.body.recordType).toBe('MAX_WEIGHT') // Unchanged
    })

    it('should return 404 for non-existent record', async () => {
      const response = await request(app)
        .put('/api/personal-records/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ value: 250 })
        .expect(404)

      expect(response.body.error).toBe('Personal record not found')
    })

    it('should return 400 for invalid update data', async () => {
      const response = await request(app)
        .put(`/api/personal-records/${recordId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ recordType: 'INVALID_TYPE' })
        .expect(400)

      expect(response.body.error).toBeDefined()
    })
  })

  describe('DELETE /api/personal-records/:id', () => {
    let recordId: string

    beforeEach(async () => {
      const exercise = await db.exercise.findFirst()
      if (exercise) {
        const record = await db.personalRecord.create({
          data: {
            userId,
            recordType: 'MAX_WEIGHT',
            value: 225,
            date: new Date('2025-01-15'),
            exerciseId: exercise.id,
          },
        })
        recordId = record.id
      }
    })

    it('should delete personal record', async () => {
      const response = await request(app)
        .delete(`/api/personal-records/${recordId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204)

      // Verify record is deleted
      const dbRecord = await db.personalRecord.findUnique({
        where: { id: recordId },
      })
      expect(dbRecord).toBeNull()
    })

    it('should return 404 for non-existent record', async () => {
      const response = await request(app)
        .delete('/api/personal-records/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)

      expect(response.body.error).toBe('Personal record not found')
    })
  })

  describe('GET /api/personal-records/stats', () => {
    beforeEach(async () => {
      const exercise = await db.exercise.findFirst()
      if (exercise) {
        // Create test personal records for stats
        await db.personalRecord.createMany({
          data: [
            {
              userId,
              recordType: 'MAX_WEIGHT',
              value: 225,
              date: new Date('2025-01-15'),
              exerciseId: exercise.id,
            },
            {
              userId,
              recordType: 'MAX_REPS',
              value: 15,
              date: new Date('2025-01-10'),
              exerciseId: exercise.id,
            },
            {
              userId,
              recordType: 'MAX_WEIGHT',
              value: 200,
              date: new Date('2025-01-05'),
              exerciseId: exercise.id,
            },
          ],
        })
      }
    })

    it('should return personal record statistics', async () => {
      const response = await request(app)
        .get('/api/personal-records/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('totalRecords')
      expect(response.body).toHaveProperty('exerciseStats')
      expect(response.body.totalRecords).toBe(3)
      expect(response.body.exerciseStats).toHaveLength(1) // One exercise
    })

    it('should filter stats by exercise', async () => {
      const exercise = await db.exercise.findFirst()
      if (exercise) {
        const response = await request(app)
          .get(`/api/personal-records/stats?exerciseId=${exercise.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)

        expect(response.body.exerciseStats).toHaveLength(1)
        expect(response.body.exerciseStats[0].exerciseId).toBe(exercise.id)
      }
    })
  })
})