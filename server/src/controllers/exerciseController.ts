import prisma from '../utils/prisma'
import type { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express'
import { z } from 'zod'

const db = prisma as unknown as PrismaClient

const exerciseSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  instructions: z.string().optional(),
  category: z.enum(['STRENGTH', 'CARDIO', 'FLEXIBILITY', 'BALANCE', 'FUNCTIONAL', 'SPORTS']),
  muscleGroups: z.array(z.enum(['CHEST', 'BACK', 'SHOULDERS', 'BICEPS', 'TRICEPS', 'FOREARMS', 'CORE', 'QUADRICEPS', 'HAMSTRINGS', 'GLUTES', 'CALVES', 'FULL_BODY'])),
  equipment: z.array(z.string()).optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'])
})

const exerciseUpdateSchema = exerciseSchema.partial()

export async function getExercises(req: Request, res: Response) {
  try {
    const {
      category,
      muscleGroup,
      difficulty,
      search,
      limit = '50',
      offset = '0'
    } = req.query

    const filters: any = {}

    if (category) {
      filters.category = category
    }

    if (muscleGroup) {
      filters.muscleGroups = {
        has: muscleGroup
      }
    }

    if (difficulty) {
      filters.difficulty = difficulty
    }

    if (search) {
      filters.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ]
    }

    const exercises = await db.exercise.findMany({
      where: {
        isActive: true,
        ...filters
      },
      orderBy: { name: 'asc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    })

    const total = await db.exercise.count({
      where: {
        isActive: true,
        ...filters
      }
    })

    res.json({
      exercises,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    })
  } catch (error) {
    console.error('Error fetching exercises:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export async function getExerciseById(req: Request, res: Response) {
  try {
    const { id } = req.params

    const exercise = await db.exercise.findUnique({
      where: { id }
    })

    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' })
    }

    res.json(exercise)
  } catch (error) {
    console.error('Error fetching exercise:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export async function createExercise(req: Request, res: Response) {
  try {
    const parse = exerciseSchema.safeParse(req.body)
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.issues })
    }

    const exercise = await db.exercise.create({
      data: parse.data
    })

    res.status(201).json(exercise)
  } catch (error) {
    console.error('Error creating exercise:', error)
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      res.status(409).json({ error: 'Exercise with this name already exists' })
    } else {
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}

export async function updateExercise(req: Request, res: Response) {
  try {
    const { id } = req.params
    const parse = exerciseUpdateSchema.safeParse(req.body)
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.issues })
    }

    const exercise = await db.exercise.findUnique({
      where: { id }
    })

    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' })
    }

    const updatedExercise = await db.exercise.update({
      where: { id },
      data: parse.data
    })

    res.json(updatedExercise)
  } catch (error) {
    console.error('Error updating exercise:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export async function deleteExercise(req: Request, res: Response) {
  try {
    const { id } = req.params

    const exercise = await db.exercise.findUnique({
      where: { id }
    })

    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' })
    }

    // Soft delete by setting isActive to false
    await db.exercise.update({
      where: { id },
      data: { isActive: false }
    })

    res.status(204).end()
  } catch (error) {
    console.error('Error deleting exercise:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export async function getExerciseCategories(req: Request, res: Response) {
  try {
    const categories = Object.values(await db.$queryRaw`
      SELECT DISTINCT category FROM "Exercise" WHERE "isActive" = true ORDER BY category
    ` as any[])

    res.json(categories.map(c => c.category))
  } catch (error) {
    console.error('Error fetching exercise categories:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export async function getMuscleGroups(req: Request, res: Response) {
  try {
    const muscleGroups = Object.values(await db.$queryRaw`
      SELECT DISTINCT unnest("muscleGroups") as muscle_group
      FROM "Exercise"
      WHERE "isActive" = true
      ORDER BY muscle_group
    ` as any[])

    res.json(muscleGroups.map(mg => mg.muscle_group))
  } catch (error) {
    console.error('Error fetching muscle groups:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}