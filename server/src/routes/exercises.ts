import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import {
  getExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
  getExerciseCategories,
  getMuscleGroups
} from '../controllers/exerciseController'

const router = Router()

// Public routes (no auth required for browsing exercises)
router.get('/', getExercises)
router.get('/categories', getExerciseCategories)
router.get('/muscle-groups', getMuscleGroups)
router.get('/:id', getExerciseById)

// Protected routes (auth required for creating/updating/deleting)
router.use(requireAuth)
router.post('/', createExercise)
router.put('/:id', updateExercise)
router.delete('/:id', deleteExercise)

export default router