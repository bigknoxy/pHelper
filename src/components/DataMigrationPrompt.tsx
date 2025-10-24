import { useState } from 'react'
import { safeGet } from '../utils/storage'
import { addTask } from '../api/tasks'
import { addWeight } from '../api/weights'
import { addWorkout } from '../api/workouts'

interface LocalItem {
  id?: string
  title?: string
  date?: string
  [key: string]: unknown
}

export default function DataMigrationPrompt() {
  const [conflicts, setConflicts] = useState<LocalItem[]>([])

  function getLocalData() {
    const tasks = JSON.parse(safeGet('tasks') || '[]')
    const weights = JSON.parse(safeGet('weightEntries') || '[]')
    const workouts = JSON.parse(safeGet('workoutEntries') || '[]')
    return { tasks, weights, workouts }
  }

  function exportBackup() {
    const data = getLocalData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'phelper-backup.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  async function doMigrate() {
    const { tasks, weights, workouts } = getLocalData()
    const foundConflicts: LocalItem[] = []
    // simple conflict detection: duplicate title/date
    const seen = new Set<string>()
    for (const t of tasks) {
      const key = `task:${t.title}`
      if (seen.has(key)) {
        foundConflicts.push(t)
      } else {
        seen.add(key)
        await addTask(t.title, t.description)
      }
    }
    for (const w of weights) {
      const key = `weight:${w.date}`
      if (seen.has(key)) {
        foundConflicts.push(w)
      } else {
        seen.add(key)
        await addWeight(w.weight, w.date, w.note)
      }
    }
    for (const wo of workouts) {
      const key = `workout:${wo.date}`
      if (seen.has(key)) {
        foundConflicts.push(wo)
      } else {
        seen.add(key)
        await addWorkout({ type: wo.type, duration: wo.duration, date: wo.date, notes: wo.notes })
      }
    }
    setConflicts(foundConflicts)
  }

  return (
    <div>
      <h3>Data Migration</h3>
      <p>Import your local items to the server. A backup will be created before migration.</p>
      <button onClick={exportBackup}>Download Backup</button>
      <button onClick={doMigrate}>Migrate Now</button>
      {conflicts.length > 0 && (
        <div>
          <h4>Conflicts</h4>
          <ul>
            {conflicts.map((c, i) => (
              <li key={i}>{c.title || c.date || 'item'}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
