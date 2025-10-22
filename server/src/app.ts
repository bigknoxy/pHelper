import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

app.use(express.json())
const allowedOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173'
app.use(cors({ origin: allowedOrigin, credentials: true }))
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'", allowedOrigin],
      scriptSrc: ["'self'", allowedOrigin],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
}))
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  res.setHeader('X-Frame-Options', 'DENY')
  next()
})
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
import goalRoutes from './routes/goals'
import analyticsRoutes from './routes/analytics'

app.use('/api/weights', weightRoutes)
app.use('/api/workouts', workoutRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/goals', goalRoutes)
app.use('/api/analytics', analyticsRoutes)

import { errorHandler } from './middleware/errorHandler'
app.use(errorHandler)

export default app
