import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import {
  getWorkoutTemplates,
  getWorkoutTemplateById,
  createWorkoutTemplate,
  updateWorkoutTemplate,
  deleteWorkoutTemplate,
  getWorkoutTemplateCategories
} from '../controllers/workoutTemplateController'

const router = Router()

// Public routes (for browsing public templates)
router.get('/', getWorkoutTemplates)
router.get('/categories', getWorkoutTemplateCategories)
router.get('/:id', getWorkoutTemplateById)

// Protected routes (auth required for creating/updating/deleting)
router.use(requireAuth)
router.post('/', createWorkoutTemplate)
router.put('/:id', updateWorkoutTemplate)
router.delete('/:id', deleteWorkoutTemplate)

export default router