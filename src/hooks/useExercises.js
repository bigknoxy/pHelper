import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getExercises, getExerciseById, createExercise, updateExercise, deleteExercise, getExerciseCategories, getMuscleGroups } from '../api/exercises';
export function useExercises(filters = {}, enabled = true) {
    const queryClient = useQueryClient();
    const { data, isLoading, error, } = useQuery({
        queryKey: ['exercises', filters],
        queryFn: () => getExercises(filters),
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled,
    });
    const createExerciseMutation = useMutation({
        mutationFn: (exercise) => createExercise(exercise),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['exercises'] });
        },
        onError: (err) => {
            console.error('createExercise failed', err);
        },
    });
    const updateExerciseMutation = useMutation({
        mutationFn: ({ id, updates }) => updateExercise(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['exercises'] });
        },
        onError: (err) => {
            console.error('updateExercise failed', err);
        },
    });
    const deleteExerciseMutation = useMutation({
        mutationFn: (id) => deleteExercise(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['exercises'] });
        },
        onError: (err) => {
            console.error('deleteExercise failed', err);
        },
    });
    return {
        exercises: data?.exercises || [],
        total: data?.total || 0,
        isLoading,
        error,
        createExercise: createExerciseMutation.mutateAsync,
        updateExercise: updateExerciseMutation.mutateAsync,
        deleteExercise: deleteExerciseMutation.mutateAsync,
        isCreating: createExerciseMutation.status === 'pending',
        isUpdating: updateExerciseMutation.status === 'pending',
        isDeleting: deleteExerciseMutation.status === 'pending',
    };
}
export function useExercise(id, enabled = true) {
    return useQuery({
        queryKey: ['exercise', id],
        queryFn: () => getExerciseById(id),
        staleTime: 1000 * 60 * 10, // 10 minutes
        enabled: enabled && !!id,
    });
}
export function useExerciseCategories() {
    return useQuery({
        queryKey: ['exercise-categories'],
        queryFn: getExerciseCategories,
        staleTime: 1000 * 60 * 60, // 1 hour
    });
}
export function useMuscleGroups() {
    return useQuery({
        queryKey: ['muscle-groups'],
        queryFn: getMuscleGroups,
        staleTime: 1000 * 60 * 60, // 1 hour
    });
}
