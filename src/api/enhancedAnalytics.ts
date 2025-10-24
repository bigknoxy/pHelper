import client from './client'
import { useQuery } from '@tanstack/react-query'

export interface EnhancedWorkoutAnalytics {
  period: number
  workoutFrequency: {
    date: string
    count: number
    total_duration: number
  }[]
  workoutTypes: {
    type: string
    count: number
    avg_duration: number
  }[]
  totalStats: {
    total_workouts: number
    total_duration: number
    workout_days: number
    avg_duration: number
  }
  weeklyTrends: {
    week: string
    workouts: number
    total_duration: number
    avg_duration: number
  }[]
  generatedAt: string
}

export interface ExerciseAnalytics {
  period: number
  topExercises: {
    name: string
    category: string
    muscleGroups: string[]
    total_sets: number
    total_sets_count: number
    avg_weight: number
    max_weight: number
    workout_days: number
  }[]
  muscleGroups: {
    muscle_group: string
    total_sets: number
    total_sets_count: number
  }[]
  categories: {
    category: string
    total_sets: number
    total_sets_count: number
  }[]
  generatedAt: string
}

export interface ProgressAnalytics {
  personalRecords: {
    id: string
    recordType: string
    value: number
    date: string
    exercise: {
      id: string
      name: string
      category: string
    }
    workout?: {
      id: string
      date: string
      type: string
    }
  }[]
  recentPRs: {
    id: string
    recordType: string
    value: number
    date: string
    exercise: {
      id: string
      name: string
    }
  }[]
  prStats: {
    recordType: string
    _count: {
      id: number
    }
    _max: {
      value: number
      date: string
    }
  }[]
  exercisePRStats: {
    exerciseId: string
    _count: {
      id: number
    }
    _max: {
      value: number
      date: string
    }
  }[]
  totalPRs: number
  recentPRCount: number
  generatedAt: string
}

export interface ConsistencyAnalytics {
  period: number
  dailyConsistency: {
    date: string
    has_workout: boolean
    workout_count: number
    total_duration: number
  }[]
  currentStreak: number
  longestStreak: number
  weeklyConsistency: {
    week: string
    workouts: number
    active_days: number
    total_duration: number
  }[]
  totalDays: number
  workoutDays: number
  consistencyRate: number
  generatedAt: string
}

export async function getEnhancedWorkoutAnalytics(period = 30): Promise<EnhancedWorkoutAnalytics> {
  const res = await client.get(`/enhanced-analytics/enhanced-workouts?period=${period}`)
  return res.data as EnhancedWorkoutAnalytics
}

export async function getExerciseAnalytics(period = 30): Promise<ExerciseAnalytics> {
  const res = await client.get(`/enhanced-analytics/exercises?period=${period}`)
  return res.data as ExerciseAnalytics
}

export async function getProgressAnalytics(): Promise<ProgressAnalytics> {
  const res = await client.get('/enhanced-analytics/progress')
  return res.data as ProgressAnalytics
}

export async function getConsistencyAnalytics(period = 90): Promise<ConsistencyAnalytics> {
  const res = await client.get(`/enhanced-analytics/consistency?period=${period}`)
  return res.data as ConsistencyAnalytics
}

// Hooks
export function useEnhancedWorkoutAnalytics(period = 30, enabled = true) {
  return useQuery<EnhancedWorkoutAnalytics, Error>({
    queryKey: ['enhanced-workout-analytics', period],
    queryFn: () => getEnhancedWorkoutAnalytics(period),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled,
  })
}

export function useExerciseAnalytics(period = 30, enabled = true) {
  return useQuery<ExerciseAnalytics, Error>({
    queryKey: ['exercise-analytics', period],
    queryFn: () => getExerciseAnalytics(period),
    staleTime: 1000 * 60 * 5,
    enabled,
  })
}

export function useProgressAnalytics(enabled = true) {
  return useQuery<ProgressAnalytics, Error>({
    queryKey: ['progress-analytics'],
    queryFn: getProgressAnalytics,
    staleTime: 1000 * 60 * 10, // 10 minutes
    enabled,
  })
}

export function useConsistencyAnalytics(period = 90, enabled = true) {
  return useQuery<ConsistencyAnalytics, Error>({
    queryKey: ['consistency-analytics', period],
    queryFn: () => getConsistencyAnalytics(period),
    staleTime: 1000 * 60 * 5,
    enabled,
  })
}