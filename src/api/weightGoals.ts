import client from './client'

export interface WeightGoal {
  id: string
  userId: string
  goalWeight: number
  targetDate: string
  milestones: WeightMilestone[]
  bmiTracking: boolean
  createdAt: string
  updatedAt: string
}

export interface WeightMilestone {
  id: string
  weightGoalId: string
  milestoneWeight: number
  targetDate: string
  achieved: boolean
  achievedDate?: string
  createdAt: string
  updatedAt: string
}

export async function getWeightGoals(): Promise<WeightGoal[]> {
  const res = await client.get('/weight-goals')
  return res.data as WeightGoal[]
}

export async function createWeightGoal(data: {
  goalWeight: number
  targetDate: string
  bmiTracking?: boolean
  milestones?: { milestoneWeight: number; targetDate: string }[]
}): Promise<WeightGoal> {
  const res = await client.post('/weight-goals', data)
  return res.data as WeightGoal
}

export async function updateWeightGoal(id: string, data: {
  goalWeight: number
  targetDate: string
  bmiTracking?: boolean
}): Promise<WeightGoal> {
  const res = await client.put(`/weight-goals/${id}`, data)
  return res.data as WeightGoal
}

export async function deleteWeightGoal(id: string): Promise<void> {
  await client.delete(`/weight-goals/${id}`)
}