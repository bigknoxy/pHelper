import request from 'supertest'
import app from '../src/app'
import prisma from '../src/utils/prisma'
import { PrismaClient } from '@prisma/client'

const db = prisma as unknown as PrismaClient

describe('Exercise API Integration Tests', () => {
  beforeEach(async () => {
    // Clean up exercises before each test
    await db.exercise.deleteMany()
  })

  afterAll(async () => {
    await db.$disconnect()
  })

  describe('GET /api/exercises', () => {
    beforeEach(async () => {
      // Create test exercises
      await db.exercise.createMany({
        data: [
          {
            name: 'Bench Press',
            description: 'Classic chest exercise',
            instructions: 'Lie on bench, press bar up',
            category: 'STRENGTH',
            muscleGroups: ['CHEST', 'TRICEPS'],
            equipment: ['Barbell', 'Bench'],
            difficulty: 'INTERMEDIATE',
          },
          {
            name: 'Squats',
            description: 'Lower body compound movement',
            instructions: 'Stand with feet shoulder-width, lower by bending knees',
            category: 'STRENGTH',
            muscleGroups: ['QUADRICEPS', 'GLUTES'],
            equipment: ['Barbell'],
            difficulty: 'INTERMEDIATE',
          },
          {
            name: 'Running',
            description: 'Cardiovascular exercise',
            instructions: 'Run at comfortable pace',
            category: 'CARDIO',
            muscleGroups: ['FULL_BODY'],
            equipment: ['Running Shoes'],
            difficulty: 'BEGINNER',
          },
        ],
      })
    })

    it('should return all exercises', async () => {
      const response = await request(app)
        .get('/api/exercises')
        .expect(200)

      expect(response.body.exercises).toHaveLength(3)
      expect(response.body.total).toBe(3)
      expect(response.body.exercises[0]).toHaveProperty('name')
      expect(response.body.exercises[0]).toHaveProperty('category')
      expect(response.body.exercises[0]).toHaveProperty('muscleGroups')
    })

    it('should filter exercises by category', async () => {
      const response = await request(app)
        .get('/api/exercises?category=STRENGTH')
        .expect(200)

      expect(response.body.exercises).toHaveLength(2)
      expect(response.body.exercises.every((e: any) => e.category === 'STRENGTH')).toBe(true)
    })

    it('should filter exercises by muscle group', async () => {
      const response = await request(app)
        .get('/api/exercises?muscleGroup=CHEST')
        .expect(200)

      expect(response.body.exercises).toHaveLength(1)
      expect(response.body.exercises[0].name).toBe('Bench Press')
    })

    it('should filter exercises by difficulty', async () => {
      const response = await request(app)
        .get('/api/exercises?difficulty=BEGINNER')
        .expect(200)

      expect(response.body.exercises).toHaveLength(1)
      expect(response.body.exercises[0].name).toBe('Running')
    })

    it('should search exercises by name', async () => {
      const response = await request(app)
        .get('/api/exercises?search=bench')
        .expect(200)

      expect(response.body.exercises).toHaveLength(1)
      expect(response.body.exercises[0].name).toBe('Bench Press')
    })

    it('should search exercises by description', async () => {
      const response = await request(app)
        .get('/api/exercises?search=cardiovascular')
        .expect(200)

      expect(response.body.exercises).toHaveLength(1)
      expect(response.body.exercises[0].name).toBe('Running')
    })

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/api/exercises?limit=2&offset=0')
        .expect(200)

      expect(response.body.exercises).toHaveLength(2)
      expect(response.body.limit).toBe(2)
      expect(response.body.offset).toBe(0)
    })

    it('should handle invalid category filter', async () => {
      const response = await request(app)
        .get('/api/exercises?category=INVALID')
        .expect(200)

      expect(response.body.exercises).toHaveLength(0)
    })

    it('should handle invalid muscle group filter', async () => {
      const response = await request(app)
        .get('/api/exercises?muscleGroup=INVALID')
        .expect(200)

      expect(response.body.exercises).toHaveLength(0)
    })

    it('should handle invalid difficulty filter', async () => {
      const response = await request(app)
        .get('/api/exercises?difficulty=INVALID')
        .expect(200)

      expect(response.body.exercises).toHaveLength(0)
    })
  })

  describe('GET /api/exercises/:id', () => {
    let exerciseId: string

    beforeEach(async () => {
      const exercise = await db.exercise.create({
        data: {
          name: 'Bench Press',
          description: 'Classic chest exercise',
          instructions: 'Lie on bench, press bar up',
          category: 'STRENGTH',
          muscleGroups: ['CHEST', 'TRICEPS'],
          equipment: ['Barbell', 'Bench'],
          difficulty: 'INTERMEDIATE',
        },
      })
      exerciseId = exercise.id
    })

    it('should return exercise by id', async () => {
      const response = await request(app)
        .get(`/api/exercises/${exerciseId}`)
        .expect(200)

      expect(response.body.name).toBe('Bench Press')
      expect(response.body.category).toBe('STRENGTH')
      expect(response.body.muscleGroups).toEqual(['CHEST', 'TRICEPS'])
    })

    it('should return 404 for non-existent exercise', async () => {
      const response = await request(app)
        .get('/api/exercises/non-existent-id')
        .expect(404)

      expect(response.body.error).toBe('Exercise not found')
    })
  })

  describe('POST /api/exercises', () => {
    it('should create new exercise', async () => {
      const newExercise = {
        name: 'Deadlift',
        description: 'Posterior chain exercise',
        instructions: 'Lift bar from ground',
        category: 'STRENGTH',
        muscleGroups: ['BACK', 'GLUTES'],
        equipment: ['Barbell'],
        difficulty: 'ADVANCED',
      }

      const response = await request(app)
        .post('/api/exercises')
        .send(newExercise)
        .expect(201)

      expect(response.body.name).toBe('Deadlift')
      expect(response.body.category).toBe('STRENGTH')
      expect(response.body.muscleGroups).toEqual(['BACK', 'GLUTES'])

      // Verify in database
      const dbExercise = await db.exercise.findUnique({
        where: { name: 'Deadlift' },
      })
      expect(dbExercise).toBeTruthy()
    })

    it('should return 400 for invalid exercise data', async () => {
      const invalidExercise = {
        name: '', // Invalid: empty name
        category: 'INVALID_CATEGORY',
      }

      const response = await request(app)
        .post('/api/exercises')
        .send(invalidExercise)
        .expect(400)

      expect(response.body.error).toBeDefined()
    })

    it('should return 409 for duplicate exercise name', async () => {
      await db.exercise.create({
        data: {
          name: 'Bench Press',
          category: 'STRENGTH',
          muscleGroups: ['CHEST'],
          equipment: ['Barbell'],
          difficulty: 'INTERMEDIATE',
        },
      })

      const duplicateExercise = {
        name: 'Bench Press', // Duplicate name
        category: 'STRENGTH',
        muscleGroups: ['CHEST'],
        equipment: ['Barbell'],
        difficulty: 'INTERMEDIATE',
      }

      const response = await request(app)
        .post('/api/exercises')
        .send(duplicateExercise)
        .expect(409)

      expect(response.body.error).toBe('Exercise with this name already exists')
    })
  })

  describe('PUT /api/exercises/:id', () => {
    let exerciseId: string

    beforeEach(async () => {
      const exercise = await db.exercise.create({
        data: {
          name: 'Bench Press',
          description: 'Classic chest exercise',
          instructions: 'Lie on bench, press bar up',
          category: 'STRENGTH',
          muscleGroups: ['CHEST', 'TRICEPS'],
          equipment: ['Barbell', 'Bench'],
          difficulty: 'INTERMEDIATE',
        },
      })
      exerciseId = exercise.id
    })

    it('should update exercise', async () => {
      const updates = {
        description: 'Updated description',
        difficulty: 'ADVANCED',
      }

      const response = await request(app)
        .put(`/api/exercises/${exerciseId}`)
        .send(updates)
        .expect(200)

      expect(response.body.description).toBe('Updated description')
      expect(response.body.difficulty).toBe('ADVANCED')
      expect(response.body.name).toBe('Bench Press') // Unchanged
    })

    it('should return 404 for non-existent exercise', async () => {
      const response = await request(app)
        .put('/api/exercises/non-existent-id')
        .send({ description: 'Updated' })
        .expect(404)

      expect(response.body.error).toBe('Exercise not found')
    })

    it('should return 400 for invalid update data', async () => {
      const response = await request(app)
        .put(`/api/exercises/${exerciseId}`)
        .send({ category: 'INVALID_CATEGORY' })
        .expect(400)

      expect(response.body.error).toBeDefined()
    })
  })

  describe('DELETE /api/exercises/:id', () => {
    let exerciseId: string

    beforeEach(async () => {
      const exercise = await db.exercise.create({
        data: {
          name: 'Bench Press',
          category: 'STRENGTH',
          muscleGroups: ['CHEST'],
          equipment: ['Barbell'],
          difficulty: 'INTERMEDIATE',
        },
      })
      exerciseId = exercise.id
    })

    it('should soft delete exercise', async () => {
      const response = await request(app)
        .delete(`/api/exercises/${exerciseId}`)
        .expect(204)

      // Verify exercise is soft deleted (isActive = false)
      const dbExercise = await db.exercise.findUnique({
        where: { id: exerciseId },
      })
      expect(dbExercise?.isActive).toBe(false)
    })

    it('should return 404 for non-existent exercise', async () => {
      const response = await request(app)
        .delete('/api/exercises/non-existent-id')
        .expect(404)

      expect(response.body.error).toBe('Exercise not found')
    })
  })

  describe('GET /api/exercises/categories', () => {
    beforeEach(async () => {
      await db.exercise.createMany({
        data: [
          {
            name: 'Bench Press',
            category: 'STRENGTH',
            muscleGroups: ['CHEST'],
            equipment: ['Barbell'],
            difficulty: 'INTERMEDIATE',
          },
          {
            name: 'Running',
            category: 'CARDIO',
            muscleGroups: ['FULL_BODY'],
            equipment: ['Running Shoes'],
            difficulty: 'BEGINNER',
          },
        ],
      })
    })

    it('should return unique exercise categories', async () => {
      const response = await request(app)
        .get('/api/exercises/categories')
        .expect(200)

      expect(response.body).toEqual(['CARDIO', 'STRENGTH'])
    })
  })

  describe('GET /api/exercises/muscle-groups', () => {
    beforeEach(async () => {
      await db.exercise.createMany({
        data: [
          {
            name: 'Bench Press',
            category: 'STRENGTH',
            muscleGroups: ['CHEST', 'TRICEPS'],
            equipment: ['Barbell'],
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

    it('should return unique muscle groups', async () => {
      const response = await request(app)
        .get('/api/exercises/muscle-groups')
        .expect(200)

      expect(response.body).toEqual(['CHEST', 'GLUTES', 'QUADRICEPS', 'TRICEPS'])
    })
  })
})