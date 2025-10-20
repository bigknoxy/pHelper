import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { getWeights, addWeight, deleteWeight } from '../controllers/weightController'

const router = Router()
router.use(requireAuth)
router.get('/', getWeights)
router.post('/', addWeight)
router.delete('/:id', deleteWeight)
export default router
