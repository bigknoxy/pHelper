import prisma from '../utils/prisma'
import type { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express'
import { z } from 'zod'

const db = prisma as unknown as PrismaClient

const progressPhotoSchema = z.object({
  date: z.string(),
  photoUrl: z.string(),
  note: z.string().optional()
})

export async function getProgressPhotos(req: Request, res: Response) {
  const userId = req.userId as string
  const photos = await db.progressPhoto.findMany({
    where: { userId },
    orderBy: { date: 'desc' }
  })
  res.json(photos)
}

export async function createProgressPhoto(req: Request, res: Response) {
  const userId = req.userId as string
  const parse = progressPhotoSchema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.issues })
  const { date, photoUrl, note } = parse.data
  const photo = await db.progressPhoto.create({
    data: {
      userId,
      date: new Date(date),
      photoUrl,
      note
    }
  })
  res.status(201).json(photo)
}

export async function updateProgressPhoto(req: Request, res: Response) {
  const userId = req.userId as string
  const { id } = req.params
  const parse = progressPhotoSchema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.issues })
  const { date, photoUrl, note } = parse.data
  const photo = await db.progressPhoto.findUnique({ where: { id } })
  if (!photo || photo.userId !== userId) return res.status(404).json({ error: 'Not found' })
  const updated = await db.progressPhoto.update({
    where: { id },
    data: {
      date: new Date(date),
      photoUrl,
      note
    }
  })
  res.json(updated)
}

export async function deleteProgressPhoto(req: Request, res: Response) {
  const userId = req.userId as string
  const { id } = req.params
  const photo = await db.progressPhoto.findUnique({ where: { id } })
  if (!photo || photo.userId !== userId) return res.status(404).json({ error: 'Not found' })
  await db.progressPhoto.delete({ where: { id } })
  res.status(204).end()
}