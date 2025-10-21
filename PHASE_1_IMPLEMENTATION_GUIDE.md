# Phase 1 Implementation Guide - Foundation & Consistency

## Overview
This guide provides detailed implementation steps for Phase 1 of the fitness app improvement plan, focusing on unifying the data layer, establishing design consistency, and ensuring accessibility compliance.

## 1. Data Layer Unification

### 1.1 Remove localStorage Dependencies

**File: `src/components/Dashboard.tsx`**
```typescript
// BEFORE (Current mixed approach)
function getWeightMetrics() {
  const entries: { date: string; weight: number }[] = JSON.parse(localStorage.getItem("weightEntries") || "[]");
  // ... rest of function
}

// AFTER (API-only approach)
import { useWeights } from '../hooks/useWeights'
import { useWorkouts } from '../hooks/useWorkouts'
import { useTasks } from '../hooks/useTasks'

export default function Dashboard() {
  const { data: weights, isLoading: weightsLoading } = useWeights()
  const { data: workouts, isLoading: workoutsLoading } = useWorkouts()
  const { data: tasks, isLoading: tasksLoading } = useTasks()
  
  // Calculate metrics from API data
  const weightMetrics = useMemo(() => {
    if (!weights || weights.length === 0) return { latest: '-', trend: 0, chart: [] }
    const latest = weights[weights.length - 1].weight
    const last7 = weights.slice(-7)
    const trend = last7.length > 1 ? (last7[last7.length - 1].weight - last7[0].weight) : 0
    return { latest, trend, chart: last7 }
  }, [weights])
  
  // Similar patterns for workouts and tasks...
}
```

### 1.2 Create Custom Hooks

**File: `src/hooks/useWeights.ts`**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getWeights, addWeight, deleteWeight, WeightEntry } from '../api/weights'
import { useAuth } from '../context/AuthContext'

export const useWeights = () => {
  const { token } = useAuth()
  
  return useQuery({
    queryKey: ['weights'],
    queryFn: () => getWeights(),
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useAddWeight = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ weight, date, note }: { weight: number; date: string; note?: string }) => 
      addWeight(weight, date, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weights'] })
    },
    onError: (error) => {
      console.error('Failed to add weight:', error)
      // Add toast notification here
    }
  })
}

export const useDeleteWeight = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteWeight,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weights'] })
    }
  })
}
```

**File: `src/hooks/useWorkouts.ts`**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getWorkouts, addWorkout, deleteWorkout, WorkoutEntry } from '../api/workouts'
import { useAuth } from '../context/AuthContext'

export const useWorkouts = () => {
  const { token } = useAuth()
  
  return useQuery({
    queryKey: ['workouts'],
    queryFn: () => getWorkouts(),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  })
}

export const useAddWorkout = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ type, duration, date, notes }: { 
      type: string; 
      duration: number; 
      date: string; 
      notes?: string 
    }) => addWorkout(type, duration, date, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] })
    }
  })
}
```

**File: `src/hooks/useTasks.ts`**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTasks, addTask, deleteTask, Task } from '../api/tasks'
import { useAuth } from '../context/AuthContext'

export const useTasks = () => {
  const { token } = useAuth()
  
  return useQuery({
    queryKey: ['tasks'],
    queryFn: () => getTasks(),
    enabled: !!token,
    staleTime: 2 * 60 * 1000, // 2 minutes for tasks
  })
}

export const useAddTask = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ title, description, status, dueDate }: { 
      title: string; 
      description?: string; 
      status?: string; 
      dueDate?: string 
    }) => addTask(title, description, status, dueDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    }
  })
}

export const useDeleteTask = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    }
  })
}
```

### 1.3 Add TanStack Query Configuration

**File: `src/providers/QueryProvider.tsx`**
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ReactNode } from 'react'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
})

interface QueryProviderProps {
  children: ReactNode
}

export const QueryProvider = ({ children }: QueryProviderProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}
```

### 1.4 Update App.tsx

```typescript
// Add QueryProvider to your app
import { QueryProvider } from './providers/QueryProvider'

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        {/* rest of your app */}
      </AuthProvider>
    </QueryProvider>
  )
}
```

## 2. Design System Foundation

### 2.1 Create Shared Components

**File: `src/components/ui/Card.tsx`**
```typescript
import { Box, BoxProps, Skeleton, Alert, AlertIcon } from '@chakra-ui/react'
import { ReactNode } from 'react'

interface CardProps extends BoxProps {
  children: ReactNode
  loading?: boolean
  error?: string
  variant?: 'default' | 'elevated' | 'outlined'
}

export const Card = ({ 
  children, 
  loading = false, 
  error, 
  variant = 'default',
  ...props 
}: CardProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'elevated':
        return {
          bg: 'gray.800',
          boxShadow: 'lg',
          borderRadius: 'xl',
        }
      case 'outlined':
        return {
          bg: 'gray.800',
          border: '1px solid',
          borderColor: 'gray.600',
          borderRadius: 'lg',
        }
      default:
        return {
          bg: 'gray.800',
          borderRadius: 'lg',
        }
    }
  }

  return (
    <Box p={6} {...getVariantStyles()} {...props}>
      {loading && <Skeleton height="100px" />}
      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}
      {!loading && !error && children}
    </Box>
  )
}
```

**File: `src/components/ui/LoadingSpinner.tsx`**
```typescript
import { Spinner, SpinnerProps, Box, Text } from '@chakra-ui/react'
import { ReactNode } from 'react'

interface LoadingSpinnerProps extends SpinnerProps {
  message?: string
  fullScreen?: boolean
}

export const LoadingSpinner = ({ 
  message = 'Loading...', 
  fullScreen = false,
  ...props 
}: LoadingSpinnerProps) => {
  const content = (
    <Box display="flex" flexDirection="column" alignItems="center" gap={4}>
      <Spinner 
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.700"
        color="teal.400"
        size="xl"
        {...props}
      />
      {message && <Text color="gray.400">{message}</Text>}
    </Box>
  )

  if (fullScreen) {
    return (
      <Box 
        position="fixed" 
        top={0} 
        left={0} 
        right={0} 
        bottom={0}
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="gray.900"
        zIndex={9999}
      >
        {content}
      </Box>
    )
  }

  return content
}
```

**File: `src/components/ui/ErrorMessage.tsx`**
```typescript
import { Alert, AlertIcon, AlertTitle, AlertDescription, Button } from '@chakra-ui/react'
import { ReactNode } from 'react'

interface ErrorMessageProps {
  title?: string
  message: string
  onRetry?: () => void
  actionText?: string
}

export const ErrorMessage = ({ 
  title = 'Error', 
  message, 
  onRetry, 
  actionText = 'Retry' 
}: ErrorMessageProps) => {
  return (
    <Alert status="error" variant="subtle" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" py={8}>
      <AlertIcon boxSize="40px" mr={0} />
      <AlertTitle mt={4} mb={1} fontSize="lg">
        {title}
      </AlertTitle>
      <AlertDescription maxWidth="sm">
        {message}
      </AlertDescription>
      {onRetry && (
        <Button mt={4} colorScheme="teal" variant="outline" onClick={onRetry}>
          {actionText}
        </Button>
      )}
    </Alert>
  )
}
```

### 2.2 Create Theme Configuration

**File: `src/theme/index.ts`**
```typescript
import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  colors: {
    brand: {
      50: '#e6fffa',
      100: '#b2f5ea',
      200: '#81e6d9',
      300: '#4fd1c5',
      400: '#38b2ac',
      500: '#319795',
      600: '#2c7a7b',
      700: '#285e61',
      800: '#234e52',
      900: '#1a365d',
    },
    gray: {
      50: '#f7fafc',
      100: '#edf2f7',
      200: '#e2e8f0',
      300: '#cbd5e0',
      400: '#a0aec0',
      500: '#718096',
      600: '#4a5568',
      700: '#2d3748',
      800: '#1a202c',
      900: '#171923',
    },
  },
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
  },
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: 'gray.900',
        color: 'gray.100',
      },
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'teal',
        variant: 'solid',
      },
      baseStyle: {
        fontWeight: '600',
        borderRadius: 'md',
        transition: 'all 0.2s ease-in-out',
      },
    },
    Card: {
      baseStyle: {
        bg: 'gray.800',
        borderRadius: 'lg',
        boxShadow: 'md',
      },
    },
    Input: {
      defaultProps: {
        variant: 'filled',
      },
      baseStyle: {
        bg: 'gray.700',
        borderColor: 'gray.600',
        _focus: {
          borderColor: 'teal.400',
          boxShadow: '0 0 0 1px var(--chakra-colors-teal-400)',
        },
      },
    },
  },
})

export default theme
```

## 3. Accessibility Compliance

### 3.1 Add ARIA Labels and Semantic HTML

**File: `src/components/WeightTracker.tsx` (Updated)**
```typescript
export default function WeightTracker() {
  const { token } = useAuth()
  const { data: weightEntries, isLoading, error } = useWeights()
  const addWeightMutation = useAddWeight()
  
  // ... rest of component

  return (
    <Box role="main" aria-label="Weight Tracking">
      {!token ? (
        <Text color="red.400" role="alert">
          Please log in to use the Weight Tracker.
        </Text>
      ) : (
        <>
          <Heading size="md" mb={4} id="weight-form-heading">
            Log Your Weight
          </Heading>
          <form 
            aria-labelledby="weight-form-heading"
            onSubmit={handleAddEntry}
          >
            <Stack gap={4} align="stretch">
              <FormControl isRequired>
                <FormLabel htmlFor="weight-date">Date</FormLabel>
                <Input
                  id="weight-date"
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  aria-describedby="weight-date-help"
                />
                <FormHelperText id="weight-date-help">
                  Select the date for your weight entry
                </FormHelperText>
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel htmlFor="weight-value">Weight (lb)</FormLabel>
                <Input
                  id="weight-value"
                  type="number"
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                  aria-describedby="weight-value-help"
                  step="0.1"
                  min="0"
                  max="1000"
                />
                <FormHelperText id="weight-value-help">
                  Enter your weight in pounds
                </FormHelperText>
              </FormControl>
              
              <Button
                type="submit"
                colorScheme="teal"
                variant="solid"
                size="md"
                borderRadius="md"
                boxShadow="md"
                fontWeight="bold"
                _hover={{ bg: "teal.300", boxShadow: "lg", cursor: "pointer" }}
                isLoading={addWeightMutation.isLoading}
                aria-describedby="weight-submit-help"
              >
                Add Entry
              </Button>
              <FormHelperText id="weight-submit-help">
                Click to save your weight entry
              </FormHelperText>
            </Stack>
          </form>
          
          {weightEntries && weightEntries.length > 0 && (
            <Box mt={8} role="region" aria-label="Weight History">
              <Heading size="sm" mb={2} id="weight-history-heading">
                Weight History
              </Heading>
              <List.Root gap="2" aria-labelledby="weight-history-heading">
                {weightEntries.map((entry, idx) => (
                  <List.Item key={entry.id || idx}>
                    <Text>
                      {entry.date}: {entry.weight} lb
                    </Text>
                  </List.Item>
                ))}
              </List.Root>
            </Box>
          )}
        </>
      )}
    </Box>
  )
}
```

### 3.2 Add Keyboard Navigation Support

**File: `src/hooks/useKeyboardNavigation.ts`**
```typescript
import { useEffect } from 'react'

export const useKeyboardNavigation = (
  items: Array<{ id: string; element: HTMLElement }>,
  onSelect?: (id: string) => void
) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { key } = event
      
      if (key === 'Escape') {
        // Clear focus or close modals
        document.activeElement?.blur()
        return
      }
      
      if (key === 'Tab') {
        // Let browser handle tab navigation
        return
      }
      
      if (key === 'Enter' || key === ' ') {
        const activeElement = document.activeElement as HTMLElement
        const item = items.find(item => item.element === activeElement)
        if (item && onSelect) {
          event.preventDefault()
          onSelect(item.id)
        }
        return
      }
      
      // Arrow key navigation for custom lists
      if (key === 'ArrowDown' || key === 'ArrowUp') {
        const currentIndex = items.findIndex(item => item.element === document.activeElement)
        let nextIndex = currentIndex
        
        if (key === 'ArrowDown') {
          nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0
        } else {
          nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
        }
        
        if (nextIndex !== currentIndex) {
          event.preventDefault()
          items[nextIndex].element.focus()
        }
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [items, onSelect])
}
```

### 3.3 Add Error Boundary

**File: `src/components/ErrorBoundary.tsx`**
```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Box, Text, Button, Heading } from '@chakra-ui/react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    
    // Send to error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } })
    }
    
    this.setState({ error, errorInfo })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Box 
          p={8} 
          textAlign="center" 
          minH="400px" 
          display="flex" 
          flexDirection="column" 
          justifyContent="center" 
          alignItems="center"
        >
          <Heading size="lg" color="red.400" mb={4}>
            Something went wrong
          </Heading>
          <Text color="gray.400" mb={6}>
            We apologize for the inconvenience. Please try refreshing the page.
          </Text>
          
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <Box 
              bg="gray.800" 
              p={4} 
              borderRadius="md" 
              textAlign="left" 
              maxW="600px" 
              mb={6}
              overflow="auto"
            >
              <Text color="red.300" fontFamily="mono" fontSize="sm">
                {this.state.error.toString()}
              </Text>
              {this.state.errorInfo && (
                <Text color="gray.400" fontFamily="mono" fontSize="xs" mt={2}>
                  {this.state.errorInfo.componentStack}
                </Text>
              )}
            </Box>
          )}
          
          <Button 
            colorScheme="teal" 
            onClick={this.handleReset}
            mr={4}
          >
            Try Again
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
        </Box>
      )
    }

    return this.props.children
  }
}
```

## 4. Installation & Setup

### 4.1 Install Required Dependencies

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
npm install @hookform/resolvers react-hook-form zod
npm install date-fns
```

### 4.2 Update Package.json Scripts

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:db\" \"wait-on tcp:55432 && npm run dev:server\" \"wait-on http://localhost:4000/api/health && npm run dev:client\"",
    "build": "tsc -b && vite build",
    "test": "jest --config jest.config.cjs",
    "test:watch": "jest --config jest.config.cjs --watch",
    "test:coverage": "jest --config jest.config.cjs --coverage",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "type-check": "tsc --noEmit"
  }
}
```

## 5. Testing Implementation

### 5.1 Update Test Configuration

**File: `jest.config.cjs`**
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}
```

### 5.2 Create Test Utilities

**File: `src/test-utils/index.tsx`**
```typescript
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../context/AuthContext'
import { ReactElement, ReactNode } from 'react'

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
})

interface AllTheProvidersProps {
  children: ReactNode
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  const testQueryClient = createTestQueryClient()
  
  return (
    <QueryClientProvider client={testQueryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }
```

## 6. Success Metrics for Phase 1

### Technical Metrics
- [ ] 100% API data usage (no localStorage)
- [ ] 90%+ test coverage for new components
- [ ] WCAG 2.1 AA compliance score
- [ ] <500ms initial load time
- [ ] Zero console errors

### User Experience Metrics
- [ ] Consistent visual design across all components
- [ ] Proper loading states for all async operations
- [ ] Meaningful error messages with recovery options
- [ ] Full keyboard navigation support
- [ ] Screen reader compatibility

### Code Quality Metrics
- [ ] TypeScript strict mode compliance
- [ ] ESLint zero warnings
- [ ] Component reuse rate >70%
- [ ] Bundle size increase <20%
- [ ] Performance score >90

## Next Steps

1. **Week 1**: Implement data layer unification and custom hooks
2. **Week 2**: Create design system components and accessibility improvements
3. **Testing**: Comprehensive testing of all Phase 1 features
4. **Review**: Code review and performance optimization
5. **Documentation**: Update component documentation and usage examples

This implementation guide provides the foundation for transforming the fitness app into a modern, accessible, and maintainable application. Each step builds upon the previous one, ensuring consistent progress toward the overall improvement goals.