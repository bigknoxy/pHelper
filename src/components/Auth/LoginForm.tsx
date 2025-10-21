import React, { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  Box,
  Stack,
  HStack,
  Input,
  Button,
  Link,
  Text,
  Heading,
} from '@chakra-ui/react'

interface FormErrors {
  email?: string
  password?: string
}

/**
 * Sanitize a simple text input on the client-side to remove control characters
 * and trim whitespace. This is a lightweight protection - server-side
 * validation and sanitization must still be enforced.
 */
function sanitizeInput(value: string) {
  return value.replace(/[^\S\r\n\t\u0020-\u007E@.\-_+]/g, '').trim()
}

/**
 * Compute a simple password strength label. Lightweight, dependency-free.
 */
function passwordStrengthLabel(pwd: string): string {
  if (!pwd) return 'Too short'
  let score = 0
  if (pwd.length >= 8) score++
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  return score <= 1 ? 'Weak' : score === 2 ? 'Fair' : score === 3 ? 'Good' : 'Strong'
}

/**
 * LoginForm - improved UX/UI and accessibility
 * - Uses Chakra UI components and app theme
 * - Real-time validation with inline messages
 * - Password visibility toggle
 * - Loading states and user-friendly error messages
 * - Accessibility: aria attributes + focus management
 */
export default function LoginForm(): React.ReactElement {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)

  const emailRef = useRef<HTMLInputElement | null>(null)
  const passwordRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    emailRef.current?.focus()
  }, [])

  const validateEmail = (value: string): string | null => {
    const v = value.trim()
    if (!v) return 'Email is required'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(v)) return 'Please enter a valid email address'
    return null
  }

  const validatePassword = (value: string): string | null => {
    if (!value) return 'Password is required'
    if (value.length < 6) return 'Password must be at least 6 characters'
    return null
  }

  const validateForm = (): boolean => {
    const errors: FormErrors = {}
    const e = validateEmail(email)
    if (e) errors.email = e
    const p = validatePassword(password)
    if (p) errors.password = p
    setFieldErrors(errors)
    if (errors.email) {
      emailRef.current?.focus()
    } else if (errors.password) {
      passwordRef.current?.focus()
    }
    return Object.keys(errors).length === 0
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeInput(e.target.value)
    setEmail(sanitized)
    // real-time validation: show error only if text present and invalid
    const err = validateEmail(sanitized)
    if (sanitized === '') {
      setFieldErrors(prev => ({ ...prev, email: undefined }))
    } else if (err) {
      setFieldErrors(prev => ({ ...prev, email: err }))
    } else if (fieldErrors.email) {
      setFieldErrors(prev => ({ ...prev, email: undefined }))
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: undefined }))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) return

    setLoading(true)
    try {
      await login(email, password, remember)
    } catch (err) {
      const ex = err as Error
      if (ex.message && (ex.message.includes('credentials') || ex.message.includes('401'))) {
        setError('Invalid email or password. Please try again.')
      } else if (ex.message && (ex.message.toLowerCase().includes('network') || ex.message.includes('fetch'))) {
        setError('Network error. Please check your connection and try again.')
      } else {
        setError('An unexpected error occurred. Please try again later.')
      }
    } finally {
      setLoading(false)
    }
  }

  const pwdLabel = passwordStrengthLabel(password)

  return (
    <Box
      minH="100vh"
      bg="#18181b"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={{ base: 4, sm: 6, md: 8 }}
    >
      <Box
        w="full"
        maxW={{ base: 'sm', sm: 'md' }}
        bg="#23232a"
        rounded="xl"
        shadow="xl"
        p={{ base: 6, sm: 8 }}
        border="1px solid"
        borderColor="gray.700"
      >
        <Stack gap={6} align="stretch">
          <Stack gap={2} textAlign="center">
            <Heading size={{ base: 'md', sm: 'lg' }} color="white">
              Welcome Back
            </Heading>
            <Text color="gray.400" fontSize={{ base: 'xs', sm: 'sm' }}>
              Sign in to your fitness tracking account
            </Text>
          </Stack>

          <HStack gap={2} justify="center">
            <Text color="#0bc5ea" fontSize="xs" aria-hidden>
              🔒
            </Text>
            <Text color="gray.400" fontSize="xs">
              Secure, encrypted connection
            </Text>
          </HStack>

          <form onSubmit={onSubmit} noValidate aria-label="login-form">
            <Stack gap={4}>
              {error && (
                <Box
                  bg="red.900"
                  color="red.100"
                  p={3}
                  borderRadius="md"
                  role="alert"
                  aria-live="polite"
                  border="1px solid"
                  borderColor="red.700"
                >
                  <Text fontSize="sm" fontWeight="medium">Error</Text>
                  <Text fontSize="sm">{error}</Text>
                </Box>
              )}

              <Box>
                <label style={{ display: 'block', marginBottom: 4 }}>
                  <Text color="gray.300" fontSize="sm" fontWeight="medium">Email Address</Text>
                </label>
                <Input
                  ref={emailRef}
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  bg="#18181b"
                  border="1px solid"
                  borderColor={fieldErrors.email ? 'red.500' : 'gray.600'}
                  color="white"
                  _focus={{ borderColor: '#0bc5ea', boxShadow: '0 0 0 1px #0bc5ea' }}
                  _hover={{ borderColor: 'gray.500' }}
                  placeholder="Enter your email"
                  aria-label="email"
                  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                  aria-invalid={!!fieldErrors.email}
                  autoComplete="email"
                  disabled={loading}
                />
                {fieldErrors.email && (
                  <Text id="email-error" color="red.400" fontSize="xs" mt={1}>{fieldErrors.email}</Text>
                )}
              </Box>

              <Box>
                <label style={{ display: 'block', marginBottom: 4 }}>
                  <Text color="gray.300" fontSize="sm" fontWeight="medium">Password</Text>
                </label>
                <Box position="relative">
                  <Input
                    ref={passwordRef}
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={handlePasswordChange}
                    bg="#18181b"
                    border="1px solid"
                    borderColor={fieldErrors.password ? 'red.500' : 'gray.600'}
                    color="white"
                    _focus={{ borderColor: '#0bc5ea', boxShadow: '0 0 0 1px #0bc5ea' }}
                    _hover={{ borderColor: 'gray.500' }}
                    placeholder="Enter your password"
                    aria-label="password"
                    aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                    aria-invalid={!!fieldErrors.password}
                    autoComplete="current-password"
                    disabled={loading}
                    pr="40px"
                  />

                  <Button
                    position="absolute"
                    right="8px"
                    top="50%"
                    transform="translateY(-50%)"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    variant="ghost"
                    color="gray.400"
                    _hover={{ color: 'white' }}
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    size="sm"
                    p={1}
                    type="button"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </Button>
                </Box>
                {fieldErrors.password && (
                  <Text id="password-error" color="red.400" fontSize="xs" mt={1}>{fieldErrors.password}</Text>
                )}

                <Text color="gray.400" fontSize="xs" mt={2} aria-live="polite">Password strength: <Text as="span" color="white">{pwdLabel}</Text></Text>
              </Box>

              <HStack justify="space-between" w="full">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    aria-label="remember me"
                    disabled={loading}
                  />
                  <Text fontSize="sm" color="gray.300">Remember me</Text>
                </label>
                <Link color="#0bc5ea" fontSize="sm" href="/forgot-password" _hover={{ color: '#0dd5fa', textDecoration: 'underline' }}>
                  Forgot password?
                </Link>
              </HStack>

              <Button
                type="submit"
                w="full"
                bg="#0bc5ea"
                color="white"
                fontWeight="semibold"
                py={3}
                borderRadius="md"
                _hover={{
                  bg: '#0dd5fa',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(11, 197, 234, 0.3)'
                }}
                _active={{ transform: 'translateY(0)' }}
                transition="all 0.2s"
                loading={loading}
                loadingText="Signing in..."
                aria-busy={loading}
                disabled={loading}
              >
                Sign In
              </Button>
            </Stack>
          </form>

          <HStack justify="center" gap={1}>
            <Text color="gray.400" fontSize="sm">Don't have an account?</Text>
            <Link color="#0bc5ea" fontSize="sm" fontWeight="medium" href="/register" _hover={{ color: '#0dd5fa', textDecoration: 'underline' }}>Sign up</Link>
          </HStack>
        </Stack>
      </Box>
    </Box>
  )
}
