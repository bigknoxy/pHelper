import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import {
  getPersonalRecords,
  getPersonalRecordById,
  getPersonalRecordStats,
  deletePersonalRecord
} from '../controllers/personalRecordController'

const router = Router()

router.use(requireAuth)
router.get('/', getPersonalRecords)
router.get('/stats', getPersonalRecordStats)
router.get('/:id', getPersonalRecordById)
router.delete('/:id', deletePersonalRecord)

export default router