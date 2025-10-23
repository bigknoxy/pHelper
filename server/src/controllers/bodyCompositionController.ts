import prisma from '../utils/prisma'
import type { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express'
import { z } from 'zod'

const db = prisma as unknown as PrismaClient

const bodyCompositionSchema = z.object({
  date: z.string(),
  bodyFat: z.number().optional(),
  muscleMass: z.number().optional(),
  measurements: z.record(z.string(), z.number()).optional()
})

export async function getBodyCompositions(req: Request, res: Response) {
  const userId = req.userId as string
  const compositions = await db.bodyComposition.findMany({
    where: { userId },
    orderBy: { date: 'desc' }
  })
  res.json(compositions)
}

export async function createBodyComposition(req: Request, res: Response) {
  const userId = req.userId as string
  const parse = bodyCompositionSchema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.issues })
  const { date, bodyFat, muscleMass, measurements } = parse.data
  const composition = await db.bodyComposition.create({
    data: {
      userId,
      date: new Date(date),
      bodyFat,
      muscleMass,
      measurements
    }
  })
  res.status(201).json(composition)
}

export async function updateBodyComposition(req: Request, res: Response) {
  const userId = req.userId as string
  const { id } = req.params
  const parse = bodyCompositionSchema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.issues })
  const { date, bodyFat, muscleMass, measurements } = parse.data
  const composition = await db.bodyComposition.findUnique({ where: { id } })
  if (!composition || composition.userId !== userId) return res.status(404).json({ error: 'Not found' })
  const updated = await db.bodyComposition.update({
    where: { id },
    data: {
      date: new Date(date),
      bodyFat,
      muscleMass,
      measurements
    }
  })
  res.json(updated)
}

export async function deleteBodyComposition(req: Request, res: Response) {
  const userId = req.userId as string
  const { id } = req.params
  const composition = await db.bodyComposition.findUnique({ where: { id } })
  if (!composition || composition.userId !== userId) return res.status(404).json({ error: 'Not found' })
  await db.bodyComposition.delete({ where: { id } })
  res.status(204).end()
}