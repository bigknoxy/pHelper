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

// Enhanced workout analytics for Phase 4
export async function getEnhancedWorkoutAnalytics(req: Request, res: Response) {
  try {
    const userId = req.userId as string
    const { period = '30' } = req.query // days

    const days = parseInt(period as string)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get workouts in the period using Prisma instead of raw SQL
    const workoutsInPeriod = await db.workout.findMany({
      where: {
        userId,
        date: {
          gte: startDate
        }
      },
      select: {
        date: true,
        type: true,
        duration: true
      }
    })

    // Calculate workout frequency over time
    const workoutFrequencyMap = new Map<string, { count: number; total_duration: number }>()
    workoutsInPeriod.forEach(workout => {
      const dateKey = workout.date.toISOString().split('T')[0]
      const existing = workoutFrequencyMap.get(dateKey) || { count: 0, total_duration: 0 }
      existing.count += 1
      existing.total_duration += workout.duration
      workoutFrequencyMap.set(dateKey, existing)
    })

    const workoutFrequency = Array.from(workoutFrequencyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Get workout types distribution
    const workoutTypesMap = new Map<string, { count: number; total_duration: number }>()
    workoutsInPeriod.forEach(workout => {
      const existing = workoutTypesMap.get(workout.type) || { count: 0, total_duration: 0 }
      existing.count += 1
      existing.total_duration += workout.duration
      workoutTypesMap.set(workout.type, existing)
    })

    const workoutTypes = Array.from(workoutTypesMap.entries())
      .map(([type, data]) => ({
        type,
        count: data.count,
        avg_duration: data.total_duration / data.count
      }))
      .sort((a, b) => b.count - a.count)

    // Get total stats
    const totalStats = [{
      total_workouts: workoutsInPeriod.length,
      total_duration: workoutsInPeriod.reduce((sum, w) => sum + w.duration, 0),
      workout_days: workoutFrequency.length,
      avg_duration: workoutsInPeriod.length > 0
        ? workoutsInPeriod.reduce((sum, w) => sum + w.duration, 0) / workoutsInPeriod.length
        : 0
    }]

    // Get weekly trends (last 12 weeks)
    const twelveWeeksAgo = new Date(Date.now() - 84 * 24 * 60 * 60 * 1000)
    const weeklyWorkouts = await db.workout.findMany({
      where: {
        userId,
        date: {
          gte: twelveWeeksAgo
        }
      },
      select: {
        date: true,
        duration: true
      }
    })

    // Calculate weekly trends
    const weeklyStats = new Map<string, { workouts: number; total_duration: number }>()
    weeklyWorkouts.forEach(workout => {
      const weekKey = getWeekKey(workout.date)
      const existing = weeklyStats.get(weekKey) || { workouts: 0, total_duration: 0 }
      existing.workouts += 1
      existing.total_duration += workout.duration
      weeklyStats.set(weekKey, existing)
    })

    const weeklyTrends = Array.from(weeklyStats.entries())
      .map(([week, stats]) => ({
        week,
        workouts: stats.workouts,
        total_duration: stats.total_duration,
        avg_duration: stats.total_duration / stats.workouts
      }))
      .sort((a, b) => a.week.localeCompare(b.week))

    res.json({
      period: days,
      workoutFrequency,
      workoutTypes,
      totalStats: totalStats[0],
      weeklyTrends,
      generatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching enhanced workout analytics:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Helper function to get week key for grouping
function getWeekKey(date: Date): string {
  const year = date.getFullYear()
  const month = date.getMonth()
  const day = date.getDate()
  const weekStart = new Date(year, month, day - date.getDay())
  return weekStart.toISOString().split('T')[0]
}

export async function getExerciseAnalytics(req: Request, res: Response) {
  try {
    const userId = req.userId as string
    const { period = '30' } = req.query // days

    const days = parseInt(period as string)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get workout exercises in the period using Prisma
    const workoutExercisesInPeriod = await db.workoutExercise.findMany({
      where: {
        workout: {
          userId,
          date: {
            gte: startDate
          }
        }
      },
      include: {
        exercise: true,
        workout: {
          select: {
            date: true
          }
        }
      }
    })

    // Calculate top exercises
    const exerciseStats = new Map<string, {
      name: string
      category: string
      muscleGroups: string[]
      total_sets: number
      total_sets_count: number
      total_weight: number
      max_weight: number
      workout_days: Set<string>
    }>()

    workoutExercisesInPeriod.forEach(we => {
      const key = we.exerciseId
      const existing = exerciseStats.get(key) || {
        name: we.exercise.name,
        category: we.exercise.category,
        muscleGroups: we.exercise.muscleGroups,
        total_sets: 0,
        total_sets_count: 0,
        total_weight: 0,
        max_weight: 0,
        workout_days: new Set()
      }

      existing.total_sets += 1
      existing.total_sets_count += we.sets || 0
      if (we.weight) {
        existing.total_weight += we.weight * (we.sets || 1)
        existing.max_weight = Math.max(existing.max_weight, we.weight)
      }
      existing.workout_days.add(we.workout.date.toISOString().split('T')[0])

      exerciseStats.set(key, existing)
    })

    const topExercises = Array.from(exerciseStats.values())
      .map(stats => ({
        name: stats.name,
        category: stats.category,
        muscleGroups: stats.muscleGroups,
        total_sets: stats.total_sets,
        total_sets_count: stats.total_sets_count,
        avg_weight: stats.total_weight / stats.total_sets_count || 0,
        max_weight: stats.max_weight,
        workout_days: stats.workout_days.size
      }))
      .sort((a, b) => b.total_sets - a.total_sets)
      .slice(0, 20)

    // Calculate muscle group distribution
    const muscleGroupStats = new Map<string, { total_sets: number; total_sets_count: number }>()
    workoutExercisesInPeriod.forEach(we => {
      we.exercise.muscleGroups.forEach(muscle => {
        const existing = muscleGroupStats.get(muscle) || { total_sets: 0, total_sets_count: 0 }
        existing.total_sets += 1
        existing.total_sets_count += we.sets || 0
        muscleGroupStats.set(muscle, existing)
      })
    })

    const muscleGroups = Array.from(muscleGroupStats.entries())
      .map(([muscle_group, stats]) => ({ muscle_group, ...stats }))
      .sort((a, b) => b.total_sets_count - a.total_sets_count)

    // Calculate exercise categories distribution
    const categoryStats = new Map<string, { total_sets: number; total_sets_count: number }>()
    workoutExercisesInPeriod.forEach(we => {
      const existing = categoryStats.get(we.exercise.category) || { total_sets: 0, total_sets_count: 0 }
      existing.total_sets += 1
      existing.total_sets_count += we.sets || 0
      categoryStats.set(we.exercise.category, existing)
    })

    const categories = Array.from(categoryStats.entries())
      .map(([category, stats]) => ({ category, ...stats }))
      .sort((a, b) => b.total_sets_count - a.total_sets_count)

    res.json({
      period: days,
      topExercises,
      muscleGroups,
      categories,
      generatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching exercise analytics:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export async function getProgressAnalytics(req: Request, res: Response) {
  try {
    const userId = req.userId as string

    // Get personal records over time
    const personalRecords = await db.personalRecord.findMany({
      where: { userId },
      include: {
        exercise: {
          select: { id: true, name: true, category: true }
        },
        workout: {
          select: { id: true, date: true, type: true }
        }
      },
      orderBy: { date: 'desc' },
      take: 50
    })

    // Get recent personal records (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentPRs = await db.personalRecord.findMany({
      where: {
        userId,
        date: {
          gte: thirtyDaysAgo
        }
      },
      include: {
        exercise: {
          select: { id: true, name: true }
        }
      },
      orderBy: { date: 'desc' }
    })

    // Get PR statistics by type
    const prStats = await db.personalRecord.groupBy({
      by: ['recordType'],
      where: { userId },
      _count: {
        id: true
      },
      _max: {
        value: true,
        date: true
      }
    })

    // Get PR statistics by exercise
    const exercisePRStats = await db.personalRecord.groupBy({
      by: ['exerciseId'],
      where: { userId },
      _count: {
        id: true
      },
      _max: {
        value: true,
        date: true
      }
    })

    res.json({
      personalRecords,
      recentPRs,
      prStats,
      exercisePRStats,
      totalPRs: personalRecords.length,
      recentPRCount: recentPRs.length,
      generatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching progress analytics:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export async function getConsistencyAnalytics(req: Request, res: Response) {
  try {
    const userId = req.userId as string
    const { period = '90' } = req.query // days

    const days = parseInt(period as string)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get workouts in the period using Prisma
    const workoutsInPeriod = await db.workout.findMany({
      where: {
        userId,
        date: {
          gte: startDate
        }
      },
      select: {
        date: true,
        duration: true
      }
    })

    // Calculate daily consistency
    const dailyStats = new Map<string, { has_workout: boolean; workout_count: number; total_duration: number }>()
    workoutsInPeriod.forEach(workout => {
      const dateKey = workout.date.toISOString().split('T')[0]
      const existing = dailyStats.get(dateKey) || { has_workout: false, workout_count: 0, total_duration: 0 }
      existing.has_workout = true
      existing.workout_count += 1
      existing.total_duration += workout.duration
      dailyStats.set(dateKey, existing)
    })

    // Fill in missing days with no workouts
    const dailyConsistency: any[] = []
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateKey = date.toISOString().split('T')[0]
      const stats = dailyStats.get(dateKey) || { has_workout: false, workout_count: 0, total_duration: 0 }
      dailyConsistency.push({
        date: dateKey,
        has_workout: stats.has_workout,
        workout_count: stats.workout_count,
        total_duration: stats.total_duration
      })
    }
    dailyConsistency.reverse() // Oldest first

    // Calculate streaks
    const currentStreak = await calculateCurrentStreak(userId)
    const longestStreak = await calculateLongestStreak(userId)

    // Calculate weekly consistency
    const weeklyStats = new Map<string, { workouts: number; active_days: number; total_duration: number }>()
    workoutsInPeriod.forEach(workout => {
      const weekKey = getWeekKey(workout.date)
      const existing = weeklyStats.get(weekKey) || { workouts: 0, active_days: 0, total_duration: 0 }
      existing.workouts += 1
      existing.total_duration += workout.duration

      // Count unique days in the week
      const dayKey = workout.date.toISOString().split('T')[0]
      const weekDays = new Set()
      workoutsInPeriod.forEach(w => {
        if (getWeekKey(w.date) === weekKey) {
          weekDays.add(w.date.toISOString().split('T')[0])
        }
      })
      existing.active_days = weekDays.size

      weeklyStats.set(weekKey, existing)
    })

    const weeklyConsistency = Array.from(weeklyStats.entries())
      .map(([week, stats]) => ({ week, ...stats }))
      .sort((a, b) => a.week.localeCompare(b.week))

    res.json({
      period: days,
      dailyConsistency,
      currentStreak,
      longestStreak,
      weeklyConsistency,
      totalDays: days,
      workoutDays: dailyConsistency.filter(d => d.has_workout).length,
      consistencyRate: (dailyConsistency.filter(d => d.has_workout).length / days) * 100,
      generatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching consistency analytics:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Helper functions for enhanced analytics
async function calculateCurrentStreak(userId: string): Promise<number> {
  const workouts = await db.workout.findMany({
    where: { userId },
    select: { date: true },
    orderBy: { date: 'desc' }
  })

  if (workouts.length === 0) return 0

  let streak = 0
  const currentDate = new Date()

  // Check if today has a workout
  const today = new Date().toDateString()
  const todayWorkout = workouts.find(w => w.date.toDateString() === today)

  if (todayWorkout) {
    streak = 1
    currentDate.setDate(currentDate.getDate() - 1)
  }

  // Count consecutive days backwards
  for (let i = 0; i < workouts.length; i++) {
    const workoutDate = workouts[i].date.toDateString()
    const expectedDate = currentDate.toDateString()

    if (workoutDate === expectedDate) {
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}

async function calculateLongestStreak(userId: string): Promise<number> {
  const workouts = await db.workout.findMany({
    where: { userId },
    select: { date: true },
    orderBy: { date: 'asc' }
  })

  if (workouts.length === 0) return 0

  let longestStreak = 1
  let currentStreak = 1

  for (let i = 1; i < workouts.length; i++) {
    const prevDate = new Date(workouts[i - 1].date)
    const currentDate = new Date(workouts[i].date)

    // Calculate days difference
    const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      currentStreak++
      longestStreak = Math.max(longestStreak, currentStreak)
    } else {
      currentStreak = 1
    }
  }

  return longestStreak
}