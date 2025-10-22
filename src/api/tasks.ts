import client from './client'

export interface Task {
  id: string;
  title: string;
  description?: string;
  status?: string;
  dueDate?: string;
  // timestamp when the task was created (optional)
  createdAt?: string;
  // UI-only flag for completion state in frontend components
  completed?: boolean;
}

export async function getTasks(): Promise<Task[]> {
  const res = await client.get('/tasks')
  return res.data as Task[]
}

export async function addTask(title: string, description?: string, status?: string, dueDate?: string): Promise<Task> {
  const res = await client.post('/tasks', { title, description, status, dueDate })
  return res.data as Task
}

export async function deleteTask(id: string): Promise<void> {
  await client.delete(`/tasks/${id}`)
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  const res = await client.patch(`/tasks/${id}`, updates)
  return res.data as Task
}
