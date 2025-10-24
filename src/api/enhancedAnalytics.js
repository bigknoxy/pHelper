import client from './client';
import { useQuery } from '@tanstack/react-query';
export async function getEnhancedWorkoutAnalytics(period = 30) {
    const res = await client.get(`/enhanced-analytics/enhanced-workouts?period=${period}`);
    return res.data;
}
export async function getExerciseAnalytics(period = 30) {
    const res = await client.get(`/enhanced-analytics/exercises?period=${period}`);
    return res.data;
}
export async function getProgressAnalytics() {
    const res = await client.get('/enhanced-analytics/progress');
    return res.data;
}
export async function getConsistencyAnalytics(period = 90) {
    const res = await client.get(`/enhanced-analytics/consistency?period=${period}`);
    return res.data;
}
// Hooks
export function useEnhancedWorkoutAnalytics(period = 30, enabled = true) {
    return useQuery({
        queryKey: ['enhanced-workout-analytics', period],
        queryFn: () => getEnhancedWorkoutAnalytics(period),
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled,
    });
}
export function useExerciseAnalytics(period = 30, enabled = true) {
    return useQuery({
        queryKey: ['exercise-analytics', period],
        queryFn: () => getExerciseAnalytics(period),
        staleTime: 1000 * 60 * 5,
        enabled,
    });
}
export function useProgressAnalytics(enabled = true) {
    return useQuery({
        queryKey: ['progress-analytics'],
        queryFn: getProgressAnalytics,
        staleTime: 1000 * 60 * 10, // 10 minutes
        enabled,
    });
}
export function useConsistencyAnalytics(period = 90, enabled = true) {
    return useQuery({
        queryKey: ['consistency-analytics', period],
        queryFn: () => getConsistencyAnalytics(period),
        staleTime: 1000 * 60 * 5,
        enabled,
    });
}
