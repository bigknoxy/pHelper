import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

export default function RegisterForm() {
  const { register } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await register(email, password, true)
    } catch (err) {
      const e = err as Error
      setError((e && e.message) || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} aria-label="register-form">
      {error && <div role="alert" style={{ color: 'red' }}>{error}</div>}
      <div>
        <label htmlFor="reg-email">Email</label>
        <input id="reg-email" value={email} onChange={e => setEmail(e.target.value)} type="email" aria-label="email" />
      </div>
      <div>
        <label htmlFor="reg-password">Password</label>
        <input id="reg-password" value={password} onChange={e => setPassword(e.target.value)} type="password" aria-label="password" />
      </div>
      <div>
        <button type="submit" aria-label="register button" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
      </div>
      <div style={{ marginTop: 8 }}>
        <a href="/login">Already have an account? Login</a>
      </div>
    </form>
  )
}
