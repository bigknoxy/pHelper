import { useQuery } from '@tanstack/react-query';
import { getEnhancedWorkoutAnalytics, getExerciseAnalytics, getProgressAnalytics, getConsistencyAnalytics } from '../api/enhancedAnalytics';
export function useEnhancedWorkoutAnalytics(period = 30, enabled = true) {
    return useQuery({
        queryKey: ['enhanced-workout-analytics', period],
        queryFn: () => getEnhancedWorkoutAnalytics(period),
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
        enabled,
    });
}
export function useExerciseAnalytics(period = 30, enabled = true) {
    return useQuery({
        queryKey: ['exercise-analytics', period],
        queryFn: () => getExerciseAnalytics(period),
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
        enabled,
    });
}
export function useProgressAnalytics(enabled = true) {
    return useQuery({
        queryKey: ['progress-analytics'],
        queryFn: () => getProgressAnalytics(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
        enabled,
    });
}
export function useConsistencyAnalytics(period = 90, enabled = true) {
    return useQuery({
        queryKey: ['consistency-analytics', period],
        queryFn: () => getConsistencyAnalytics(period),
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
        enabled,
    });
}
