import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { setToken as tokenSet, getToken as tokenGet, clearToken } from '../api/token'
import { login as apiLogin, register as apiRegister } from '../api/auth'
import { addTask } from '../api/tasks'
import { addWeight } from '../api/weights'
import { addWorkout } from '../api/workouts'
import { safeGet, safeSet, safeRemove } from '../utils/storage'

interface AuthState {
  userId: string | null
  token: string | null
  loading: boolean
  error: string | null
  migrated: boolean
}

interface AuthContextType extends AuthState {
  // accept remember flag to control token persistence
  login: (email: string, password: string, remember?: boolean) => Promise<void>
  register: (email: string, password: string, remember?: boolean) => Promise<void>
  logout: () => void
}

// Use undefined as default so useAuth can throw when used outside provider
export const AuthContext = createContext<AuthContextType | undefined>(undefined)

function getLocalData() {
  const tasks = JSON.parse(safeGet('tasks') || '[]')
  const weights = JSON.parse(safeGet('weightEntries') || '[]')
  const workouts = JSON.parse(safeGet('workoutEntries') || '[]')
  return { tasks, weights, workouts }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null)
  const [tokenState, setTokenState] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [migrated, setMigrated] = useState<boolean>(safeGet('migrationComplete') === 'true')

  useEffect(() => {
    // Initialize token from token helper (which may read from memory or localStorage)
    try {
      const t = tokenGet()
      if (t) {
        setTokenState(t)
        // For now we don't decode userId from token; set a placeholder
        setUserId('me')
      }
    } catch (e) {
      // ignore
    }
  }, [])

  async function migrateLocalData() {
    const { tasks, weights, workouts } = getLocalData()
    setLoading(true)
    try {
      for (const t of tasks) {
        await addTask(t.title, t.description)
      }
      for (const w of weights) {
        await addWeight(w.weight, w.date, w.note)
      }
      for (const wo of workouts) {
        await addWorkout(wo.type, wo.duration, wo.date, wo.notes)
      }
      safeSet('migrationComplete', 'true')
      setMigrated(true)
    } catch (e) {
      setError('Migration failed')
    } finally {
      setLoading(false)
    }
  }

  async function login(email: string, password: string, remember = false) {
    setLoading(true)
    setError(null)
    try {
      const res: any = await apiLogin(email, password)
      const jwt = res.token
      // persist token according to remember flag
      tokenSet(jwt, remember)
      setTokenState(jwt)
      setUserId('me')
      // Prompt for migration if needed
      if (!safeGet('migrationComplete')) {
        // Use a modal in the future; for now keep the confirmation but ensure token is set before migrating
        if (window.confirm('Import your local data to the backend?')) {
          await migrateLocalData()
        }
      }
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Login failed')
      // rethrow so callers can react if they want
      throw e
    } finally {
      setLoading(false)
    }
  }

  async function register(email: string, password: string, remember = false) {
    setLoading(true)
    setError(null)
    try {
      const res: any = await apiRegister(email, password)
      const jwt = res.token
      tokenSet(jwt, remember)
      setTokenState(jwt)
      setUserId('me')
      if (!safeGet('migrationComplete')) {
        if (window.confirm('Import your local data to the backend?')) {
          await migrateLocalData()
        }
      }
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Registration failed')
      throw e
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    try {
      // clear both memory and persisted token
      tokenSet(null, false)
      clearToken()
    } catch (e) {
      // ignore
    }
    setTokenState(null)
    setUserId(null)
  }

  return (
    <AuthContext.Provider value={{ userId, token: tokenState, loading, error, migrated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
