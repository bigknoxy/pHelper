import { useQuery } from '@tanstack/react-query'
import {
  getEnhancedWorkoutAnalytics,
  getExerciseAnalytics,
  getProgressAnalytics,
  getConsistencyAnalytics,
  EnhancedWorkoutAnalytics,
  ExerciseAnalytics,
  ProgressAnalytics,
  ConsistencyAnalytics
} from '../api/enhancedAnalytics'

export function useEnhancedWorkoutAnalytics(period = 30, enabled = true) {
  return useQuery<EnhancedWorkoutAnalytics>({
    queryKey: ['enhanced-workout-analytics', period],
    queryFn: () => getEnhancedWorkoutAnalytics(period),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    enabled,
  })
}

export function useExerciseAnalytics(period = 30, enabled = true) {
  return useQuery<ExerciseAnalytics>({
    queryKey: ['exercise-analytics', period],
    queryFn: () => getExerciseAnalytics(period),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    enabled,
  })
}

export function useProgressAnalytics(enabled = true) {
  return useQuery<ProgressAnalytics>({
    queryKey: ['progress-analytics'],
    queryFn: () => getProgressAnalytics(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    enabled,
  })
}

export function useConsistencyAnalytics(period = 90, enabled = true) {
  return useQuery<ConsistencyAnalytics>({
    queryKey: ['consistency-analytics', period],
    queryFn: () => getConsistencyAnalytics(period),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    enabled,
  })
}