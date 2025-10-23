import client from './client'

export interface BMIResult {
  bmi: number
  category: string
}

export async function calculateBMI(weight: number, height: number): Promise<BMIResult> {
  const res = await client.post('/bmi', { weight, height })
  return res.data as BMIResult
}