import prisma from '../utils/prisma'
import type { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express'

const db = prisma as unknown as PrismaClient

export async function getWeightTrends(req: Request, res: Response) {
  const userId = req.userId as string
  const weights = await db.weightEntry.findMany({
    where: { userId },
    orderBy: { date: 'asc' }
  })

  if (weights.length < 2) return res.json({ trends: [], movingAverage: [], prediction: null })

  // Calculate moving average (7-day)
  const movingAverage = []
  for (let i = 6; i < weights.length; i++) {
    const avg = weights.slice(i - 6, i + 1).reduce((sum, w) => sum + w.weight, 0) / 7
    movingAverage.push({ date: weights[i].date, average: avg })
  }

  // Simple linear regression for trend
  const n = weights.length
  const sumX = weights.reduce((sum, w, i) => sum + i, 0)
  const sumY = weights.reduce((sum, w) => sum + w.weight, 0)
  const sumXY = weights.reduce((sum, w, i) => sum + i * w.weight, 0)
  const sumXX = weights.reduce((sum, _, i) => sum + i * i, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  const trends = weights.map((w, i) => ({
    date: w.date,
    weight: w.weight,
    trend: slope * i + intercept
  }))

  // Prediction for next week
  const nextIndex = n
  const prediction = slope * nextIndex + intercept

  res.json({ trends, movingAverage, prediction: Math.round(prediction * 100) / 100 })
}

export async function getWeightVariance(req: Request, res: Response) {
  const userId = req.userId as string
  const weights = await db.weightEntry.findMany({
    where: { userId },
    orderBy: { date: 'asc' }
  })

  if (weights.length < 2) return res.json({ variance: 0, standardDeviation: 0 })

  const mean = weights.reduce((sum, w) => sum + w.weight, 0) / weights.length
  const variance = weights.reduce((sum, w) => sum + Math.pow(w.weight - mean, 2), 0) / weights.length
  const standardDeviation = Math.sqrt(variance)

  res.json({ variance: Math.round(variance * 100) / 100, standardDeviation: Math.round(standardDeviation * 100) / 100 })
}