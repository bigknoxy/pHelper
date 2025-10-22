import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import {
  getWeightAnalytics,
  getWorkoutAnalytics,
  getTaskAnalytics,
  getDashboardOverview,
  getGoalAnalytics
} from '../controllers/analyticsController'

const router = Router()
router.use(requireAuth)

router.get('/weights', getWeightAnalytics)
router.get('/workouts', getWorkoutAnalytics)
router.get('/tasks', getTaskAnalytics)
router.get('/goals', getGoalAnalytics)
router.get('/overview', getDashboardOverview)

export default router