import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import {
  getBodyCompositions,
  createBodyComposition,
  updateBodyComposition,
  deleteBodyComposition
} from '../controllers/bodyCompositionController'

const router = Router()
router.use(requireAuth)
router.get('/', getBodyCompositions)
router.post('/', createBodyComposition)
router.put('/:id', updateBodyComposition)
router.delete('/:id', deleteBodyComposition)
export default router