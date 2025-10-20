import { render, screen, fireEvent } from '@testing-library/react'
import LoginForm from './LoginForm'
import { AuthContext } from '../../context/AuthContext'

const mockLogin = jest.fn()

function renderWithAuth() {
  return render(
    <AuthContext.Provider value={{ userId: null, token: null, loading: false, error: null, migrated: false, login: mockLogin, register: jest.fn(), logout: jest.fn() }}>
      <LoginForm />
    </AuthContext.Provider>
  )
}

test('renders login form and submits', async () => {
  renderWithAuth()
  const email = screen.getByLabelText(/email/i)
  const password = screen.getByLabelText(/password/i)
  const checkbox = screen.getByLabelText(/remember me/i)
  const button = screen.getByRole('button', { name: /log in/i })

  fireEvent.change(email, { target: { value: 'test@example.com' } })
  fireEvent.change(password, { target: { value: 'secret' } })
  fireEvent.click(checkbox)
  fireEvent.click(button)

  // give state updates a tick
  await Promise.resolve()

  expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'secret', true)
})
