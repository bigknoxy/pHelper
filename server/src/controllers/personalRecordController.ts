import prisma from '../utils/prisma'
import type { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express'


const db = prisma as unknown as PrismaClient

export async function getPersonalRecords(req: Request, res: Response) {
  try {
    const userId = req.userId as string
    const {
      exerciseId,
      recordType,
      limit = '50',
      offset = '0'
    } = req.query

    const filters: any = { userId }

    if (exerciseId) {
      filters.exerciseId = exerciseId
    }

    if (recordType) {
      filters.recordType = recordType
    }

    const records = await db.personalRecord.findMany({
      where: filters,
      include: {
        exercise: {
          select: { id: true, name: true, category: true }
        },
        workout: {
          select: { id: true, date: true, type: true }
        }
      },
      orderBy: [
        { date: 'desc' },
        { value: 'desc' }
      ],
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    })

    const total = await db.personalRecord.count({ where: filters })

    res.json({
      records,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    })
  } catch (error) {
    console.error('Error fetching personal records:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export async function getPersonalRecordById(req: Request, res: Response) {
  try {
    const { id } = req.params
    const userId = req.userId as string

    const record = await db.personalRecord.findUnique({
      where: { id },
      include: {
        exercise: {
          select: { id: true, name: true, category: true }
        },
        workout: {
          select: { id: true, date: true, type: true }
        }
      }
    })

    if (!record || record.userId !== userId) {
      return res.status(404).json({ error: 'Personal record not found' })
    }

    res.json(record)
  } catch (error) {
    console.error('Error fetching personal record:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export async function getPersonalRecordStats(req: Request, res: Response) {
  try {
    const userId = req.userId as string
    const { exerciseId } = req.query

    const filters: any = { userId }

    if (exerciseId) {
      filters.exerciseId = exerciseId
    }

    // Get record type statistics
    const stats = await db.personalRecord.groupBy({
      by: ['recordType'],
      where: filters,
      _max: {
        value: true,
        date: true
      },
      _min: {
        value: true,
        date: true
      },
      _count: {
        id: true
      }
    })

    // Get exercise-specific statistics
    const exerciseStats = await db.personalRecord.groupBy({
      by: ['exerciseId'],
      where: filters,
      _max: {
        value: true,
        date: true
      },
      _min: {
        value: true,
        date: true
      },
      _count: {
        id: true
      }
    })

    // Get recent records (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentRecords = await db.personalRecord.findMany({
      where: {
        ...filters,
        date: {
          gte: thirtyDaysAgo
        }
      },
      include: {
        exercise: {
          select: { id: true, name: true }
        }
      },
      orderBy: { date: 'desc' },
      take: 10
    })

    res.json({
      stats,
      exerciseStats,
      recentRecords,
      totalRecords: await db.personalRecord.count({ where: filters })
    })
  } catch (error) {
    console.error('Error fetching personal record stats:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export async function deletePersonalRecord(req: Request, res: Response) {
  try {
    const { id } = req.params
    const userId = req.userId as string

    const record = await db.personalRecord.findUnique({
      where: { id }
    })

    if (!record || record.userId !== userId) {
      return res.status(404).json({ error: 'Personal record not found' })
    }

    await db.personalRecord.delete({
      where: { id }
    })

    res.status(204).end()
  } catch (error) {
    console.error('Error deleting personal record:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}