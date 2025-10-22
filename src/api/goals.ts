import client from './client'

export interface Goal {
  id: string
  title: string
  description?: string
  target: number
  current: number
  unit: string
  category: 'WEIGHT' | 'WORKOUTS' | 'TASKS'
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED'
  deadline?: string
  createdAt: string
  updatedAt: string
}

export interface GoalWithProgress extends Goal {
  percentage: number
  isCompleted: boolean
}

export interface CreateGoalData {
  title: string
  description?: string
  target: number
  unit: string
  category: 'WEIGHT' | 'WORKOUTS' | 'TASKS'
  deadline?: string
}

export interface UpdateGoalData {
  title?: string
  description?: string
  target?: number
  current?: number
  unit?: string
  category?: 'WEIGHT' | 'WORKOUTS' | 'TASKS'
  status?: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED'
  deadline?: string
}

// API functions
export const getGoals = async (): Promise<Goal[]> => {
  const response = await client.get('/goals')
  return response.data as Goal[]
}

export const createGoal = async (data: CreateGoalData): Promise<Goal> => {
  const response = await client.post('/goals', data)
  return response.data as Goal
}

export const updateGoal = async (id: string, data: UpdateGoalData): Promise<Goal> => {
  const response = await client.put(`/goals/${id}`, data)
  return response.data as Goal
}

export const deleteGoal = async (id: string): Promise<void> => {
  await client.delete(`/goals/${id}`)
}

export const getGoalAnalytics = async (): Promise<GoalWithProgress[]> => {
   const response = await client.get('/analytics/goals')
   return response.data as GoalWithProgress[]
 }