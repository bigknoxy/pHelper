 import prisma from '../utils/prisma'
import type { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express'
import { z } from 'zod'

const db = prisma as unknown as PrismaClient

type WeightEntry = { weight: number; date: Date }
type WorkoutEntry = { duration: number; date: Date }
type TaskEntry = { status: string; updatedAt: Date; createdAt: Date }

const timeRangeSchema = z.enum(['7', '30', '90', '365', 'all'])
const analyticsQuerySchema = z.object({
  timeRange: timeRangeSchema.optional().default('30'),
  startDate: z.string().optional(),
  endDate: z.string().optional()
})

export async function getWeightAnalytics(req: Request, res: Response) {
  const userId = req.userId as string
  const parse = analyticsQuerySchema.safeParse(req.query)
  if (!parse.success) return res.status(400).json({ error: parse.error.issues })

  const { timeRange, startDate, endDate } = parse.data

  // Calculate date range
  let startDateFilter: Date
  let endDateFilter: Date = new Date()

  if (startDate && endDate) {
    startDateFilter = new Date(startDate)
    endDateFilter = new Date(endDate)
  } else {
    switch (timeRange) {
      case '7':
        startDateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30':
        startDateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90':
        startDateFilter = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        break
      case '365':
        startDateFilter = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
        break
      case 'all':
      default:
        startDateFilter = new Date(0) // Beginning of time
        break
    }
  }

  // Get weight entries in range
  const weights = await db.weightEntry.findMany({
    where: {
      userId,
      date: {
        gte: startDateFilter,
        lte: endDateFilter
      }
    },
    orderBy: { date: 'asc' }
  })

  if (weights.length === 0) {
    return res.json({
      summary: {
        totalEntries: 0,
        averageWeight: 0,
        weightChange: 0,
        trend: 'stable'
      },
      data: [],
      personalRecords: {
        heaviest: null,
        lightest: null,
        biggestGain: null,
        biggestLoss: null
      }
    })
  }

  // Calculate summary statistics
  const weightValues = weights.map(w => w.weight)
  const averageWeight = weightValues.reduce((sum, w) => sum + w, 0) / weightValues.length
  const firstWeight = weights[0].weight
  const lastWeight = weights[weights.length - 1].weight
  const weightChange = lastWeight - firstWeight
  const trend = weightChange > 0 ? 'gaining' : weightChange < 0 ? 'losing' : 'stable'

  // Calculate moving averages (7-day and 30-day)
  const movingAverages = calculateMovingAverages(weights, [7, 30])

  // Personal records
  const personalRecords = {
    heaviest: Math.max(...weightValues),
    lightest: Math.min(...weightValues),
    biggestGain: 0,
    biggestLoss: 0
  }

  // Calculate biggest gain/loss
  for (let i = 1; i < weights.length; i++) {
    const change = weights[i].weight - weights[i - 1].weight
    if (change > personalRecords.biggestGain) personalRecords.biggestGain = change
    if (change < personalRecords.biggestLoss) personalRecords.biggestLoss = change
  }

  res.json({
    summary: {
      totalEntries: weights.length,
      averageWeight: Math.round(averageWeight * 100) / 100,
      weightChange: Math.round(weightChange * 100) / 100,
      trend,
      startDate: startDateFilter.toISOString(),
      endDate: endDateFilter.toISOString()
    },
    data: weights.map(w => ({
      date: w.date.toISOString().split('T')[0],
      weight: w.weight,
      note: w.note
    })),
    movingAverages,
    personalRecords
  })
}

export async function getWorkoutAnalytics(req: Request, res: Response) {
  const userId = req.userId as string
  const parse = analyticsQuerySchema.safeParse(req.query)
  if (!parse.success) return res.status(400).json({ error: parse.error.issues })

  const { timeRange, startDate, endDate } = parse.data

  // Calculate date range (same logic as above)
  let startDateFilter: Date
  let endDateFilter: Date = new Date()

  if (startDate && endDate) {
    startDateFilter = new Date(startDate)
    endDateFilter = new Date(endDate)
  } else {
    switch (timeRange) {
      case '7':
        startDateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30':
        startDateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90':
        startDateFilter = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        break
      case '365':
        startDateFilter = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
        break
      case 'all':
      default:
        startDateFilter = new Date(0)
        break
    }
  }

  // Get workout entries in range
  const workouts = await db.workout.findMany({
    where: {
      userId,
      date: {
        gte: startDateFilter,
        lte: endDateFilter
      }
    },
    orderBy: { date: 'asc' }
  })

  if (workouts.length === 0) {
    return res.json({
      summary: {
        totalWorkouts: 0,
        totalDuration: 0,
        averageDuration: 0,
        workoutTypes: [],
        streak: 0
      },
      data: [],
      personalRecords: {
        longestWorkout: null,
        mostWorkoutsInDay: null,
        currentStreak: 0,
        longestStreak: 0
      }
    })
  }

  // Calculate summary statistics
  const totalDuration = workouts.reduce((sum, w) => sum + w.duration, 0)
  const averageDuration = totalDuration / workouts.length

  // Workout types frequency
  const workoutTypes = workouts.reduce((acc, w) => {
    acc[w.type] = (acc[w.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Calculate current streak (consecutive days with workouts)
  const streak = calculateWorkoutStreak(workouts)

  // Personal records
  const durations = workouts.map(w => w.duration)
  const personalRecords = {
    longestWorkout: Math.max(...durations),
    mostWorkoutsInDay: 0,
    currentStreak: streak.current,
    longestStreak: streak.longest
  }

  // Calculate most workouts in a day
  const workoutsByDate = workouts.reduce((acc, w) => {
    const date = w.date.toISOString().split('T')[0]
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  personalRecords.mostWorkoutsInDay = Math.max(...Object.values(workoutsByDate))

  res.json({
    summary: {
      totalWorkouts: workouts.length,
      totalDuration,
      averageDuration: Math.round(averageDuration),
      workoutTypes: Object.entries(workoutTypes).map(([type, count]) => ({ type, count })),
      streak: streak.current
    },
    data: workouts.map(w => ({
      date: w.date.toISOString().split('T')[0],
      type: w.type,
      duration: w.duration,
      notes: w.notes
    })),
    personalRecords
  })
}

export async function getTaskAnalytics(req: Request, res: Response) {
  const userId = req.userId as string
  const parse = analyticsQuerySchema.safeParse(req.query)
  if (!parse.success) return res.status(400).json({ error: parse.error.issues })

  const { timeRange, startDate, endDate } = parse.data

  // Calculate date range
  let startDateFilter: Date
  let endDateFilter: Date = new Date()

  if (startDate && endDate) {
    startDateFilter = new Date(startDate)
    endDateFilter = new Date(endDate)
  } else {
    switch (timeRange) {
      case '7':
        startDateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30':
        startDateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90':
        startDateFilter = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        break
      case '365':
        startDateFilter = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
        break
      case 'all':
      default:
        startDateFilter = new Date(0)
        break
    }
  }

  // Get task entries in range
  const tasks = await db.task.findMany({
    where: {
      userId,
      createdAt: {
        gte: startDateFilter,
        lte: endDateFilter
      }
    },
    orderBy: { createdAt: 'asc' }
  })

  if (tasks.length === 0) {
    return res.json({
      summary: {
        totalTasks: 0,
        completedTasks: 0,
        completionRate: 0,
        averageCompletionTime: 0
      },
      data: [],
      personalRecords: {
        mostTasksCompletedInDay: 0,
        longestTaskStreak: 0,
        currentTaskStreak: 0
      }
    })
  }

  // Calculate summary statistics
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED')
  const completionRate = (completedTasks.length / tasks.length) * 100

  // Calculate average completion time (for completed tasks)
  const completionTimes = completedTasks
    .filter(t => t.updatedAt && t.createdAt)
    .map(t => t.updatedAt!.getTime() - t.createdAt.getTime())
  const averageCompletionTime = completionTimes.length > 0
    ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length
    : 0

  // Personal records
  const completedTasksByDate = completedTasks.reduce((acc, t) => {
    const date = t.updatedAt?.toISOString().split('T')[0]
    if (date) acc[date] = (acc[date] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const personalRecords = {
    mostTasksCompletedInDay: Math.max(...Object.values(completedTasksByDate)),
    longestTaskStreak: calculateTaskStreak(completedTasks),
    currentTaskStreak: calculateCurrentTaskStreak(completedTasks)
  }

  res.json({
    summary: {
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      completionRate: Math.round(completionRate * 100) / 100,
      averageCompletionTime: Math.round(averageCompletionTime / (1000 * 60 * 60 * 24)) // days
    },
    data: tasks.map(t => ({
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt?.toISOString(),
      title: t.title,
      status: t.status,
      dueDate: t.dueDate?.toISOString()
    })),
    personalRecords
  })
}

export async function getDashboardOverview(req: Request, res: Response) {
  const userId = req.userId as string
  const parse = analyticsQuerySchema.safeParse(req.query)
  if (!parse.success) return res.status(400).json({ error: parse.error.issues })

  // timeRange is available but not used in this function - keeping for consistency

  // Get data for the last 30 days by default
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const [weights, workouts, tasks, goals] = await Promise.all([
    db.weightEntry.findMany({
      where: { userId, date: { gte: thirtyDaysAgo } },
      orderBy: { date: 'asc' }
    }),
    db.workout.findMany({
      where: { userId, date: { gte: thirtyDaysAgo } },
      orderBy: { date: 'asc' }
    }),
    db.task.findMany({
      where: { userId, createdAt: { gte: thirtyDaysAgo } },
      orderBy: { createdAt: 'asc' }
    }),
    db.goal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })
  ])

  // Calculate quick stats
  const latestWeight = weights.length > 0 ? weights[weights.length - 1].weight : null
  const weightChange = weights.length > 1 ? weights[weights.length - 1].weight - weights[0].weight : 0

  const totalWorkouts = workouts.length
  const totalDuration = workouts.reduce((sum, w) => sum + w.duration, 0)

  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length
  const totalTasks = tasks.length

  // Calculate goals progress
  const activeGoals = goals.filter(g => g.status === 'ACTIVE')
  const completedGoals = goals.filter(g => g.status === 'COMPLETED')
  const totalGoals = goals.length

  res.json({
    overview: {
      latestWeight,
      weightChange,
      totalWorkouts,
      totalDuration,
      completedTasks,
      totalTasks,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      activeGoals: activeGoals.length,
      completedGoals: completedGoals.length,
      totalGoals
    },
    trends: {
      weightTrend: calculateTrend(weights.map(w => ({ date: w.date, value: w.weight }))),
      workoutTrend: calculateTrend(workouts.map(w => ({ date: w.date, value: w.duration }))),
      taskTrend: calculateTrend(tasks.map(t => ({ date: t.createdAt, value: t.status === 'COMPLETED' ? 1 : 0 })))
    }
  })
}

export async function getGoalAnalytics(req: Request, res: Response) {
  const userId = req.userId as string
  const parse = analyticsQuerySchema.safeParse(req.query)
  if (!parse.success) return res.status(400).json({ error: parse.error.issues })

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
          case 'WEIGHT': {
            // For weight goals, we need to calculate based on weight entries
            const latestWeight = await db.weightEntry.findFirst({
              where: { userId },
              orderBy: { date: 'desc' }
            })
            current = latestWeight?.weight || 0
            break
          }

          case 'WORKOUTS': {
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
          }

          case 'TASKS': {
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

// Helper functions
function calculateMovingAverages(weights: WeightEntry[], periods: number[]) {
  const result: Record<string, number[]> = {}

  periods.forEach(period => {
    result[`ma${period}`] = []
    for (let i = period - 1; i < weights.length; i++) {
      const sum = weights.slice(i - period + 1, i + 1).reduce((acc, w) => acc + w.weight, 0)
      result[`ma${period}`].push(Math.round((sum / period) * 100) / 100)
    }
  })

  return result
}

function calculateWorkoutStreak(workouts: WorkoutEntry[]) {
  if (workouts.length === 0) return { current: 0, longest: 0 }

  // Sort by date descending
  const sortedWorkouts = [...workouts].sort((a, b) => b.date.getTime() - a.date.getTime())

  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < sortedWorkouts.length; i++) {
    const workoutDate = new Date(sortedWorkouts[i].date)
    workoutDate.setHours(0, 0, 0, 0)

    const daysDiff = Math.floor((today.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24))

    if (daysDiff === currentStreak) {
      currentStreak++
      tempStreak = currentStreak
    } else if (daysDiff > currentStreak) {
      if (tempStreak > longestStreak) longestStreak = tempStreak
      currentStreak = 0
      tempStreak = 0
    }
  }

  if (tempStreak > longestStreak) longestStreak = tempStreak

  return { current: currentStreak, longest: longestStreak }
}

function calculateTaskStreak(completedTasks: TaskEntry[]) {
  if (completedTasks.length === 0) return 0

  // Sort by completion date descending
  const sortedTasks = [...completedTasks].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())

  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < sortedTasks.length; i++) {
    const taskDate = new Date(sortedTasks[i].updatedAt)
    taskDate.setHours(0, 0, 0, 0)

    const daysDiff = Math.floor((today.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24))

    if (daysDiff === streak) {
      streak++
    } else {
      break
    }
  }

  return streak
}

function calculateCurrentTaskStreak(completedTasks: TaskEntry[]) {
  if (completedTasks.length === 0) return 0

  // Sort by completion date descending
  const sortedTasks = [...completedTasks].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())

  let streak = 0
  let currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)

  for (const task of sortedTasks) {
    const taskDate = new Date(task.updatedAt)
    taskDate.setHours(0, 0, 0, 0)

    const daysDiff = Math.floor((currentDate.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24))

    if (daysDiff <= streak) {
      streak++
      currentDate = taskDate
    } else {
      break
    }
  }

  return streak
}

function calculateTrend(data: { date: Date; value: number }[]) {
  if (data.length < 2) return 'stable'

  const firstValue = data[0].value
  const lastValue = data[data.length - 1].value
  const change = lastValue - firstValue

  if (Math.abs(change) < 0.01) return 'stable'
  return change > 0 ? 'increasing' : 'decreasing'
}