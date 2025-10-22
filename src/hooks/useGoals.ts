import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  getGoalAnalytics,
  CreateGoalData,
  UpdateGoalData
} from '../api/goals'

// Query keys
const GOALS_QUERY_KEY = 'goals'
const GOAL_ANALYTICS_QUERY_KEY = 'goalAnalytics'

// Hooks
export const useGoals = () => {
  const { userId } = useAuth()

  return useQuery({
    queryKey: [GOALS_QUERY_KEY],
    queryFn: getGoals,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 3,
    enabled: !!userId,
  })
}

export const useGoalAnalytics = () => {
  const { userId } = useAuth()

  return useQuery({
    queryKey: [GOAL_ANALYTICS_QUERY_KEY],
    queryFn: getGoalAnalytics,
    staleTime: 2 * 60 * 1000, // 2 minutes (more frequent for goals)
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 3,
    enabled: !!userId,
  })
}

// Mutations
export const useCreateGoal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateGoalData) => createGoal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GOALS_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [GOAL_ANALYTICS_QUERY_KEY] })
    },
  })
}

export const useUpdateGoal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGoalData }) =>
      updateGoal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GOALS_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [GOAL_ANALYTICS_QUERY_KEY] })
    },
  })
}

export const useDeleteGoal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GOALS_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [GOAL_ANALYTICS_QUERY_KEY] })
    },
  })
}