import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
  getExerciseCategories,
  getMuscleGroups,
  Exercise,
  ExerciseFilters,
  ExerciseListResponse
} from '../api/exercises'

export function useExercises(filters: ExerciseFilters = {}, enabled = true) {
  const queryClient = useQueryClient()

  const {
    data,
    isLoading,
    error,
  } = useQuery<ExerciseListResponse, Error>({
    queryKey: ['exercises', filters],
    queryFn: () => getExercises(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled,
  })

  const createExerciseMutation = useMutation({
    mutationFn: (exercise: Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>) => createExercise(exercise),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] })
    },
    onError: (err) => {
      console.error('createExercise failed', err)
    },
  })

  const updateExerciseMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>> }) =>
      updateExercise(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] })
    },
    onError: (err) => {
      console.error('updateExercise failed', err)
    },
  })

  const deleteExerciseMutation = useMutation({
    mutationFn: (id: string) => deleteExercise(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] })
    },
    onError: (err) => {
      console.error('deleteExercise failed', err)
    },
  })

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
  }
}

export function useExercise(id: string, enabled = true) {
  return useQuery<Exercise, Error>({
    queryKey: ['exercise', id],
    queryFn: () => getExerciseById(id),
    staleTime: 1000 * 60 * 10, // 10 minutes
    enabled: enabled && !!id,
  })
}

export function useExerciseCategories() {
  return useQuery<string[], Error>({
    queryKey: ['exercise-categories'],
    queryFn: getExerciseCategories,
    staleTime: 1000 * 60 * 60, // 1 hour
  })
}

export function useMuscleGroups() {
  return useQuery<string[], Error>({
    queryKey: ['muscle-groups'],
    queryFn: getMuscleGroups,
    staleTime: 1000 * 60 * 60, // 1 hour
  })
}