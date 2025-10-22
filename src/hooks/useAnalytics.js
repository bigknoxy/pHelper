import { useQuery, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';
import { useDashboardStore } from '../stores/dashboardStore';
import { useAuth } from '../context/AuthContext';
// API functions
const fetchWeightAnalytics = async (timeRange, startDate, endDate) => {
    const params = new URLSearchParams({ timeRange });
    if (startDate)
        params.append('startDate', startDate);
    if (endDate)
        params.append('endDate', endDate);
    const response = await client.get(`/analytics/weights?${params}`);
    return response.data;
};
const fetchWorkoutAnalytics = async (timeRange, startDate, endDate) => {
    const params = new URLSearchParams({ timeRange });
    if (startDate)
        params.append('startDate', startDate);
    if (endDate)
        params.append('endDate', endDate);
    const response = await client.get(`/analytics/workouts?${params}`);
    return response.data;
};
const fetchTaskAnalytics = async (timeRange, startDate, endDate) => {
    const params = new URLSearchParams({ timeRange });
    if (startDate)
        params.append('startDate', startDate);
    if (endDate)
        params.append('endDate', endDate);
    const response = await client.get(`/analytics/tasks?${params}`);
    return response.data;
};
const fetchDashboardOverview = async (timeRange) => {
    const response = await client.get(`/analytics/overview?timeRange=${timeRange}`);
    return response.data;
};
// Custom hooks with React Query
export const useWeightAnalytics = (timeRange, startDate, endDate) => {
    const storeTimeRange = useDashboardStore((state) => state.timeRange);
    const range = timeRange || storeTimeRange;
    const { userId } = useAuth();
    return useQuery({
        queryKey: ['weightAnalytics', range, startDate, endDate],
        queryFn: () => fetchWeightAnalytics(range, startDate, endDate),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        retry: 3,
        enabled: !!userId, // Only run query if user is authenticated
    });
};
export const useWorkoutAnalytics = (timeRange, startDate, endDate) => {
    const storeTimeRange = useDashboardStore((state) => state.timeRange);
    const range = timeRange || storeTimeRange;
    const { userId } = useAuth();
    return useQuery({
        queryKey: ['workoutAnalytics', range, startDate, endDate],
        queryFn: () => fetchWorkoutAnalytics(range, startDate, endDate),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 3,
        enabled: !!userId, // Only run query if user is authenticated
    });
};
export const useTaskAnalytics = (timeRange, startDate, endDate) => {
    const storeTimeRange = useDashboardStore((state) => state.timeRange);
    const range = timeRange || storeTimeRange;
    const { userId } = useAuth();
    return useQuery({
        queryKey: ['taskAnalytics', range, startDate, endDate],
        queryFn: () => fetchTaskAnalytics(range, startDate, endDate),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 3,
        enabled: !!userId, // Only run query if user is authenticated
    });
};
export const useDashboardOverview = (timeRange) => {
    const storeTimeRange = useDashboardStore((state) => state.timeRange);
    const range = timeRange || storeTimeRange;
    const { userId } = useAuth();
    return useQuery({
        queryKey: ['dashboardOverview', range],
        queryFn: () => fetchDashboardOverview(range),
        staleTime: 2 * 60 * 1000, // 2 minutes (more frequent for overview)
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 3,
        enabled: !!userId, // Only run query if user is authenticated
    });
};
// Hook for prefetching analytics data
export const usePrefetchAnalytics = () => {
    const queryClient = useQueryClient();
    const timeRange = useDashboardStore((state) => state.timeRange);
    const { userId } = useAuth();
    const prefetchAllAnalytics = () => {
        if (!userId)
            return; // Don't prefetch if not authenticated
        // Prefetch all analytics data for current time range
        queryClient.prefetchQuery({
            queryKey: ['weightAnalytics', timeRange],
            queryFn: () => fetchWeightAnalytics(timeRange),
            staleTime: 5 * 60 * 1000,
        });
        queryClient.prefetchQuery({
            queryKey: ['workoutAnalytics', timeRange],
            queryFn: () => fetchWorkoutAnalytics(timeRange),
            staleTime: 5 * 60 * 1000,
        });
        queryClient.prefetchQuery({
            queryKey: ['taskAnalytics', timeRange],
            queryFn: () => fetchTaskAnalytics(timeRange),
            staleTime: 5 * 60 * 1000,
        });
        queryClient.prefetchQuery({
            queryKey: ['dashboardOverview', timeRange],
            queryFn: () => fetchDashboardOverview(timeRange),
            staleTime: 2 * 60 * 1000,
        });
    };
    return { prefetchAllAnalytics };
};
// Hook for invalidating analytics cache
export const useInvalidateAnalytics = () => {
    const queryClient = useQueryClient();
    const invalidateAllAnalytics = () => {
        queryClient.invalidateQueries({ queryKey: ['weightAnalytics'] });
        queryClient.invalidateQueries({ queryKey: ['workoutAnalytics'] });
        queryClient.invalidateQueries({ queryKey: ['taskAnalytics'] });
        queryClient.invalidateQueries({ queryKey: ['dashboardOverview'] });
    };
    const invalidateWeightAnalytics = () => {
        queryClient.invalidateQueries({ queryKey: ['weightAnalytics'] });
    };
    const invalidateWorkoutAnalytics = () => {
        queryClient.invalidateQueries({ queryKey: ['workoutAnalytics'] });
    };
    const invalidateTaskAnalytics = () => {
        queryClient.invalidateQueries({ queryKey: ['taskAnalytics'] });
    };
    return {
        invalidateAllAnalytics,
        invalidateWeightAnalytics,
        invalidateWorkoutAnalytics,
        invalidateTaskAnalytics
    };
};
