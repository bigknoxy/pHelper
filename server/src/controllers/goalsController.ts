 import prisma from '../utils/prisma'
import type { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express'
import { z } from 'zod'

const db = prisma as unknown as PrismaClient

const createGoalSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  target: z.number().positive('Target must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  category: z.enum(['WEIGHT', 'WORKOUTS', 'TASKS']),
  deadline: z.string().optional()
})

const updateGoalSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  target: z.number().positive('Target must be positive').optional(),
  current: z.number().min(0, 'Current progress cannot be negative').optional(),
  unit: z.string().min(1, 'Unit is required').optional(),
  category: z.enum(['WEIGHT', 'WORKOUTS', 'TASKS']).optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED']).optional(),
  deadline: z.string().optional()
})

export async function getGoals(req: Request, res: Response) {
  const userId = req.userId as string

  try {
    const goals = await db.goal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    res.json(goals)
  } catch (error) {
    console.error('Error fetching goals:', error)
    res.status(500).json({ error: 'Failed to fetch goals' })
  }
}

export async function createGoal(req: Request, res: Response) {
  const userId = req.userId as string

  try {
    const parse = createGoalSchema.safeParse(req.body)
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.issues })
    }

    const { title, description, target, unit, category, deadline } = parse.data

    const goal = await db.goal.create({
      data: {
        userId,
        title,
        description,
        target,
        current: 0,
        unit,
        category,
        deadline: deadline ? new Date(deadline) : null,
        status: 'ACTIVE'
      }
    })

    res.status(201).json(goal)
  } catch (error) {
    console.error('Error creating goal:', error)
    res.status(500).json({ error: 'Failed to create goal' })
  }
}

export async function updateGoal(req: Request, res: Response) {
  const userId = req.userId as string
  const { id } = req.params

  try {
    const parse = updateGoalSchema.safeParse(req.body)
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.issues })
    }

    // Check if goal exists and belongs to user
    const existingGoal = await db.goal.findFirst({
      where: { id, userId }
    })

    if (!existingGoal) {
      return res.status(404).json({ error: 'Goal not found' })
    }

    const updateData: any = { ...parse.data }
    if (updateData.deadline) {
      updateData.deadline = new Date(updateData.deadline)
    }

    // Auto-complete goal if current >= target
    if (updateData.current !== undefined && updateData.target !== undefined) {
      if (updateData.current >= updateData.target) {
        updateData.status = 'COMPLETED'
      }
    }

    const goal = await db.goal.update({
      where: { id },
      data: updateData
    })

    res.json(goal)
  } catch (error) {
    console.error('Error updating goal:', error)
    res.status(500).json({ error: 'Failed to update goal' })
  }
}

export async function deleteGoal(req: Request, res: Response) {
  const userId = req.userId as string
  const { id } = req.params

  try {
    // Check if goal exists and belongs to user
    const existingGoal = await db.goal.findFirst({
      where: { id, userId }
    })

    if (!existingGoal) {
      return res.status(404).json({ error: 'Goal not found' })
    }

    await db.goal.delete({
      where: { id }
    })

    res.status(204).send()
  } catch (error) {
    console.error('Error deleting goal:', error)
    res.status(500).json({ error: 'Failed to delete goal' })
  }
}

export async function getGoalAnalytics(req: Request, res: Response) {
  const userId = req.userId as string

  try {
    const goals = await db.goal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate progress for each goal based on current data
    const goalsWithProgress = await Promise.all(
      goals.map(async (goal) => {
        let current = 0

        switch (goal.category) {
          case 'WEIGHT':
            // For weight goals, we need to calculate based on weight entries
            const latestWeight = await db.weightEntry.findFirst({
              where: { userId },
              orderBy: { date: 'desc' }
            })
            current = latestWeight?.weight || 0
            break

          case 'WORKOUTS':
            // Count workouts in the last 30 days
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            const workoutCount = await db.workout.count({
              where: {
                userId,
                date: { gte: thirtyDaysAgo }
              }
            })
            current = workoutCount
            break

          case 'TASKS':
            // Count completed tasks in the last 30 days
            const taskCount = await db.task.count({
              where: {
                userId,
                status: 'COMPLETED',
                updatedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
              }
            })
            current = taskCount
            break
        }

        // Update the goal's current progress
        await db.goal.update({
          where: { id: goal.id },
          data: { current }
        })

        const percentage = goal.target > 0 ? (current / goal.target) * 100 : 0
        const isCompleted = percentage >= 100

        return {
          ...goal,
          current,
          percentage: Math.min(percentage, 100),
          isCompleted
        }
      })
    )

    res.json(goalsWithProgress)
  } catch (error) {
    console.error('Error fetching goal analytics:', error)
    res.status(500).json({ error: 'Failed to fetch goal analytics' })
  }
}