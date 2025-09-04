import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { getTasks, addTask, deleteTask } from '../controllers/taskController'

const router = Router()
router.use(requireAuth)
router.get('/', getTasks)
router.post('/', addTask)
router.delete('/:id', deleteTask)
export default router
