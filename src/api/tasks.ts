import client from './client'

export interface Task {
  id: string;
  title: string;
  description?: string;
  status?: string;
  dueDate?: string;
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
