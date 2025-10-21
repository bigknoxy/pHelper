import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

export default function LoginForm() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password, remember)
    } catch (err) {
      const e = err as Error
      setError((e && e.message) || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} aria-label="login-form">
      {error && <div role="alert" style={{ color: 'red' }}>{error}</div>}
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" value={email} onChange={e => setEmail(e.target.value)} type="email" aria-label="email" />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input id="password" value={password} onChange={e => setPassword(e.target.value)} type="password" aria-label="password" />
      </div>
      <div>
        <label>
          <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} aria-label="remember me" /> Remember me
        </label>
      </div>
      <div>
        <button type="submit">{loading ? 'Logging in...' : 'Log in'}</button>
      </div>
      <div style={{ marginTop: 8 }}>
        <a href="/register">Don't have an account? Register</a>
      </div>
    </form>
  )
}
