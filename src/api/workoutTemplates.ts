import client from './client'
import { Exercise } from './exercises'

export interface WorkoutTemplate {
  id: string
  name: string
  description?: string
  category: string
  isPublic: boolean
  createdBy: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  exercises: WorkoutTemplateExercise[]
  user?: {
    id: string
    email: string
  }
}

export interface WorkoutTemplateExercise {
  id: string
  workoutTemplateId: string
  exerciseId: string
  exercise: Exercise
  sets: number
  reps?: number
  weight?: number
  duration?: number
  restTime?: number
  order: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface WorkoutTemplateFilters {
  category?: string
  isPublic?: boolean
  search?: string
  limit?: number
  offset?: number
}

export interface WorkoutTemplateListResponse {
  templates: WorkoutTemplate[]
  total: number
  limit: number
  offset: number
}

export async function getWorkoutTemplates(filters: WorkoutTemplateFilters = {}): Promise<WorkoutTemplateListResponse> {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value.toString())
    }
  })

  const res = await client.get(`/workout-templates?${params.toString()}`)
  return res.data as WorkoutTemplateListResponse
}

export async function getWorkoutTemplateById(id: string): Promise<WorkoutTemplate> {
  const res = await client.get(`/workout-templates/${id}`)
  return res.data as WorkoutTemplate
}

export async function createWorkoutTemplate(template: {
  name: string
  description?: string
  category: string
  isPublic?: boolean
  exercises: {
    exerciseId: string
    sets: number
    reps?: number
    weight?: number
    duration?: number
    restTime?: number
    order: number
    notes?: string
  }[]
}): Promise<WorkoutTemplate> {
  const res = await client.post('/workout-templates', template)
  return res.data as WorkoutTemplate
}

export async function updateWorkoutTemplate(id: string, template: Partial<{
  name: string
  description?: string
  category: string
  isPublic?: boolean
  exercises: {
    exerciseId: string
    sets: number
    reps?: number
    weight?: number
    duration?: number
    restTime?: number
    order: number
    notes?: string
  }[]
}>): Promise<WorkoutTemplate> {
  const res = await client.put(`/workout-templates/${id}`, template)
  return res.data as WorkoutTemplate
}

export async function deleteWorkoutTemplate(id: string): Promise<void> {
  await client.delete(`/workout-templates/${id}`)
}

export async function getWorkoutTemplateCategories(): Promise<string[]> {
  const res = await client.get('/workout-templates/categories')
  return res.data as string[]
}