import client from './client'

export interface WeightEntry {
  id: string;
  userId: string;
  date: string;
  weight: number;
  note?: string;
}

export async function getWeights(): Promise<WeightEntry[]> {
  const res = await client.get('/weights')
  return res.data as WeightEntry[]
}

export async function addWeight(weight: number, date: string, note?: string): Promise<WeightEntry> {
  const res = await client.post('/weights', { weight, date, note })
  return res.data as WeightEntry
}

export async function deleteWeight(id: string): Promise<void> {
  await client.delete(`/weights/${id}`)
}
