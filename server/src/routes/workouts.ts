import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { getWorkouts, addWorkout, deleteWorkout } from '../controllers/workoutController'

const router = Router()
router.use(requireAuth)
router.get('/', getWorkouts)
router.post('/', addWorkout)
router.delete('/:id', deleteWorkout)
export default router
