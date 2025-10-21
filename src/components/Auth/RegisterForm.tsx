import React, { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  Box,
  Stack,
  Input,
  Button,
  Link,
  Text,
  Heading,
  HStack,
  Spinner,
  useToken,
} from '@chakra-ui/react'

interface FormErrors {
  email?: string
  password?: string
  confirm?: string
}

function validateEmail(value: string): string | null {
  const v = value.trim()
  if (!v) return 'Email is required'
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(v)) return 'Please enter a valid email address'
  return null
}

function validatePassword(value: string): string | null {
  if (!value) return 'Password is required'
  if (value.length < 8) return 'Password must be at least 8 characters'
  return null
}

function passwordStrength(pwd: string): { score: number; label: string; criteria: Record<string, boolean> } {
  const criteria = {
    length: pwd.length >= 8,
    upperLower: /[A-Z]/.test(pwd) && /[a-z]/.test(pwd),
    number: /[0-9]/.test(pwd),
    special: /[^A-Za-z0-9]/.test(pwd),
  }
  let score = 0
  if (criteria.length) score++
  if (criteria.upperLower) score++
  if (criteria.number) score++
  if (criteria.special) score++
  const label = score <= 1 ? 'Weak' : score === 2 ? 'Fair' : score === 3 ? 'Good' : 'Strong'
  return { score, label, criteria }
}

export default function RegisterForm(): React.ReactElement {
  const { register } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)

  const emailRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    emailRef.current?.focus()
  }, [])

  // resolve tokens used in inline focus/boxShadow where concrete hex is required
  const [primary500Hex] = useToken('colors', ['primary.500'])

  const { score, label, criteria } = passwordStrength(password)

  function handleEmailChange(value: string) {
    setEmail(value)
    if (value.length === 0) {
      setFieldErrors(prev => ({ ...prev, email: 'Email is required' }))
    } else {
      const v = validateEmail(value)
      setFieldErrors(prev => ({ ...prev, email: v || undefined }))
    }
  }

  function handlePasswordChange(value: string) {
    setPassword(value)
    const v = validatePassword(value)
    setFieldErrors(prev => ({ ...prev, password: v || undefined }))
    if (confirm && value !== confirm) {
      setFieldErrors(prev => ({ ...prev, confirm: 'Passwords do not match' }))
    } else {
      setFieldErrors(prev => ({ ...prev, confirm: undefined }))
    }
  }

  function handleConfirmChange(value: string) {
    setConfirm(value)
    if (password !== value) {
      setFieldErrors(prev => ({ ...prev, confirm: 'Passwords do not match' }))
    } else {
      setFieldErrors(prev => ({ ...prev, confirm: undefined }))
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const errors: FormErrors = {}
    const eErr = validateEmail(email)
    if (eErr) errors.email = eErr
    const pErr = validatePassword(password)
    if (pErr) errors.password = pErr
    if (password !== confirm) errors.confirm = 'Passwords do not match'

    setFieldErrors(errors)
    if (Object.keys(errors).length) {
      if (errors.email) emailRef.current?.focus()
      return
    }

    setLoading(true)
    try {
      await register(email, password, true)
    } catch (err) {
      const ex = err as Error
      const msg = ex?.message?.toLowerCase() || ''
      if (msg.includes('already') || msg.includes('exists')) {
        setError('An account with this email already exists.')
      } else if (msg.includes('network') || msg.includes('fetch')) {
        setError('Network error. Please check your connection and try again.')
      } else {
        setError('Registration failed. Please try again later.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      minH="100vh"
      bg="background.900"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={{ base: 4, sm: 6, md: 8 }}
    >
      <Box
        w="full"
        maxW={{ base: 'sm', sm: 'md' }}
        bg="surface.900"
        rounded="xl"
        shadow="xl"
        p={{ base: 6, sm: 8 }}
        border="1px solid"
        borderColor="gray.700"
      >
        <Stack gap={6} align="stretch">
          <Stack gap={2} textAlign="center">
            <Heading size={{ base: 'md', sm: 'lg' }} color="white">Create account</Heading>
            <Text color="gray.400" fontSize={{ base: 'xs', sm: 'sm' }}>Sign up to start tracking your fitness journey</Text>
          </Stack>

          <HStack gap={2} justify="center">
            <Text color="green.400" fontSize="xs" aria-hidden>🔒</Text>
            <Text color="gray.400" fontSize="xs">Secure, encrypted connection</Text>
          </HStack>

          <form onSubmit={onSubmit} noValidate aria-label="register-form">
            <Stack gap={4}>
              {error && (
                <Box bg="red.900" color="red.100" p={3} borderRadius="md" role="alert" aria-live="polite" border="1px solid" borderColor="red.700">
                  <Text fontSize="sm" fontWeight="medium">Error</Text>
                  <Text fontSize="sm">{error}</Text>
                </Box>
              )}

              <Box>
                <label style={{ display: 'block', marginBottom: 4 }}>
                  <Text color="gray.300" fontSize="sm" fontWeight="medium">Email address</Text>
                </label>
                <Input
                  ref={emailRef}
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={e => handleEmailChange(e.target.value)}
                  bg="background.900"
                  border="1px solid"
                  borderColor={fieldErrors.email ? 'red.500' : 'gray.600'}
                  color="white"
                  _focus={{ borderColor: primary500Hex, boxShadow: `0 0 0 1px ${primary500Hex}` }}
                  placeholder="Enter your email"
                  aria-label="email"
                  aria-describedby={fieldErrors.email ? 'reg-email-error' : undefined}
                  aria-invalid={!!fieldErrors.email}
                  autoComplete="email"
                  disabled={loading}
                />
                {fieldErrors.email && <Text id="reg-email-error" color="red.400" fontSize="xs" mt={1}>{fieldErrors.email}</Text>}
              </Box>

              <Box>
                <label style={{ display: 'block', marginBottom: 4 }}>
                  <Text color="gray.300" fontSize="sm" fontWeight="medium">Password</Text>
                </label>
                <Input
                  id="reg-password"
                  type="password"
                  value={password}
                  onChange={e => handlePasswordChange(e.target.value)}
                  bg="background.900"
                  border="1px solid"
                  borderColor={fieldErrors.password ? 'red.500' : 'gray.600'}
                  color="white"
                  _focus={{ borderColor: primary500Hex, boxShadow: `0 0 0 1px ${primary500Hex}` }}
                  placeholder="Create a password"
                  aria-label="password"
                  aria-describedby={fieldErrors.password ? 'reg-password-error' : 'password-strength'}
                  aria-invalid={!!fieldErrors.password}
                  autoComplete="new-password"
                  disabled={loading}
                />
                {fieldErrors.password && <Text id="reg-password-error" color="red.400" fontSize="xs" mt={1}>{fieldErrors.password}</Text>}

                <Box mt={2} aria-live="polite" id="password-strength">
                  <Box height="8px" bg="gray.700" borderRadius="sm" overflow="hidden">
                    <Box
                      height="8px"
                      bg={score <= 1 ? 'red.500' : score === 2 ? 'yellow.400' : score === 3 ? 'primary.500' : 'success.500'}
                      width={`${(score / 4) * 100}%`}
                      transition="width 150ms ease"
                    />
                  </Box>
                  <HStack justifyContent="space-between" mt={1}>
                    <Text fontSize="xs" color="gray.400">Password strength: <Text as="span" color="white">{label}</Text></Text>
                    <Text fontSize="xs" color="gray.500">{password.length} chars</Text>
                  </HStack>

                  <Stack gap={1} align="start" mt={2}>
                    <HStack>
                      <Text aria-hidden color={criteria.length ? 'green.400' : 'red.400'}>{criteria.length ? '✓' : '✕'}</Text>
                      <Text fontSize="xs" color={criteria.length ? 'gray.200' : 'gray.500'}>At least 8 characters</Text>
                    </HStack>
                    <HStack>
                      <Text aria-hidden color={criteria.upperLower ? 'green.400' : 'red.400'}>{criteria.upperLower ? '✓' : '✕'}</Text>
                      <Text fontSize="xs" color={criteria.upperLower ? 'gray.200' : 'gray.500'}>Upper and lower case letters</Text>
                    </HStack>
                    <HStack>
                      <Text aria-hidden color={criteria.number ? 'green.400' : 'red.400'}>{criteria.number ? '✓' : '✕'}</Text>
                      <Text fontSize="xs" color={criteria.number ? 'gray.200' : 'gray.500'}>Contains a number</Text>
                    </HStack>
                    <HStack>
                      <Text aria-hidden color={criteria.special ? 'green.400' : 'red.400'}>{criteria.special ? '✓' : '✕'}</Text>
                      <Text fontSize="xs" color={criteria.special ? 'gray.200' : 'gray.500'}>Contains a special character</Text>
                    </HStack>
                  </Stack>
                </Box>
              </Box>

              <Box>
                <label style={{ display: 'block', marginBottom: 4 }}>
                  <Text color="gray.300" fontSize="sm" fontWeight="medium">Confirm password</Text>
                </label>
                <Input
                  id="reg-confirm"
                  type="password"
                  value={confirm}
                  onChange={e => handleConfirmChange(e.target.value)}
                  bg="background.900"
                  border="1px solid"
                  borderColor={fieldErrors.confirm ? 'red.500' : 'gray.600'}
                  color="white"
                  _focus={{ borderColor: primary500Hex, boxShadow: `0 0 0 1px ${primary500Hex}` }}
                  placeholder="Confirm your password"
                  aria-label="confirm password"
                  aria-describedby={fieldErrors.confirm ? 'reg-confirm-error' : undefined}
                  aria-invalid={!!fieldErrors.confirm}
                  autoComplete="new-password"
                  disabled={loading}
                />
                {fieldErrors.confirm && <Text id="reg-confirm-error" color="red.400" fontSize="xs" mt={1}>{fieldErrors.confirm}</Text>}
              </Box>

              <Button
                type="submit"
                w="full"
                bg={primary500Hex}
                color="white"
                fontWeight="semibold"
                py={3}
                borderRadius="md"
                _hover={{ bg: 'accent.500', transform: 'translateY(-1px)', boxShadow: `0 4px 12px ${primary500Hex}33` }}
                transition="all 0.15s"
                loading={loading}
                loadingText="Creating account..."
                disabled={loading}
                aria-live="polite"
                aria-label="register button"
              >
                {loading ? (
                  <>
                    <Spinner size="sm" mr={2} /> Creating account...
                  </>
                ) : (
                  'Create account'
                )}
              </Button>
            </Stack>
          </form>

          <HStack justify="center">
            <Text color="gray.400" fontSize="sm">Already have an account?</Text>
            <Link color="primary.500" fontSize="sm" fontWeight="medium" href="/login" _hover={{ color: 'accent.500', textDecoration: 'underline' }}>Login</Link>
          </HStack>
        </Stack>
      </Box>
    </Box>
  )
}
