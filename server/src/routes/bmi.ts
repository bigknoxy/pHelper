import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { calculateBMI } from '../controllers/bmiController'

const router = Router()
router.use(requireAuth)
router.post('/', calculateBMI)
export default router