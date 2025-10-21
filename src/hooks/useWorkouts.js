import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWorkouts, addWorkout, deleteWorkout } from '../api/workouts';
export function useWorkouts(enabled = true) {
    const queryClient = useQueryClient();
    const { data: workouts = [], isLoading, error, } = useQuery({
        queryKey: ['workouts'],
        queryFn: getWorkouts,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
        enabled,
    });
    const addWorkoutMutation = useMutation({
        mutationFn: ({ type, duration, date, notes }) => addWorkout(type, duration, date, notes),
        onSuccess: (newWorkout) => {
            queryClient.setQueryData(['workouts'], (old = []) => [...old, newWorkout]);
        },
        onError: (err) => {
            // eslint-disable-next-line no-console
            console.error('addWorkout failed', err);
        },
    });
    const deleteWorkoutMutation = useMutation({
        mutationFn: async (id) => {
            await deleteWorkout(id);
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workouts'] });
        },
        onError: (err) => {
            // eslint-disable-next-line no-console
            console.error('deleteWorkout failed', err);
        },
    });
    return {
        workouts,
        isLoading,
        error,
        addWorkout: addWorkoutMutation.mutateAsync,
        deleteWorkout: deleteWorkoutMutation.mutateAsync,
        isAdding: addWorkoutMutation.status === 'pending',
        isDeleting: deleteWorkoutMutation.status === 'pending',
    };
}
