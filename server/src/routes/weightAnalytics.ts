import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { getWeightTrends, getWeightVariance } from '../controllers/weightAnalyticsController'

const router = Router()
router.use(requireAuth)
router.get('/trends', getWeightTrends)
router.get('/variance', getWeightVariance)
export default router