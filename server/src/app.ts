import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

app.use(express.json())
app.use(cors({ origin: true, credentials: true }))
app.use(helmet())
app.use(rateLimit({ windowMs: 60 * 1000, max: 100 }))

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Auth routes
import authRoutes from './routes/auth'
app.use('/api/auth', authRoutes)

// Tracker routes
import weightRoutes from './routes/weights'
import workoutRoutes from './routes/workouts'
import taskRoutes from './routes/tasks'

app.use('/api/weights', weightRoutes)
app.use('/api/workouts', workoutRoutes)
app.use('/api/tasks', taskRoutes)

import { errorHandler } from './middleware/errorHandler'
app.use(errorHandler)

export default app
