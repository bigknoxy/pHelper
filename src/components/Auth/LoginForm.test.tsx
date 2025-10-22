import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { act } from 'react'
import LoginForm from './LoginForm'
import { AuthContext } from '../../context/AuthContext'
import { ChakraProvider } from '@chakra-ui/react'
import theme from '../../theme'

const mockLogin = jest.fn()

function renderWithAuth() {
  return render(
    <AuthContext.Provider value={{ userId: null, token: null, loading: false, error: null, migrated: false, login: mockLogin, register: jest.fn(), logout: jest.fn() }}>
      <ChakraProvider value={theme}>
        <LoginForm />
      </ChakraProvider>
    </AuthContext.Provider>
  )
}

afterEach(() => {
  jest.clearAllMocks()
})

test('renders login form and submits', async () => {
  mockLogin.mockResolvedValueOnce(undefined)
  renderWithAuth()
  const email = screen.getByLabelText(/email/i)
  const password = screen.getByLabelText(/^password$/i)
  const checkbox = screen.getByLabelText(/remember me/i)
  const button = screen.getByRole('button', { name: /sign in/i })

  fireEvent.change(email, { target: { value: 'test@example.com' } })
  fireEvent.change(password, { target: { value: 'secret123' } })

  await act(async () => {
    fireEvent.click(checkbox)
    fireEvent.click(button)
  })

  await waitFor(() => expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'secret123', true))
})

test('password visibility toggle works', async () => {
  renderWithAuth()
  const password = screen.getByLabelText(/^password$/i) as HTMLInputElement
  const toggle = screen.getByRole('button', { name: /show password/i })

  // initially password type should be password
  expect(password.type).toBe('password')

  fireEvent.click(toggle)
  expect(password.type).toBe('text')

  // toggle back
  const hide = screen.getByRole('button', { name: /hide password/i })
  fireEvent.click(hide)
  expect(password.type).toBe('password')
})

test('shows inline validation messages and real-time validation', async () => {
  renderWithAuth()
  const button = screen.getByRole('button', { name: /sign in/i })
  await act(async () => {
    fireEvent.click(button)
  })

  expect(await screen.findByText(/email is required/i)).toBeInTheDocument()
  expect(await screen.findByText(/password is required/i)).toBeInTheDocument()

  // Real-time: type invalid email
  const email = screen.getByLabelText(/email/i)
  fireEvent.change(email, { target: { value: 'invalid-email' } })
  expect(await screen.findByText(/please enter a valid email address/i)).toBeInTheDocument()

  // Fix email
  fireEvent.change(email, { target: { value: 'ok@example.com' } })
  await waitFor(() => expect(screen.queryByText(/please enter a valid email address/i)).not.toBeInTheDocument())
})

test('shows security indicator and accessibility attributes and focus management', () => {
  renderWithAuth()
  expect(screen.getByText(/secure, encrypted connection/i)).toBeInTheDocument()
  const form = screen.getByRole('form', { name: /login-form/i })
  expect(form).toBeInTheDocument()
  const email = screen.getByLabelText(/email/i)
  expect(email).toHaveAttribute('aria-label', 'email')
  // Email should be focused on mount
  expect(document.activeElement).toBe(email)
})

test('shows error message when login fails', async () => {
  mockLogin.mockRejectedValueOnce(new Error('401 Unauthorized'))
  renderWithAuth()

  const email = screen.getByLabelText(/email/i)
  const password = screen.getByLabelText(/^password$/i)
  const button = screen.getByRole('button', { name: /sign in/i })

  fireEvent.change(email, { target: { value: 'a@b.com' } })
  fireEvent.change(password, { target: { value: 'wrongpass' } })

  await act(async () => {
    fireEvent.click(button)
  })

  expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument()
})

test('loading state disables inputs and shows loading', async () => {
  // make login resolve after a short delay so loading state is set
  mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(undefined), 50)))
  renderWithAuth()

  const email = screen.getByLabelText(/email/i)
  const password = screen.getByLabelText(/^password$/i)
  const button = screen.getByRole('button', { name: /sign in/i })

  fireEvent.change(email, { target: { value: 'a@b.com' } })
  fireEvent.change(password, { target: { value: 'secret123' } })

  await act(async () => {
    fireEvent.click(button)
  })

  expect(button).toBeDisabled()
  expect(email).toBeDisabled()
  expect(password).toBeDisabled()

  await waitFor(() => expect(mockLogin).toHaveBeenCalled())
})
