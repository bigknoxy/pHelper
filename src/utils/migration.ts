import { safeGet, safeSet } from './storage'

export function loadLocalData() {
  const tasks = JSON.parse(safeGet('tasks') || '[]') as Array<Record<string, unknown>>
  const weights = JSON.parse(safeGet('weightEntries') || '[]') as Array<Record<string, unknown>>
  const workouts = JSON.parse(safeGet('workoutEntries') || '[]') as Array<Record<string, unknown>>
  return { tasks, weights, workouts }
}

export function backupData() {
  const data = loadLocalData()
  safeSet('migration_backup', JSON.stringify(data))
  return data
}

export function detectConflicts(itemsA: Array<Record<string, unknown>>, itemsB: Array<Record<string, unknown>>, key: string) {
  const set = new Set(itemsB.map(i => (i as Record<string, unknown>)[key]))
  return itemsA.filter(i => set.has((i as Record<string, unknown>)[key]))
}
