import { PrismaClient } from '@prisma/client'

// During tests we don't want to instantiate a real PrismaClient (which requires DATABASE_URL).
// Export a minimal in-memory mock implementation for the most commonly used model methods so tests can run.
const isTest = typeof process !== 'undefined' && (process.env.JEST_WORKER_ID !== undefined || process.env.NODE_ENV === 'test')

// Simple in-memory DB per model
type RecordMap = { [id: string]: unknown }
const db: Record<string, RecordMap> = {
  user: {},
  task: {},
  workout: {},
  weightEntry: {},
  goal: {},
  exercise: {},
  workoutTemplate: {},
  workoutTemplateExercise: {},
  workoutExercise: {},
  personalRecord: {},
  weightGoal: {},
  weightMilestone: {},
  progressPhoto: {},
  bodyComposition: {},
}
let idCounter = 1
const genId = () => `mock-${idCounter++}`

const matchWhere = (rec: Record<string, unknown>, where: Record<string, unknown> | undefined) => {
  if (!where) return true
  // where may be { userId } or { id } or { email }
  for (const key of Object.keys(where)) {
    if ((rec as Record<string, unknown>)[key] !== (where as Record<string, unknown>)[key]) return false
  }
  return true
}

const makeModel = (name: string) => ({
  findMany: async (args?: { where?: Record<string, unknown> } | undefined) => {
    const all = Object.values(db[name])
    if (!args || !args.where) return all
    return all.filter((r) => matchWhere(r as Record<string, unknown>, args.where))
  },
  create: async (params?: { data?: Record<string, unknown> } | undefined) => {
    const data = params && params.data ? params.data : {}
    const id = typeof (data as Record<string, unknown>).id === 'string' ? (data as Record<string, unknown>).id as string : genId()
    const now = new Date()
    const rec = { id, ...data, createdAt: now.toISOString() }
    db[name][id] = rec
    return rec
  },
  createMany: async (params?: { data: Record<string, unknown>[] } | undefined) => {
    const created = []
    for (const data of params?.data || []) {
      const id = typeof (data as Record<string, unknown>).id === 'string' ? (data as Record<string, unknown>).id as string : genId()
      const now = new Date()
      const rec = { id, ...data, createdAt: now.toISOString() }
      db[name][id] = rec
      created.push(rec)
    }
    return { count: created.length }
  },
  findUnique: async (args?: { where?: Record<string, unknown> } | undefined) => {
    if (!args || !args.where) return null
    const where = args.where as Record<string, unknown>
    if ('id' in where && typeof where.id === 'string') return db[name][where.id] || null
    // search by other unique fields (email)
    const all = Object.values(db[name])
    return all.find((r) => matchWhere(r as Record<string, unknown>, where)) || null
  },
  findFirst: async (args?: { where?: Record<string, unknown> } | undefined) => {
    const all = Object.values(db[name])
    if (!args || !args.where) return (all[0] as Record<string, unknown>) || null
    return all.find((r) => matchWhere(r as Record<string, unknown>, args.where)) || null
  },
  delete: async (args?: { where?: Record<string, unknown> } | undefined) => {
    const where = args && args.where ? args.where : {}
    if ('id' in where && typeof where.id === 'string' && db[name][where.id]) {
      const rec = db[name][where.id]
      delete db[name][where.id]
      return rec
    }
    // fallback: find first matching and delete
    const all = Object.values(db[name])
    const idxRec = all.find((r) => matchWhere(r as Record<string, unknown>, where))
    if (idxRec) {
      const id = (idxRec as Record<string, unknown>).id as string
      delete db[name][id]
      return idxRec
    }
    // mimic Prisma behaviour by throwing if not found
    throw new Error('Record to delete does not exist')
  },
  deleteMany: async (args?: { where?: Record<string, unknown> } | undefined) => {
    const all = Object.values(db[name])
    const toDelete = args && args.where ? all.filter((r) => matchWhere(r as Record<string, unknown>, args.where)) : all
    toDelete.forEach((rec) => {
      const id = (rec as Record<string, unknown>).id as string
      delete db[name][id]
    })
    return { count: toDelete.length }
  },
  count: async (args?: { where?: Record<string, unknown> } | undefined) => {
    const all = Object.values(db[name])
    const filtered = args && args.where ? all.filter((r) => matchWhere(r as Record<string, unknown>, args.where)) : all
    return filtered.length
  },
  update: async (params?: { where?: Record<string, unknown>; data?: Record<string, unknown> } | undefined) => {
    const where = params && params.where ? params.where : {}
    const data = params && params.data ? params.data : {}
    const rec = await (async () => {
      if ('id' in where && typeof where.id === 'string') return db[name][where.id]
      const all = Object.values(db[name])
      return all.find((r) => matchWhere(r as Record<string, unknown>, where))
    })()
    if (!rec) throw new Error('Record to update does not exist')
    const updated = { ...rec, ...data } as Record<string, unknown>
    const updatedId = (updated.id as unknown) as string
    db[name][updatedId] = updated
    return updated
  },
})

const mockPrisma: Record<string, unknown> = {
  user: makeModel('user'),
  workout: makeModel('workout'),
  task: makeModel('task'),
  weightEntry: makeModel('weightEntry'),
  goal: makeModel('goal'),
  exercise: makeModel('exercise'),
  workoutTemplate: makeModel('workoutTemplate'),
  workoutTemplateExercise: makeModel('workoutTemplateExercise'),
  workoutExercise: makeModel('workoutExercise'),
  personalRecord: makeModel('personalRecord'),
  weightGoal: makeModel('weightGoal'),
  weightMilestone: makeModel('weightMilestone'),
  progressPhoto: makeModel('progressPhoto'),
  bodyComposition: makeModel('bodyComposition'),
  $connect: async () => {},
  $disconnect: async () => {},
}

const prisma: PrismaClient | Record<string, unknown> = isTest ? mockPrisma : new PrismaClient()

export default prisma
