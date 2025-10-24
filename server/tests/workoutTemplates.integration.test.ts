import request from 'supertest'
import app from '../src/app'
import prisma from '../src/utils/prisma'
import { PrismaClient } from '@prisma/client'

const db = prisma as unknown as PrismaClient

describe('Workout Templates API Integration Tests', () => {
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
    // Clean up workout templates and exercises before each test
    await db.workoutTemplate.deleteMany()
    await db.exercise.deleteMany()

    // Create test exercises
    await db.exercise.createMany({
      data: [
        {
          name: 'Bench Press',
          category: 'STRENGTH',
          muscleGroups: ['CHEST', 'TRICEPS'],
          equipment: ['Barbell', 'Bench'],
          difficulty: 'INTERMEDIATE',
        },
        {
          name: 'Squats',
          category: 'STRENGTH',
          muscleGroups: ['QUADRICEPS', 'GLUTES'],
          equipment: ['Barbell'],
          difficulty: 'INTERMEDIATE',
        },
      ],
    })
  })

  afterAll(async () => {
    await db.$disconnect()
  })

  describe('GET /api/workout-templates', () => {
    beforeEach(async () => {
      // Create test workout templates
      await db.workoutTemplate.createMany({
        data: [
          {
            name: 'Upper Body Strength',
            description: 'Focus on chest, back, and shoulders',
            category: 'Strength',
            isPublic: false,
            createdBy: userId,
          },
          {
            name: 'Cardio Blast',
            description: 'High-intensity cardio workout',
            category: 'Cardio',
            isPublic: true,
            createdBy: userId,
          },
        ],
      })
    })

    it('should return all workout templates', async () => {
      const response = await request(app)
        .get('/api/workout-templates')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.templates).toHaveLength(2)
      expect(response.body.total).toBe(2)
      expect(response.body.templates[0]).toHaveProperty('name')
      expect(response.body.templates[0]).toHaveProperty('category')
    })

    it('should filter templates by category', async () => {
      const response = await request(app)
        .get('/api/workout-templates?category=Strength')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.templates).toHaveLength(1)
      expect(response.body.templates[0].category).toBe('Strength')
    })

    it('should filter public templates', async () => {
      const response = await request(app)
        .get('/api/workout-templates?isPublic=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.templates).toHaveLength(1)
      expect(response.body.templates[0].isPublic).toBe(true)
    })

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/api/workout-templates?limit=1&offset=0')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.templates).toHaveLength(1)
      expect(response.body.limit).toBe(1)
      expect(response.body.offset).toBe(0)
    })
  })

  describe('GET /api/workout-templates/:id', () => {
    let templateId: string

    beforeEach(async () => {
      const template = await db.workoutTemplate.create({
        data: {
          name: 'Upper Body Strength',
          description: 'Focus on chest, back, and shoulders',
          category: 'Strength',
          isPublic: false,
          createdBy: userId,
        },
      })
      templateId = template.id
    })

    it('should return workout template by id', async () => {
      const response = await request(app)
        .get(`/api/workout-templates/${templateId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.name).toBe('Upper Body Strength')
      expect(response.body.category).toBe('Strength')
      expect(response.body.createdBy).toBe(userId)
    })

    it('should return 404 for non-existent template', async () => {
      const response = await request(app)
        .get('/api/workout-templates/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)

      expect(response.body.error).toBe('Workout template not found')
    })
  })

  describe('POST /api/workout-templates', () => {
    it('should create new workout template with exercises', async () => {
      const exercises = await db.exercise.findMany()
      const exerciseIds = exercises.map(e => e.id)

      const newTemplate = {
        name: 'New Template',
        description: 'Test template',
        category: 'Custom',
        isPublic: false,
        exercises: [
          {
            exerciseId: exerciseIds[0],
            sets: 3,
            reps: 10,
            weight: 135,
            restTime: 90,
            order: 1,
          },
          {
            exerciseId: exerciseIds[1],
            sets: 3,
            reps: 12,
            weight: 185,
            restTime: 90,
            order: 2,
          },
        ],
      }

      const response = await request(app)
        .post('/api/workout-templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newTemplate)
        .expect(201)

      expect(response.body.name).toBe('New Template')
      expect(response.body.category).toBe('Custom')
      expect(response.body.exercises).toHaveLength(2)
      expect(response.body.exercises[0].sets).toBe(3)
      expect(response.body.exercises[1].reps).toBe(12)
    })

    it('should return 400 for invalid template data', async () => {
      const invalidTemplate = {
        name: '', // Invalid: empty name
        category: 'Custom',
      }

      const response = await request(app)
        .post('/api/workout-templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidTemplate)
        .expect(400)

      expect(response.body.error).toBeDefined()
    })

    it('should return 400 when exercises do not exist', async () => {
      const invalidTemplate = {
        name: 'Invalid Template',
        description: 'Template with non-existent exercises',
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

    it('should return 400 when no exercises provided', async () => {
      const invalidTemplate = {
        name: 'Empty Template',
        description: 'Template without exercises',
        category: 'Custom',
        exercises: [], // Empty exercises array
      }

      const response = await request(app)
        .post('/api/workout-templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidTemplate)
        .expect(400)

      expect(response.body.error).toBe('At least one exercise is required')
    })
  })

  describe('PUT /api/workout-templates/:id', () => {
    let templateId: string

    beforeEach(async () => {
      const template = await db.workoutTemplate.create({
        data: {
          name: 'Original Template',
          description: 'Original description',
          category: 'Strength',
          isPublic: false,
          createdBy: userId,
        },
      })
      templateId = template.id
    })

    it('should update workout template', async () => {
      const updates = {
        name: 'Updated Template',
        description: 'Updated description',
        category: 'Updated Category',
      }

      const response = await request(app)
        .put(`/api/workout-templates/${templateId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect(200)

      expect(response.body.name).toBe('Updated Template')
      expect(response.body.description).toBe('Updated description')
      expect(response.body.category).toBe('Updated Category')
    })

    it('should update template exercises', async () => {
      const exercises = await db.exercise.findMany()
      const exerciseIds = exercises.map(e => e.id)

      const updates = {
        name: 'Updated Template',
        exercises: [
          {
            exerciseId: exerciseIds[0],
            sets: 4,
            reps: 8,
            weight: 155,
            restTime: 120,
            order: 1,
          },
        ],
      }

      const response = await request(app)
        .put(`/api/workout-templates/${templateId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect(200)

      expect(response.body.name).toBe('Updated Template')
      expect(response.body.exercises).toHaveLength(1)
      expect(response.body.exercises[0].sets).toBe(4)
      expect(response.body.exercises[0].reps).toBe(8)
    })

    it('should return 404 for non-existent template', async () => {
      const response = await request(app)
        .put('/api/workout-templates/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated' })
        .expect(404)

      expect(response.body.error).toBe('Workout template not found')
    })

    it('should return 400 for invalid update data', async () => {
      const response = await request(app)
        .put(`/api/workout-templates/${templateId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ category: 'INVALID_CATEGORY' })
        .expect(400)

      expect(response.body.error).toBeDefined()
    })
  })

  describe('DELETE /api/workout-templates/:id', () => {
    let templateId: string

    beforeEach(async () => {
      const template = await db.workoutTemplate.create({
        data: {
          name: 'Template to Delete',
          category: 'Strength',
          isPublic: false,
          createdBy: userId,
        },
      })
      templateId = template.id
    })

    it('should soft delete workout template', async () => {
      const response = await request(app)
        .delete(`/api/workout-templates/${templateId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204)

      // Verify template is soft deleted (isActive = false)
      const dbTemplate = await db.workoutTemplate.findUnique({
        where: { id: templateId },
      })
      expect(dbTemplate?.isActive).toBe(false)
    })

    it('should return 404 for non-existent template', async () => {
      const response = await request(app)
        .delete('/api/workout-templates/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)

      expect(response.body.error).toBe('Workout template not found')
    })
  })
})