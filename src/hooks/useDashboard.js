import { useQuery } from '@tanstack/react-query';
import { getWeights } from '../api/weights';
import { getWorkouts } from '../api/workouts';
import { getTasks } from '../api/tasks';
export function useDashboard() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const { data: weights = [], isLoading: weightsLoading, error: weightsError, } = useQuery({
        queryKey: ['weights'],
        queryFn: getWeights,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
    const { data: workouts = [], isLoading: workoutsLoading, error: workoutsError, } = useQuery({
        queryKey: ['workouts'],
        queryFn: getWorkouts,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
    const { data: tasks = [], isLoading: tasksLoading, error: tasksError, } = useQuery({
        queryKey: ['tasks'],
        queryFn: getTasks,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
    // Calculate metrics
    const latestWeight = weights.length > 0 ? weights[weights.length - 1].weight : null;
    const last7Weights = weights.filter((w) => w.date >= sevenDaysAgo);
    const weightTrend = last7Weights.length > 1
        ? last7Weights[last7Weights.length - 1].weight - last7Weights[0].weight
        : 0;
    const totalWorkouts = workouts.length;
    const lastWorkout = workouts.length > 0 ? workouts[workouts.length - 1].date : null;
    const workoutTypes = workouts.map((w) => w.type);
    const mostFrequentWorkout = workoutTypes.length > 0
        ? workoutTypes.reduce((a, b) => workoutTypes.filter(v => v === a).length >= workoutTypes.filter(v => v === b).length ? a : b)
        : null;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    return {
        // Data
        weights: last7Weights,
        workouts,
        tasks,
        // Loading states
        isLoading: weightsLoading || workoutsLoading || tasksLoading,
        error: weightsError || workoutsError || tasksError,
        // Metrics
        weight: {
            latest: latestWeight,
            trend: weightTrend,
            chart: last7Weights,
        },
        workout: {
            total: totalWorkouts,
            last: lastWorkout,
            mostFrequent: mostFrequentWorkout,
        },
        task: {
            total: totalTasks,
            completed: completedTasks,
            pending: pendingTasks,
        },
    };
}
