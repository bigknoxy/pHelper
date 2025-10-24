import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import {
  getEnhancedWorkoutAnalytics,
  getExerciseAnalytics,
  getProgressAnalytics,
  getConsistencyAnalytics
} from '../controllers/analyticsController'

const router = Router()

router.use(requireAuth)
router.get('/enhanced-workouts', getEnhancedWorkoutAnalytics)
router.get('/exercises', getExerciseAnalytics)
router.get('/progress', getProgressAnalytics)
router.get('/consistency', getConsistencyAnalytics)

export default router