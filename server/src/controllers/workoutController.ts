import prisma from '../utils/prisma'
import type { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express'
import { z } from 'zod'

const db = prisma as unknown as PrismaClient

async function checkAndCreatePersonalRecords(tx: any, userId: string, workoutExercises: any[]) {
  for (const we of workoutExercises) {
    if (we.weight && we.reps) {
      // Check for max weight PR
      const existingMaxWeight = await tx.personalRecord.findFirst({
        where: {
          userId,
          exerciseId: we.exerciseId,
          recordType: 'MAX_WEIGHT'
        },
        orderBy: { value: 'desc' }
      })

      if (!existingMaxWeight || we.weight > existingMaxWeight.value) {
        await tx.personalRecord.create({
          data: {
            userId,
            recordType: 'MAX_WEIGHT',
            value: we.weight,
            date: new Date(),
            exerciseId: we.exerciseId,
            workoutExerciseId: we.id
          }
        })
      }

      // Check for max reps PR
      const existingMaxReps = await tx.personalRecord.findFirst({
        where: {
          userId,
          exerciseId: we.exerciseId,
          recordType: 'MAX_REPS'
        },
        orderBy: { value: 'desc' }
      })

      if (!existingMaxReps || we.reps > existingMaxReps.value) {
        await tx.personalRecord.create({
          data: {
            userId,
            recordType: 'MAX_REPS',
            value: we.reps,
            date: new Date(),
            exerciseId: we.exerciseId,
            workoutExerciseId: we.id
          }
        })
      }
    }
  }
}

const workoutSchema = z.object({
  date: z.string(),
  type: z.string(),
  duration: z.number(),
  notes: z.string().optional(),
  templateId: z.string().optional(),
   exercises: z.array(z.object({
     exerciseId: z.string(),
     sets: z.number().min(1).default(1),
     reps: z.number().min(1).optional(),
     weight: z.number().min(0).optional(),
     duration: z.number().min(1).optional(), // in seconds
     restTime: z.number().min(0).optional(), // in seconds
     order: z.number().min(0),
     notes: z.string().optional(),
     distance: z.number().min(0).optional(), // in kilometers
     calories: z.number().min(0).optional(), // estimated calories
   })).optional()
})

export async function getWorkouts(req: Request, res: Response) {
  const userId = req.userId as string
  const workouts = await db.workout.findMany({
    where: { userId },
    orderBy: { date: 'desc' }
  })

  // Fetch exercises for each workout
  const workoutsWithExercises = await Promise.all(
    workouts.map(async (workout) => {
      const exercises = await db.workoutExercise.findMany({
        where: { workoutId: workout.id },
        include: {
          exercise: true
        },
        orderBy: { order: 'asc' }
      })
      return { ...workout, exercises }
    })
  )

  res.json(workoutsWithExercises)
}

export async function addWorkout(req: Request, res: Response) {
  const userId = req.userId as string
  const parse = workoutSchema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.issues })
  const { date, type, duration, notes, templateId, exercises } = parse.data

  try {
    const result = await db.$transaction(async (tx) => {
      const workout = await tx.workout.create({
        data: {
          userId,
          date: new Date(date),
          type,
          duration,
          notes,
          templateId
        }
      })

      if (exercises && exercises.length > 0) {
        // Verify all exercises exist
        const exerciseIds = exercises.map(e => e.exerciseId)
        const existingExercises = await tx.exercise.findMany({
          where: { id: { in: exerciseIds } }
        })

        if (existingExercises.length !== exerciseIds.length) {
          throw new Error('One or more exercises not found')
        }

        // Create workout exercises
        const workoutExercises = exercises.map(exercise => ({
          ...exercise,
          workoutId: workout.id
        }))

        await tx.workoutExercise.createMany({
          data: workoutExercises
        })

        // Check for personal records
        await checkAndCreatePersonalRecords(tx, userId, workoutExercises)
      }

      return workout
    })

    // Fetch the complete workout with exercises
    const workout = await db.workout.findUnique({
      where: { id: result.id }
    })

    const workoutExercises = await db.workoutExercise.findMany({
      where: { workoutId: result.id },
      include: {
        exercise: true
      },
      orderBy: { order: 'asc' }
    })

    const template = workout?.templateId ? await db.workoutTemplate.findUnique({
      where: { id: workout.templateId },
      select: { id: true, name: true, category: true }
    }) : null

    const completeWorkout = { ...workout, exercises: workoutExercises, template }

    res.status(201).json(completeWorkout)
  } catch (error) {
    console.error('Error creating workout:', error)
    if (error instanceof Error && error.message.includes('not found')) {
      res.status(400).json({ error: error.message })
    } else {
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}

export async function deleteWorkout(req: Request, res: Response) {
  const userId = req.userId as string
  const { id } = req.params
  const workout = await db.workout.findUnique({ where: { id } })
  if (!workout || workout.userId !== userId) return res.status(404).json({ error: 'Not found' })
  await db.workout.delete({ where: { id } })
  res.status(204).end()
}


