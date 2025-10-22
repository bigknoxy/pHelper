import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
 import {
   getGoals,
   createGoal,
   updateGoal,
   deleteGoal
 } from '../controllers/goalsController'

const router = Router()
router.use(requireAuth)

router.get('/', getGoals)
router.post('/', createGoal)
router.put('/:id', updateGoal)
router.delete('/:id', deleteGoal)

export default router