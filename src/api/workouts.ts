import client from './client'

export interface WorkoutEntry {
  id: string;
  userId: string;
  date: string;
  type: string;
  duration: number;
  notes?: string;
}

export async function getWorkouts(): Promise<WorkoutEntry[]> {
  const res = await client.get('/workouts')
  return res.data as WorkoutEntry[]
}

export async function addWorkout(type: string, duration: number, date: string, notes?: string): Promise<WorkoutEntry> {
  const res = await client.post('/workouts', { type, duration, date, notes })
  return res.data as WorkoutEntry
}

export async function deleteWorkout(id: string): Promise<void> {
  await client.delete(`/workouts/${id}`)
}
