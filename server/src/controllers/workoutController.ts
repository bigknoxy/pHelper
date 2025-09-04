import prisma from '../utils/prisma'
import { Request, Response } from 'express'
import { z } from 'zod'

const workoutSchema = z.object({
  date: z.string(),
  type: z.string(),
  duration: z.number(),
  notes: z.string().optional()
})

export async function getWorkouts(req: Request, res: Response) {
  const userId = (req as any).userId
  const workouts = await prisma.workout.findMany({ where: { userId }, orderBy: { date: 'desc' } })
  res.json(workouts)
}

export async function addWorkout(req: Request, res: Response) {
  const userId = (req as any).userId
  const parse = workoutSchema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.issues })
  const { date, type, duration, notes } = parse.data
  const workout = await prisma.workout.create({ data: { userId, date: new Date(date), type, duration, notes } })
  res.status(201).json(workout)
}

export async function deleteWorkout(req: Request, res: Response) {
  const userId = (req as any).userId
  const { id } = req.params
  const workout = await prisma.workout.findUnique({ where: { id } })
  if (!workout || workout.userId !== userId) return res.status(404).json({ error: 'Not found' })
  await prisma.workout.delete({ where: { id } })
  res.status(204).end()
}
