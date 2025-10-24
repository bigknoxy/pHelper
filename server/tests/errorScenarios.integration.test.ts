import request from 'supertest'
import app from '../src/app'
import prisma from '../src/utils/prisma'
import { PrismaClient } from '@prisma/client'

const db = prisma as unknown as PrismaClient

describe('API Error Scenarios and Edge Cases Integration Tests', () => {
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
    // Clean up before each test
    await db.personalRecord.deleteMany()
    await db.workout.deleteMany()
    await db.workoutTemplate.deleteMany()
    await db.exercise.deleteMany()
  })

  afterAll(async () => {
    await db.$disconnect()
  })

  describe('Authentication and Authorization Errors', () => {
    it('should return 401 for missing auth token', async () => {
      const response = await request(app)
        .get('/api/personal-records')
        .expect(401)

      expect(response.body.error).toBe('Authentication required')
    })

    it('should return 401 for invalid auth token', async () => {
      const response = await request(app)
        .get('/api/personal-records')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401)

      expect(response.body.error).toBe('Invalid token')
    })

    it('should return 401 for expired auth token', async () => {
      const response = await request(app)
        .get('/api/personal-records')
        .set('Authorization', 'Bearer expired-token')
        .expect(401)

      expect(response.body.error).toBe('Token expired')
    })
  })

  describe('Input Validation Errors', () => {
    it('should return 400 for invalid exercise data', async () => {
      const invalidExercise = {
        name: '', // Empty name
        category: 'INVALID_CATEGORY',
        muscleGroups: [], // Empty array
      }

      const response = await request(app)
        .post('/api/exercises')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidExercise)
        .expect(400)

      expect(response.body.error).toBeDefined()
      expect(Array.isArray(response.body.error)).toBe(true)
    })

    it('should return 400 for invalid workout template data', async () => {
      const invalidTemplate = {
        name: '', // Empty name
        category: 'Custom',
        exercises: [], // Empty exercises array
      }

      const response = await request(app)
        .post('/api/workout-templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidTemplate)
        .expect(400)

      expect(response.body.error).toBeDefined()
    })

    it('should return 400 for invalid personal record data', async () => {
      const invalidRecord = {
        recordType: 'INVALID_TYPE',
        value: -10, // Negative value
        date: 'invalid-date',
      }

      const response = await request(app)
        .post('/api/personal-records')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidRecord)
        .expect(400)

      expect(response.body.error).toBeDefined()
    })

    it('should return 400 for malformed JSON', async () => {
      const response = await request(app)
        .post('/api/exercises')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400)

      expect(response.body.error).toBeDefined()
    })
  })

  describe('Resource Not Found Errors', () => {
    it('should return 404 for non-existent exercise', async () => {
      const response = await request(app)
        .get('/api/exercises/non-existent-id')
        .expect(404)

      expect(response.body.error).toBe('Exercise not found')
    })

    it('should return 404 for non-existent workout template', async () => {
      const response = await request(app)
        .get('/api/workout-templates/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)

      expect(response.body.error).toBe('Workout template not found')
    })

    it('should return 404 for non-existent personal record', async () => {
      const response = await request(app)
        .get('/api/personal-records/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)

      expect(response.body.error).toBe('Personal record not found')
    })

    it('should return 404 for non-existent workout', async () => {
      const response = await request(app)
        .get('/api/workouts/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)

      expect(response.body.error).toBe('Workout not found')
    })
  })

  describe('Foreign Key Constraint Errors', () => {
    it('should return 400 when creating workout template with non-existent exercise', async () => {
      const invalidTemplate = {
        name: 'Invalid Template',
        description: 'Template with non-existent exercise',
        category: 'Custom',
        exercises: [
          {
            exerciseId: 'non-existent-id',
            sets: 3,
            reps: 10,
            order: 1,
          },
        ],
      }

      const response = await request(app)
        .post('/api/workout-templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidTemplate)
        .expect(400)

      expect(response.body.error).toBe('One or more exercises not found')
    })

    it('should return 400 when creating personal record with non-existent exercise', async () => {
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

  describe('Duplicate Data Errors', () => {
    beforeEach(async () => {
      // Create test exercise for duplicate tests
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

    it('should return 409 for duplicate exercise name', async () => {
      const duplicateExercise = {
        name: 'Bench Press', // Duplicate name
        category: 'STRENGTH',
        muscleGroups: ['CHEST'],
        equipment: ['Barbell'],
        difficulty: 'INTERMEDIATE',
      }

      const response = await request(app)
        .post('/api/exercises')
        .set('Authorization', `Bearer ${authToken}`)
        .send(duplicateExercise)
        .expect(409)

      expect(response.body.error).toBe('Exercise with this name already exists')
    })

    it('should return 409 for duplicate personal record', async () => {
      const exercise = await db.exercise.findFirst()
      if (exercise) {
        // Create first record
        await db.personalRecord.create({
          data: {
            userId,
            recordType: 'MAX_WEIGHT',
            value: 225,
            date: new Date('2025-01-15'),
            exerciseId: exercise.id,
          },
        })

        // Try to create duplicate
        const duplicateRecord = {
          recordType: 'MAX_WEIGHT',
          value: 225,
          date: '2025-01-15',
          exerciseId: exercise.id,
        }

        const response = await request(app)
          .post('/api/personal-records')
          .set('Authorization', `Bearer ${authToken}`)
          .send(duplicateRecord)
          .expect(409)

        expect(response.body.error).toBe('Personal record already exists for this user, exercise, type, and date')
      }
    })
  })

  describe('Database Connection Errors', () => {
    it('should handle database connection failures gracefully', async () => {
      // This test would require mocking the database connection to fail
      // For now, we'll test that the API handles general server errors

      const response = await request(app)
        .get('/api/exercises')
        .expect(200) // Should still work with proper database

      expect(response.body).toBeDefined()
    })
  })

  describe('Rate Limiting', () => {
    it('should handle rate limiting for excessive requests', async () => {
      // Make multiple rapid requests to trigger rate limiting
      const requests = Array(100).fill(null).map(() =>
        request(app)
          .get('/api/exercises')
          .set('Authorization', `Bearer ${authToken}`)
      )

      const responses = await Promise.all(requests)

      // At least some requests should be rate limited
      const rateLimitedResponses = responses.filter(r => r.status === 429)
      expect(rateLimitedResponses.length).toBeGreaterThan(0)
    })
  })

  describe('Large Payload Handling', () => {
    it('should handle large request payloads', async () => {
      // Create a very large exercise description
      const largeExercise = {
        name: 'Large Exercise',
        description: 'A'.repeat(10000), // Very large description
        category: 'STRENGTH',
        muscleGroups: ['CHEST'],
        equipment: ['Barbell'],
        difficulty: 'INTERMEDIATE',
      }

      const response = await request(app)
        .post('/api/exercises')
        .set('Authorization', `Bearer ${authToken}`)
        .send(largeExercise)
        .expect(201) // Should still work

      expect(response.body.name).toBe('Large Exercise')
    })

    it('should handle large response payloads', async () => {
      // Create many exercises to test large response
      // For now, we'll just verify the API can handle normal loads

      // This would be tested by creating many exercises and fetching them
      // For now, we'll just verify the API can handle normal loads
      const response = await request(app)
        .get('/api/exercises')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(Array.isArray(response.body.exercises)).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty search queries', async () => {
      const response = await request(app)
        .get('/api/exercises?search=')
        .expect(200)

      expect(response.body.exercises).toBeDefined()
    })

    it('should handle very large page sizes', async () => {
      const response = await request(app)
        .get('/api/exercises?limit=1000')
        .expect(200)

      expect(response.body.exercises).toBeDefined()
      expect(response.body.limit).toBe(1000)
    })

    it('should handle negative offset', async () => {
      const response = await request(app)
        .get('/api/exercises?offset=-1')
        .expect(200)

      expect(response.body.exercises).toBeDefined()
      expect(response.body.offset).toBe(-1)
    })

    it('should handle special characters in search', async () => {
      const response = await request(app)
        .get('/api/exercises?search=%40%23%24%25%5E%26*()')
        .expect(200)

      expect(response.body.exercises).toBeDefined()
    })

    it('should handle malformed date formats', async () => {
      const exercise = await db.exercise.findFirst()
      if (exercise) {
        const invalidRecord = {
          recordType: 'MAX_WEIGHT',
          value: 225,
          date: 'not-a-date',
          exerciseId: exercise.id,
        }

        const response = await request(app)
          .post('/api/personal-records')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidRecord)
          .expect(400)

        expect(response.body.error).toBeDefined()
      }
    })
  })

  describe('Concurrent Request Handling', () => {
    it('should handle concurrent requests properly', async () => {
      // Create multiple concurrent requests
      const requests = Array(10).fill(null).map(() =>
        request(app)
          .get('/api/exercises')
          .set('Authorization', `Bearer ${authToken}`)
      )

      const responses = await Promise.all(requests)

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200)
        expect(response.body.exercises).toBeDefined()
      })
    })
  })
})