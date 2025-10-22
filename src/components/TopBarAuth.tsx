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
    // When not authenticated we no longer show login/register links because the
    // app will render the login form by default. Keep TopBar minimal.
    <div />
  )
}
