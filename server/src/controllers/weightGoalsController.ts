import prisma from '../utils/prisma'
import type { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express'
import { z } from 'zod'

const db = prisma as unknown as PrismaClient

const weightGoalSchema = z.object({
  goalWeight: z.number(),
  targetDate: z.string(),
  bmiTracking: z.boolean().optional().default(true)
})

export async function getWeightGoals(req: Request, res: Response) {
  const userId = req.userId as string
  const weightGoals = await db.weightGoal.findMany({
    where: { userId },
    include: { milestones: true },
    orderBy: { targetDate: 'asc' }
  })
  res.json(weightGoals)
}

export async function createWeightGoal(req: Request, res: Response) {
  const userId = req.userId as string
  const parse = weightGoalSchema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.issues })
  const { goalWeight, targetDate, bmiTracking } = parse.data
  const weightGoal = await db.weightGoal.create({
    data: {
      userId,
      goalWeight,
      targetDate: new Date(targetDate),
      bmiTracking
    },
    include: { milestones: true }
  })
  res.status(201).json(weightGoal)
}

export async function updateWeightGoal(req: Request, res: Response) {
  const userId = req.userId as string
  const { id } = req.params
  const parse = weightGoalSchema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.issues })
  const { goalWeight, targetDate, bmiTracking } = parse.data
  const weightGoal = await db.weightGoal.findUnique({ where: { id } })
  if (!weightGoal || weightGoal.userId !== userId) return res.status(404).json({ error: 'Not found' })
  const updated = await db.weightGoal.update({
    where: { id },
    data: {
      goalWeight,
      targetDate: new Date(targetDate),
      bmiTracking
    },
    include: { milestones: true }
  })
  res.json(updated)
}

export async function deleteWeightGoal(req: Request, res: Response) {
  const userId = req.userId as string
  const { id } = req.params
  const weightGoal = await db.weightGoal.findUnique({ where: { id } })
  if (!weightGoal || weightGoal.userId !== userId) return res.status(404).json({ error: 'Not found' })
  await db.weightGoal.delete({ where: { id } })
  res.status(204).end()
}