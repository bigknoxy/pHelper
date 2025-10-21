import { render, screen, fireEvent, waitFor } from '../../test-utils/customRender'
import { act } from 'react'
import RegisterForm from './RegisterForm'
import { AuthContext } from '../../context/AuthContext'

const mockRegister = jest.fn()

function renderWithAuth() {
  return render(
    <AuthContext.Provider value={{ userId: null, token: null, loading: false, error: null, migrated: false, login: jest.fn(), register: mockRegister, logout: jest.fn() }}>
      <RegisterForm />
    </AuthContext.Provider>
  )
}

test('renders register form and submits', async () => {
  renderWithAuth()
  const email = screen.getByLabelText(/email/i)
  const password = screen.getByLabelText(/^password$/i)
  const confirm = screen.getByLabelText(/confirm password/i)
  const button = screen.getByRole('button', { name: /create account|register/i })

  fireEvent.change(email, { target: { value: 'new@example.com' } })
  fireEvent.change(password, { target: { value: 'Newpass1!' } })
  fireEvent.change(confirm, { target: { value: 'Newpass1!' } })

  await act(async () => {
    fireEvent.click(button)
  })

  await waitFor(() => expect(mockRegister).toHaveBeenCalledWith('new@example.com', 'Newpass1!', true))
})

test('shows strength indicator and criteria updates', async () => {
  renderWithAuth()
  const password = screen.getByLabelText(/^password$/i)

  fireEvent.change(password, { target: { value: 'weak' } })
  expect(screen.getByText(/password strength/i)).toBeInTheDocument()
  expect(screen.getByText(/weak/i)).toBeInTheDocument()

  fireEvent.change(password, { target: { value: 'Better1!' } })
  await waitFor(() => expect(screen.getByText(/strong|good|fair/i)).toBeInTheDocument())
})

test('confirm password validation shows error', async () => {
  renderWithAuth()
  const password = screen.getByLabelText(/^password$/i)
  const confirm = screen.getByLabelText(/confirm password/i)

  fireEvent.change(password, { target: { value: 'Newpass1!' } })
  fireEvent.change(confirm, { target: { value: 'mismatch' } })

  expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument()
})
