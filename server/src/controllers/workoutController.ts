import prisma from '../utils/prisma'
import type { PrismaClient } from '@prisma/client'

const db = prisma as unknown as PrismaClient
import { Request, Response } from 'express'
import { z } from 'zod'

const workoutSchema = z.object({
  date: z.string(),
  type: z.string(),
  duration: z.number(),
  notes: z.string().optional()
})

export async function getWorkouts(req: Request, res: Response) {
  const userId = req.userId as string
  const workouts = await db.workout.findMany({ where: { userId }, orderBy: { date: 'desc' } })
  res.json(workouts)
}

export async function addWorkout(req: Request, res: Response) {
  const userId = req.userId as string
  const parse = workoutSchema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.issues })
  const { date, type, duration, notes } = parse.data
  const workout = await db.workout.create({ data: { userId, date: new Date(date), type, duration, notes } })
  res.status(201).json(workout)
}

export async function deleteWorkout(req: Request, res: Response) {
  const userId = req.userId as string
  const { id } = req.params
  const workout = await db.workout.findUnique({ where: { id } })
  if (!workout || workout.userId !== userId) return res.status(404).json({ error: 'Not found' })
  await db.workout.delete({ where: { id } })
  res.status(204).end()
}
