import prisma from '../utils/prisma'
import type { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express'
import { z } from 'zod'

const db = prisma as unknown as PrismaClient

const workoutTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  isPublic: z.boolean().default(false),
  exercises: z.array(z.object({
    exerciseId: z.string(),
    sets: z.number().min(1).default(1),
    reps: z.number().min(1).optional(),
    weight: z.number().min(0).optional(),
    duration: z.number().min(1).optional(), // in seconds
    restTime: z.number().min(0).optional(), // in seconds
    order: z.number().min(0),
    notes: z.string().optional(),
  })).min(1, 'At least one exercise is required'),
})

const workoutTemplateUpdateSchema = workoutTemplateSchema.partial()

export async function getWorkoutTemplates(req: Request, res: Response) {
  try {
    const userId = req.userId as string
    const {
      category,
      isPublic,
      search,
      limit = '20',
      offset = '0'
    } = req.query

    const filters: any = {}

    // If not requesting public templates, only show user's templates
    if (isPublic !== 'true') {
      filters.OR = [
        { createdBy: userId },
        { isPublic: true }
      ]
    } else {
      filters.isPublic = true
    }

    if (category) {
      filters.category = category
    }

    if (search) {
      filters.OR = [
        ...(filters.OR || []),
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ]
    }

    const templates = await db.workoutTemplate.findMany({
      where: {
        isActive: true,
        ...filters
      },
      include: {
        exercises: {
          include: {
            exercise: true
          },
          orderBy: { order: 'asc' }
        },
        user: {
          select: { id: true, email: true }
        }
      },
      orderBy: [
        { isPublic: 'desc' }, // Public templates first
        { createdAt: 'desc' }
      ],
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    })

    const total = await db.workoutTemplate.count({
      where: {
        isActive: true,
        ...filters
      }
    })

    res.json({
      templates,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    })
  } catch (error) {
    console.error('Error fetching workout templates:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export async function getWorkoutTemplateById(req: Request, res: Response) {
  try {
    const { id } = req.params
    const userId = req.userId as string

    const template = await db.workoutTemplate.findUnique({
      where: { id },
      include: {
        exercises: {
          include: {
            exercise: true
          },
          orderBy: { order: 'asc' }
        },
        user: {
          select: { id: true, email: true }
        }
      }
    })

    if (!template) {
      return res.status(404).json({ error: 'Workout template not found' })
    }

    // Check if user can access this template (own or public)
    if (template.createdBy !== userId && !template.isPublic) {
      return res.status(403).json({ error: 'Access denied' })
    }

    res.json(template)
  } catch (error) {
    console.error('Error fetching workout template:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export async function createWorkoutTemplate(req: Request, res: Response) {
  try {
    const userId = req.userId as string
    const parse = workoutTemplateSchema.safeParse(req.body)
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.issues })
    }

    const { exercises, ...templateData } = parse.data

    // Verify all exercises exist
    const exerciseIds = exercises.map(e => e.exerciseId)
    const existingExercises = await db.exercise.findMany({
      where: { id: { in: exerciseIds } }
    })

    if (existingExercises.length !== exerciseIds.length) {
      return res.status(400).json({ error: 'One or more exercises not found' })
    }

    // Create template and exercises in a transaction
    const result = await db.$transaction(async (tx) => {
      const template = await tx.workoutTemplate.create({
        data: {
          ...templateData,
          createdBy: userId
        }
      })

      // Create template exercises
      const templateExercises = exercises.map(exercise => ({
        ...exercise,
        workoutTemplateId: template.id
      }))

      await tx.workoutTemplateExercise.createMany({
        data: templateExercises
      })

      return template
    })

    // Fetch the complete template with exercises
    const completeTemplate = await db.workoutTemplate.findUnique({
      where: { id: result.id },
      include: {
        exercises: {
          include: {
            exercise: true
          },
          orderBy: { order: 'asc' }
        }
      }
    })

    res.status(201).json(completeTemplate)
  } catch (error) {
    console.error('Error creating workout template:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export async function updateWorkoutTemplate(req: Request, res: Response) {
  try {
    const { id } = req.params
    const userId = req.userId as string
    const parse = workoutTemplateUpdateSchema.safeParse(req.body)
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.issues })
    }

    const template = await db.workoutTemplate.findUnique({
      where: { id }
    })

    if (!template) {
      return res.status(404).json({ error: 'Workout template not found' })
    }

    // Check if user owns this template
    if (template.createdBy !== userId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    const { exercises, ...templateData } = parse.data

    // Update template and exercises in a transaction
    const result = await db.$transaction(async (tx) => {
      const updatedTemplate = await tx.workoutTemplate.update({
        where: { id },
        data: templateData
      })

      // If exercises are provided, replace all exercises
      if (exercises) {
        // Delete existing exercises
        await tx.workoutTemplateExercise.deleteMany({
          where: { workoutTemplateId: id }
        })

        // Verify all exercises exist
        const exerciseIds = exercises.map(e => e.exerciseId)
        const existingExercises = await tx.exercise.findMany({
          where: { id: { in: exerciseIds } }
        })

        if (existingExercises.length !== exerciseIds.length) {
          throw new Error('One or more exercises not found')
        }

        // Create new exercises
        const templateExercises = exercises.map(exercise => ({
          ...exercise,
          workoutTemplateId: id
        }))

        await tx.workoutTemplateExercise.createMany({
          data: templateExercises
        })
      }

      return updatedTemplate
    })

    // Fetch the complete updated template
    const completeTemplate = await db.workoutTemplate.findUnique({
      where: { id: result.id },
      include: {
        exercises: {
          include: {
            exercise: true
          },
          orderBy: { order: 'asc' }
        }
      }
    })

    res.json(completeTemplate)
  } catch (error) {
    console.error('Error updating workout template:', error)
    if (error instanceof Error && error.message.includes('not found')) {
      res.status(400).json({ error: error.message })
    } else {
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}

export async function deleteWorkoutTemplate(req: Request, res: Response) {
  try {
    const { id } = req.params
    const userId = req.userId as string

    const template = await db.workoutTemplate.findUnique({
      where: { id }
    })

    if (!template) {
      return res.status(404).json({ error: 'Workout template not found' })
    }

    // Check if user owns this template
    if (template.createdBy !== userId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    // Soft delete by setting isActive to false
    await db.workoutTemplate.update({
      where: { id },
      data: { isActive: false }
    })

    res.status(204).end()
  } catch (error) {
    console.error('Error deleting workout template:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export async function getWorkoutTemplateCategories(req: Request, res: Response) {
  try {
    const categories = await db.$queryRaw`
      SELECT DISTINCT category FROM "WorkoutTemplate"
      WHERE "isActive" = true
      ORDER BY category
    ` as any[]

    res.json(categories.map(c => c.category))
  } catch (error) {
    console.error('Error fetching workout template categories:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}