import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import {
  getWeightGoals,
  createWeightGoal,
  updateWeightGoal,
  deleteWeightGoal
} from '../controllers/weightGoalsController'

const router = Router()
router.use(requireAuth)
router.get('/', getWeightGoals)
router.post('/', createWeightGoal)
router.put('/:id', updateWeightGoal)
router.delete('/:id', deleteWeightGoal)
export default router