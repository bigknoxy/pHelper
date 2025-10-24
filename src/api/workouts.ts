import client from './client'

export interface WorkoutEntry {
  id: string;
  userId: string;
  date: string;
  type: string;
  duration: number;
  notes?: string;
  exercises?: WorkoutExercise[];
  template?: {
    id: string;
    name: string;
    category: string;
  };
}

export interface WorkoutExercise {
  id: string;
  workoutId: string;
  exerciseId: string;
  exercise: {
    id: string;
    name: string;
    category: string;
  };
  sets: number;
  reps?: number;
  weight?: number;
  duration?: number;
  restTime?: number;
  order: number;
  notes?: string;
  distance?: number;
  calories?: number;
}

export async function getWorkouts(): Promise<WorkoutEntry[]> {
  const res = await client.get('/workouts')
  return res.data as WorkoutEntry[]
}

export async function addWorkout(workout: {
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
     distance?: number;
     calories?: number;
   }[];
}): Promise<WorkoutEntry> {
  const res = await client.post('/workouts', workout)
  return res.data as WorkoutEntry
}

export async function deleteWorkout(id: string): Promise<void> {
  await client.delete(`/workouts/${id}`)
}
