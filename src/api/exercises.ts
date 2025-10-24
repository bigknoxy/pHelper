import client from './client'

export enum ExerciseCategory {
  STRENGTH = 'STRENGTH',
  CARDIO = 'CARDIO',
  FLEXIBILITY = 'FLEXIBILITY',
  BALANCE = 'BALANCE',
  FUNCTIONAL = 'FUNCTIONAL',
  SPORTS = 'SPORTS'
}

export enum MuscleGroup {
  CHEST = 'CHEST',
  BACK = 'BACK',
  SHOULDERS = 'SHOULDERS',
  BICEPS = 'BICEPS',
  TRICEPS = 'TRICEPS',
  FOREARMS = 'FOREARMS',
  CORE = 'CORE',
  QUADRICEPS = 'QUADRICEPS',
  HAMSTRINGS = 'HAMSTRINGS',
  GLUTES = 'GLUTES',
  CALVES = 'CALVES',
  FULL_BODY = 'FULL_BODY'
}

export enum ExerciseDifficulty {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED'
}

export interface Exercise {
  id: string
  name: string
  description?: string
  instructions?: string
  category: ExerciseCategory
  muscleGroups: MuscleGroup[]
  equipment?: string[]
  difficulty: ExerciseDifficulty
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ExerciseFilters {
  category?: ExerciseCategory
  muscleGroup?: MuscleGroup
  difficulty?: ExerciseDifficulty
  search?: string
  limit?: number
  offset?: number
}

export interface ExerciseListResponse {
  exercises: Exercise[]
  total: number
  limit: number
  offset: number
}

export async function getExercises(filters: ExerciseFilters = {}): Promise<ExerciseListResponse> {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value.toString())
    }
  })

  const res = await client.get(`/exercises?${params.toString()}`)
  return res.data as ExerciseListResponse
}

export async function getExerciseById(id: string): Promise<Exercise> {
  const res = await client.get(`/exercises/${id}`)
  return res.data as Exercise
}

export async function createExercise(exercise: Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>): Promise<Exercise> {
  const res = await client.post('/exercises', exercise)
  return res.data as Exercise
}

export async function updateExercise(id: string, exercise: Partial<Exercise>): Promise<Exercise> {
  const res = await client.put(`/exercises/${id}`, exercise)
  return res.data as Exercise
}

export async function deleteExercise(id: string): Promise<void> {
  await client.delete(`/exercises/${id}`)
}

export async function getExerciseCategories(): Promise<string[]> {
  const res = await client.get('/exercises/categories')
  return res.data as string[]
}

export async function getMuscleGroups(): Promise<string[]> {
  const res = await client.get('/exercises/muscle-groups')
  return res.data as string[]
}