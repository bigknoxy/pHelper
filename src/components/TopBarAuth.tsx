import { useAuth } from '../context/AuthContext'

export default function TopBarAuth() {
  const { userId, logout } = useAuth()

  if (userId) {
    return (
      <div>
        <span>{userId}</span>
        <button onClick={logout}>Logout</button>
      </div>
    )
  }

  return (
    <div>
      <a href="/login">Login</a>
      {' | '}
      <a href="/register">Register</a>
    </div>
  )
}
