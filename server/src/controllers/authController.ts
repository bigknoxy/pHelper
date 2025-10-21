import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import prisma from '../utils/prisma'
import { Request, Response } from 'express'
import type { PrismaClient } from '@prisma/client'

const db = prisma as unknown as PrismaClient

const JWT_SECRET = process.env.JWT_SECRET || 'changeme'

export async function register(req: Request, res: Response) {
  const { email, password } = req.body as { email?: string; password?: string }
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
  const existing = await db.user.findUnique({ where: { email } })
  if (existing) return res.status(409).json({ error: 'Email already registered' })
  const passwordHash = await bcrypt.hash(password, 10)
  const user = await db.user.create({ data: { email, passwordHash } })
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })
  res.json({ token })
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body as { email?: string; password?: string }
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
  const user = await db.user.findUnique({ where: { email } })
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })
  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' })
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })
  res.json({ token })
}
