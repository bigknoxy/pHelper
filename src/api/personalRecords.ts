import client from './client'

export enum RecordType {
  MAX_WEIGHT = 'MAX_WEIGHT',
  MAX_REPS = 'MAX_REPS',
  MAX_SETS = 'MAX_SETS',
  PERSONAL_BEST = 'PERSONAL_BEST',
  WORKOUT_VOLUME = 'WORKOUT_VOLUME',
  EXERCISE_FREQUENCY = 'EXERCISE_FREQUENCY'
}

export interface PersonalRecord {
  id: string
  userId: string
  recordType: RecordType
  value: number
  date: string
  exerciseId: string
  workoutId?: string
  workoutExerciseId?: string
  notes?: string
  createdAt: string
  updatedAt: string
  exercise: {
    id: string
    name: string
    category: string
  }
  workout?: {
    id: string
    date: string
    type: string
  }
}

export interface PersonalRecordFilters {
  exerciseId?: string
  recordType?: RecordType
  limit?: number
  offset?: number
}

export interface PersonalRecordListResponse {
  records: PersonalRecord[]
  total: number
  limit: number
  offset: number
}

export interface PersonalRecordStats {
  stats: {
    recordType: RecordType
    _max: {
      value: number
      date: string
    }
    _min: {
      value: number
      date: string
    }
    _count: {
      id: number
    }
  }[]
  exerciseStats: {
    exerciseId: string
    _max: {
      value: number
      date: string
    }
    _min: {
      value: number
      date: string
    }
    _count: {
      id: number
    }
  }[]
  recentRecords: {
    id: string
    userId: string
    recordType: RecordType
    value: number
    date: string
    exerciseId: string
    notes?: string
    createdAt: string
    updatedAt: string
    exercise: {
      id: string
      name: string
    }
  }[]
  totalRecords: number
}

export async function getPersonalRecords(filters: PersonalRecordFilters = {}): Promise<PersonalRecordListResponse> {
  const params = new URLSearchParams()
  if (filters.exerciseId) params.append('exerciseId', filters.exerciseId)
  if (filters.recordType) params.append('recordType', filters.recordType)
  if (filters.limit) params.append('limit', filters.limit.toString())
  if (filters.offset) params.append('offset', filters.offset.toString())

  const res = await client.get(`/personal-records?${params.toString()}`)
  return res.data as PersonalRecordListResponse
}

export async function getPersonalRecordById(id: string): Promise<PersonalRecord> {
  const res = await client.get(`/personal-records/${id}`)
  return res.data as PersonalRecord
}

export async function getPersonalRecordStats(exerciseId?: string): Promise<PersonalRecordStats> {
  const params = new URLSearchParams()
  if (exerciseId) params.append('exerciseId', exerciseId)

  const res = await client.get(`/personal-records/stats?${params.toString()}`)
  return res.data as PersonalRecordStats
}

export async function deletePersonalRecord(id: string): Promise<void> {
  await client.delete(`/personal-records/${id}`)
}