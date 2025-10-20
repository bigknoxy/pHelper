/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { setToken as tokenSet, getToken as tokenGet, clearToken } from '../api/token'
import { login as apiLogin, register as apiRegister } from '../api/auth'
import { addTask } from '../api/tasks'
import { addWeight } from '../api/weights'
import { addWorkout } from '../api/workouts'
import { safeGet, safeSet } from '../utils/storage'

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
    try {
      const t = tokenGet()
      if (t) {
        setTokenState(t)
        setUserId('me')
      }
    } catch {
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
    } catch (err) {
      void err
      setError('Migration failed')
    } finally {
      setLoading(false)
    }
  }

  async function login(email: string, password: string, remember = false) {
    setLoading(true)
    setError(null)
    try {
      const res = await apiLogin(email, password)
      const jwt = (res as { token?: string })?.token
      tokenSet(jwt, remember)
      setTokenState(jwt)
      setUserId('me')
      if (!safeGet('migrationComplete')) {
        if (window.confirm('Import your local data to the backend?')) {
          await migrateLocalData()
        }
      }
    } catch (err: unknown) {
      let message = 'Login failed'
      if (typeof err === 'object' && err !== null) {
        const maybe = err as { response?: { data?: { error?: string } } }
        message = maybe.response?.data?.error || message
      }
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  async function register(email: string, password: string, remember = false) {
    setLoading(true)
    setError(null)
    try {
      const res = await apiRegister(email, password)
      const jwt = (res as { token?: string })?.token
      tokenSet(jwt, remember)
      setTokenState(jwt)
      setUserId('me')
      if (!safeGet('migrationComplete')) {
        if (window.confirm('Import your local data to the backend?')) {
          await migrateLocalData()
        }
      }
    } catch (err: unknown) {
      let message = 'Registration failed'
      if (typeof err === 'object' && err !== null) {
        const maybe = err as { response?: { data?: { error?: string } } }
        message = maybe.response?.data?.error || message
      }
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    try {
      tokenSet(null, false)
      clearToken()
    } catch {
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
