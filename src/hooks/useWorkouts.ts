import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getWorkouts, addWorkout, deleteWorkout, WorkoutEntry } from '../api/workouts'

export function useWorkouts(enabled = true) {
  const queryClient = useQueryClient()
  
  const {
    data: workouts = [],
    isLoading,
    error,
  } = useQuery<WorkoutEntry[], Error>({
    queryKey: ['workouts'],
    queryFn: getWorkouts,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    enabled,
  })

  const addWorkoutMutation = useMutation({
    mutationFn: (workout: {
      type: string;
      duration: number;
      date: string;
      notes?: string;
      templateId?: string;
      exercises?: {
        exerciseId: string;
        sets: number;
        reps?: number;
        weight?: number;
        duration?: number;
        restTime?: number;
        order: number;
        notes?: string;
      }[];
    }) => addWorkout(workout),
    onSuccess: (newWorkout) => {
      queryClient.setQueryData(['workouts'], (old: WorkoutEntry[] = []) => [...old, newWorkout])
    },
    onError: (err) => {
       
      console.error('addWorkout failed', err)
    },
  })

  const deleteWorkoutMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteWorkout(id)
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] })
    },
    onError: (err) => {
       
      console.error('deleteWorkout failed', err)
    },
  })

  return {
    workouts,
    isLoading,
    error,
    addWorkout: addWorkoutMutation.mutateAsync,
    deleteWorkout: deleteWorkoutMutation.mutateAsync,
    isAdding: addWorkoutMutation.status === 'pending',
    isDeleting: deleteWorkoutMutation.status === 'pending',
  }
}
