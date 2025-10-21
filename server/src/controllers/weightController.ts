import prisma from '../utils/prisma'
import type { PrismaClient } from '@prisma/client'

const db = prisma as unknown as PrismaClient
import { Request, Response } from 'express'
import { z } from 'zod'

const entrySchema = z.object({
  date: z.string(),
  weight: z.number(),
  note: z.string().optional()
})

export async function getWeights(req: Request, res: Response) {
  const userId = req.userId as string
  const weights = await db.weightEntry.findMany({ where: { userId }, orderBy: { date: 'desc' } })
  res.json(weights)
}

export async function addWeight(req: Request, res: Response) {
  const userId = req.userId as string
  const parse = entrySchema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.issues })
  const { date, weight, note } = parse.data
  const entry = await db.weightEntry.create({ data: { userId, date: new Date(date), weight, note } })
  res.status(201).json(entry)
}

export async function deleteWeight(req: Request, res: Response) {
  const userId = req.userId as string
  const { id } = req.params
  const entry = await db.weightEntry.findUnique({ where: { id } })
  if (!entry || entry.userId !== userId) return res.status(404).json({ error: 'Not found' })
  await db.weightEntry.delete({ where: { id } })
  res.status(204).end()
}
