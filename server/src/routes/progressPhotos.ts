import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import {
  getProgressPhotos,
  createProgressPhoto,
  updateProgressPhoto,
  deleteProgressPhoto
} from '../controllers/progressPhotosController'

const router = Router()
router.use(requireAuth)
router.get('/', getProgressPhotos)
router.post('/', createProgressPhoto)
router.put('/:id', updateProgressPhoto)
router.delete('/:id', deleteProgressPhoto)
export default router