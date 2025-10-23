import { Request, Response } from 'express'
import { z } from 'zod'

const bmiSchema = z.object({
  weight: z.number(), // in pounds
  height: z.number()  // in inches
})

export async function calculateBMI(req: Request, res: Response) {
  const parse = bmiSchema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.issues })
  const { weight, height } = parse.data

  // Convert pounds to kg and inches to meters
  const weightKg = weight * 0.453592
  const heightM = height * 0.0254

  const bmi = weightKg / (heightM * heightM)

  // Determine category
  let category: string
  if (bmi < 18.5) category = 'Underweight'
  else if (bmi < 25) category = 'Normal weight'
  else if (bmi < 30) category = 'Overweight'
  else category = 'Obese'

  res.json({ bmi: Math.round(bmi * 100) / 100, category })
}