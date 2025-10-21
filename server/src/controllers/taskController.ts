import prisma from '../utils/prisma'
import type { PrismaClient } from '@prisma/client'

const db = prisma as unknown as PrismaClient
import { Request, Response } from 'express'
import { z } from 'zod'

const taskSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  status: z.enum(['PENDING', 'COMPLETED', 'ARCHIVED']).optional(),
  dueDate: z.string().optional()
})

export async function getTasks(req: Request, res: Response) {
  const userId = req.userId as string
  const tasks = await db.task.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } })
  res.json(tasks)
}

export async function addTask(req: Request, res: Response) {
  const userId = req.userId as string
  const parse = taskSchema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.issues })
  const { title, description, status, dueDate } = parse.data
  const task = await db.task.create({ data: { userId, title, description, status, dueDate: dueDate ? new Date(dueDate) : undefined } })
  res.status(201).json(task)
}

export async function deleteTask(req: Request, res: Response) {
  const userId = req.userId as string
  const { id } = req.params
  const task = await db.task.findUnique({ where: { id } })
  if (!task || task.userId !== userId) return res.status(404).json({ error: 'Not found' })
  await db.task.delete({ where: { id } })
  res.status(204).end()
}
