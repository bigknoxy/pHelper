# Comprehensive Testing Strategy

## Overview

This document outlines the complete testing strategy for the fitness tracking app improvements, covering unit tests, integration tests, E2E tests, accessibility testing, and performance testing.

## Testing Pyramid

```
    E2E Tests (10%)
   ─────────────────
  Integration Tests (20%)
 ─────────────────────────
Unit Tests (70%)
```

## 1. Unit Testing Strategy

### 1.1 Tools & Configuration
- **Framework**: Jest + React Testing Library
- **Mocking**: MSW (Mock Service Worker) for API calls
- **Coverage**: Istanbul with 90%+ threshold
- **Assertion**: Jest DOM for DOM assertions

### 1.2 Component Testing Patterns

#### Basic Component Test Template
```typescript
// src/components/__tests__/ComponentName.test.tsx
import { render, screen, fireEvent, waitFor } from '@/test-utils'
import ComponentName from '../ComponentName'

describe('ComponentName', () => {
  const defaultProps = {
    // Default props here
  }

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks()
  })

  it('renders without crashing', () => {
    render(<ComponentName {...defaultProps} />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('displays loading state correctly', () => {
    render(<ComponentName {...defaultProps} loading />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('handles user interactions', async () => {
    const onAction = jest.fn()
    render(<ComponentName {...defaultProps} onAction={onAction} />)
    
    fireEvent.click(screen.getByRole('button', { name: /action/i }))
    
    await waitFor(() => {
      expect(onAction).toHaveBeenCalledTimes(1)
    })
  })

  it('displays error state correctly', () => {
    render(<ComponentName {...defaultProps} error="Something went wrong" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong')
  })
})
```

#### Hook Testing Template
```typescript
// src/hooks/__tests__/useWeights.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useWeights, useAddWeight } from '../useWeights'
import { getWeights, addWeight } from '../../api/weights'
import { server } from '../../mocks/server'

// Mock API responses
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useWeights', () => {
  it('returns weight data successfully', async () => {
    const { result } = renderHook(() => useWeights(), { wrapper: createWrapper() })
    
    expect(result.current.isLoading).toBe(true)
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
      expect(result.current.data).toEqual([
        { id: '1', date: '2024-01-01', weight: 150 }
      ])
    })
  })

  it('handles API errors', async () => {
    server.use(
      rest.get('/api/weights', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Server error' }))
      })
    )

    const { result } = renderHook(() => useWeights(), { wrapper: createWrapper() })
    
    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
  })
})

describe('useAddWeight', () => {
  it('adds weight successfully', async () => {
    const { result } = renderHook(() => useAddWeight(), { wrapper: createWrapper() })
    
    result.current.mutate({ weight: 160, date: '2024-01-02' })
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
  })
})
```

### 1.3 API Mocking with MSW

**File: `src/mocks/handlers.ts`**
```typescript
import { rest } from 'msw'
import { WeightEntry, WorkoutEntry, Task } from '../api'

const mockWeights: WeightEntry[] = [
  { id: '1', userId: 'user1', date: '2024-01-01', weight: 150 },
  { id: '2', userId: 'user1', date: '2024-01-02', weight: 151 },
]

const mockWorkouts: WorkoutEntry[] = [
  { id: '1', userId: 'user1', date: '2024-01-01', type: 'Running', duration: 30 },
  { id: '2', userId: 'user1', date: '2024-01-02', type: 'Weights', duration: 45 },
]

const mockTasks: Task[] = [
  { id: '1', title: 'Complete workout', description: '30 min cardio', completed: false },
  { id: '2', title: 'Log weight', description: 'Morning weight', completed: true },
]

export const handlers = [
  // Weight endpoints
  rest.get('/api/weights', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockWeights))
  }),
  
  rest.post('/api/weights', (req, res, ctx) => {
    const newWeight = req.body as Omit<WeightEntry, 'id' | 'userId'>
    const weight: WeightEntry = {
      ...newWeight,
      id: Date.now().toString(),
      userId: 'user1',
    }
    mockWeights.push(weight)
    return res(ctx.status(201), ctx.json(weight))
  }),
  
  rest.delete('/api/weights/:id', (req, res, ctx) => {
    const { id } = req.params
    const index = mockWeights.findIndex(w => w.id === id)
    if (index !== -1) {
      mockWeights.splice(index, 1)
      return res(ctx.status(204))
    }
    return res(ctx.status(404))
  }),

  // Workout endpoints
  rest.get('/api/workouts', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockWorkouts))
  }),
  
  rest.post('/api/workouts', (req, res, ctx) => {
    const newWorkout = req.body as Omit<WorkoutEntry, 'id' | 'userId'>
    const workout: WorkoutEntry = {
      ...newWorkout,
      id: Date.now().toString(),
      userId: 'user1',
    }
    mockWorkouts.push(workout)
    return res(ctx.status(201), ctx.json(workout))
  }),

  // Task endpoints
  rest.get('/api/tasks', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockTasks))
  }),
  
  rest.post('/api/tasks', (req, res, ctx) => {
    const newTask = req.body as Omit<Task, 'id'>
    const task: Task = {
      ...newTask,
      id: Date.now().toString(),
    }
    mockTasks.push(task)
    return res(ctx.status(201), ctx.json(task))
  }),
  
  rest.delete('/api/tasks/:id', (req, res, ctx) => {
    const { id } = req.params
    const index = mockTasks.findIndex(t => t.id === id)
    if (index !== -1) {
      mockTasks.splice(index, 1)
      return res(ctx.status(204))
    }
    return res(ctx.status(404))
  }),
]
```

**File: `src/mocks/server.ts`**
```typescript
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
```

### 1.4 Test Coverage Requirements

#### Components to Test (90%+ coverage)
- [ ] Dashboard.tsx
- [ ] WeightTracker.tsx
- [ ] WorkoutLogger.tsx
- [ ] TaskTracker.tsx
- [ ] LoginForm.tsx
- [ ] RegisterForm.tsx
- [ ] All UI components (Card, Button, Input, etc.)

#### Hooks to Test (95%+ coverage)
- [ ] useWeights.ts
- [ ] useWorkouts.ts
- [ ] useTasks.ts
- [ ] useAuth.ts
- [ ] useKeyboardNavigation.ts

#### Utilities to Test (100% coverage)
- [ ] API client functions
- [ ] Date formatting utilities
- [ ] Validation functions
- [ ] Storage utilities

## 2. Integration Testing Strategy

### 2.1 API Integration Tests

**File: `server/tests/integration/weights.test.ts`**
```typescript
import request from 'supertest'
import { app } from '../src/app'
import { prisma } from '../src/utils/prisma'

describe('Weights API Integration', () => {
  beforeEach(async () => {
    // Clean database
    await prisma.weight.deleteMany()
    await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('GET /api/weights', () => {
    it('returns user weights when authenticated', async () => {
      // Create test user and weights
      const user = await prisma.user.create({
        data: { email: 'test@example.com', password: 'hashedpassword' }
      })
      
      await prisma.weight.createMany({
        data: [
          { userId: user.id, date: '2024-01-01', weight: 150 },
          { userId: user.id, date: '2024-01-02', weight: 151 },
        ]
      })

      const token = generateTestToken(user.id)
      
      const response = await request(app)
        .get('/api/weights')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(response.body).toHaveLength(2)
      expect(response.body[0].weight).toBe(150)
    })

    it('returns 401 when not authenticated', async () => {
      await request(app)
        .get('/api/weights')
        .expect(401)
    })
  })

  describe('POST /api/weights', () => {
    it('creates new weight entry', async () => {
      const user = await prisma.user.create({
        data: { email: 'test@example.com', password: 'hashedpassword' }
      })
      
      const token = generateTestToken(user.id)
      const weightData = { weight: 160, date: '2024-01-03' }

      const response = await request(app)
        .post('/api/weights')
        .set('Authorization', `Bearer ${token}`)
        .send(weightData)
        .expect(201)

      expect(response.body.weight).toBe(160)
      expect(response.body.userId).toBe(user.id)
    })

    it('validates weight data', async () => {
      const user = await prisma.user.create({
        data: { email: 'test@example.com', password: 'hashedpassword' }
      })
      
      const token = generateTestToken(user.id)

      await request(app)
        .post('/api/weights')
        .set('Authorization', `Bearer ${token}`)
        .send({ weight: -10, date: 'invalid-date' })
        .expect(400)
    })
  })
})
```

### 2.2 Database Integration Tests

**File: `server/tests/integration/database.test.ts`**
```typescript
import { prisma } from '../src/utils/prisma'

describe('Database Integration', () => {
  beforeEach(async () => {
    await prisma.weight.deleteMany()
    await prisma.workout.deleteMany()
    await prisma.task.deleteMany()
    await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('creates and retrieves weight entries', async () => {
    const user = await prisma.user.create({
      data: { email: 'test@example.com', password: 'hashedpassword' }
    })

    const weight = await prisma.weight.create({
      data: {
        userId: user.id,
        date: '2024-01-01',
        weight: 150,
      }
    })

    const retrieved = await prisma.weight.findUnique({
      where: { id: weight.id },
      include: { user: true }
    })

    expect(retrieved?.weight).toBe(150)
    expect(retrieved?.user.email).toBe('test@example.com')
  })

  it('handles database constraints', async () => {
    const user = await prisma.user.create({
      data: { email: 'test@example.com', password: 'hashedpassword' }
    })

    // Try to create duplicate weight entry for same date
    await prisma.weight.create({
      data: {
        userId: user.id,
        date: '2024-01-01',
        weight: 150,
      }
    })

    await expect(
      prisma.weight.create({
        data: {
          userId: user.id,
          date: '2024-01-01',
          weight: 151,
        }
      })
    ).rejects.toThrow()
  })
})
```

## 3. E2E Testing Strategy

### 3.1 Playwright Configuration

**File: `playwright.config.ts`**
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
  ],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
})
```

### 3.2 E2E Test Cases

**File: `e2e/auth-flow.spec.ts`**
```typescript
import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('user can register and login', async ({ page }) => {
    // Register new user
    await page.click('button:has-text("Sign Up")')
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.fill('[data-testid="confirm-password-input"]', 'password123')
    await page.click('button:has-text("Sign Up")')

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('h1')).toContainText('Dashboard')

    // Logout
    await page.click('button:has-text("Logout")')

    // Login with same credentials
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('button:has-text("Login")')

    // Should be logged in
    await expect(page).toHaveURL('/dashboard')
  })

  test('displays error for invalid credentials', async ({ page }) => {
    await page.fill('[data-testid="email-input"]', 'invalid@example.com')
    await page.fill('[data-testid="password-input"]', 'wrongpassword')
    await page.click('button:has-text("Login")')

    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid credentials')
  })
})
```

**File: `e2e/weight-tracking.spec.ts`**
```typescript
import { test, expect } from '@playwright/test'

test.describe('Weight Tracking', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/')
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('button:has-text("Login")')
    await page.click('button:has-text("Weight")')
  })

  test('can add weight entry', async ({ page }) => {
    await page.fill('[data-testid="weight-date"]', '2024-01-15')
    await page.fill('[data-testid="weight-value"]', '150.5')
    await page.click('button:has-text("Add Entry")')

    // Verify entry appears in history
    await expect(page.locator('text=2024-01-15: 150.5 lb')).toBeVisible()
  })

  test('validates weight input', async ({ page }) => {
    await page.fill('[data-testid="weight-value"]', '-10')
    await page.click('button:has-text("Add Entry")')

    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible()
  })

  test('displays weight chart', async ({ page }) => {
    // Add multiple entries
    const weights = [150, 151, 149.5, 150.5]
    for (let i = 0; i < weights.length; i++) {
      await page.fill('[data-testid="weight-date"]', `2024-01-${15 + i}`)
      await page.fill('[data-testid="weight-value"]', weights[i].toString())
      await page.click('button:has-text("Add Entry")')
      await page.waitForTimeout(500) // Small delay between entries
    }

    // Verify chart is visible
    await expect(page.locator('[data-testid="weight-chart"]')).toBeVisible()
  })
})
```

**File: `e2e/workout-logging.spec.ts`**
```typescript
import { test, expect } from '@playwright/test'

test.describe('Workout Logging', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('button:has-text("Login")')
    await page.click('button:has-text("Workouts")')
  })

  test('can log workout', async ({ page }) => {
    await page.fill('[data-testid="workout-date"]', '2024-01-15')
    await page.fill('[data-testid="workout-type"]', 'Running')
    await page.fill('[data-testid="workout-duration"]', '30')
    await page.fill('[data-testid="workout-notes"]', 'Morning run')
    await page.click('button:has-text("Add Workout")')

    await expect(page.locator('text=2024-01-15: Running, 30 min, Morning run')).toBeVisible()
  })

  test('validates workout input', async ({ page }) => {
    await page.click('button:has-text("Add Workout")')

    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible()
  })
})
```

**File: `e2e/task-management.spec.ts`**
```typescript
import { test, expect } from '@playwright/test'

test.describe('Task Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('button:has-text("Login")')
    await page.click('button:has-text("Tasks")')
  })

  test('can add and complete task', async ({ page }) => {
    await page.fill('[data-testid="task-title"]', 'Complete workout')
    await page.fill('[data-testid="task-description"]', '30 min cardio session')
    await page.click('button:has-text("Add Task")')

    // Verify task appears
    await expect(page.locator('text=Complete workout')).toBeVisible()
    await expect(page.locator('text=30 min cardio session')).toBeVisible()

    // Complete task
    await page.check('[data-testid="task-checkbox"]')
    await expect(page.locator('[data-testid="task-checkbox"]')).toBeChecked()
  })

  test('can delete task', async ({ page }) => {
    await page.fill('[data-testid="task-title"]', 'Test task')
    await page.click('button:has-text("Add Task")')

    await page.click('button:has-text("Delete")')
    await expect(page.locator('text=Test task')).not.toBeVisible()
  })
})
```

**File: `e2e/dashboard.spec.ts`**
```typescript
import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('button:has-text("Login")')
  })

  test('displays summary metrics', async ({ page }) => {
    await expect(page.locator('[data-testid="weight-summary"]')).toBeVisible()
    await expect(page.locator('[data-testid="workout-summary"]')).toBeVisible()
    await expect(page.locator('[data-testid="task-summary"]')).toBeVisible()
  })

  test('updates metrics when data changes', async ({ page }) => {
    // Add weight entry
    await page.click('button:has-text("Weight")')
    await page.fill('[data-testid="weight-date"]', '2024-01-15')
    await page.fill('[data-testid="weight-value"]', '150')
    await page.click('button:has-text("Add Entry")')

    // Go back to dashboard
    await page.click('button:has-text("Dashboard")')

    // Verify updated metrics
    await expect(page.locator('[data-testid="weight-summary"]')).toContainText('150')
  })
})
```

## 4. Accessibility Testing

### 4.1 Automated Accessibility Tests

**File: `src/components/__tests__/accessibility.test.tsx`**
```typescript
import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import Dashboard from '../Dashboard'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../../context/AuthContext'

expect.extend(toHaveNoViolations)

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  )
}

describe('Accessibility', () => {
  it('Dashboard should not have accessibility violations', async () => {
    const { container } = render(<Dashboard />, { wrapper: createWrapper() })
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have proper ARIA labels', () => {
    render(<Dashboard />, { wrapper: createWrapper() })
    
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /weight metrics/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /workout metrics/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /task metrics/i })).toBeInTheDocument()
  })

  it('should be keyboard navigable', () => {
    render(<Dashboard />, { wrapper: createWrapper() })
    
    const focusableElements = screen.getAllByRole('button', { hidden: true })
    focusableElements.forEach(element => {
      expect(element).toHaveAttribute('tabindex')
    })
  })
})
```

### 4.2 Manual Accessibility Checklist

#### Visual Accessibility
- [ ] Sufficient color contrast (4.5:1 for normal text, 3:1 for large text)
- [ ] Focus indicators visible on all interactive elements
- [ ] Text can be resized to 200% without loss of functionality
- [ ] No reliance on color alone to convey information

#### Keyboard Accessibility
- [ ] All functionality available via keyboard
- [ ] Logical tab order
- [ ] Visible focus state
- [ ] Skip navigation link available
- [ ] No keyboard traps

#### Screen Reader Accessibility
- [ ] Semantic HTML elements used appropriately
- [ ] ARIA labels and descriptions provided
- [ ] Form inputs properly labeled
- [ ] Dynamic content changes announced
- [ ] Page titles descriptive and updated

#### Motor Accessibility
- [ ] Large click targets (minimum 44x44px)
- [ ] Sufficient spacing between interactive elements
- [ ] No time limits without user control
- [ ] Motion can be disabled

## 5. Performance Testing

### 5.1 Performance Metrics

#### Core Web Vitals Targets
- **Largest Contentful Paint (LCP)**: < 2.5 seconds
- **First Input Delay (FID)**: < 100 milliseconds
- **Cumulative Layout Shift (CLS)**: < 0.1

#### Additional Metrics
- **Time to Interactive (TTI)**: < 3.8 seconds
- **First Contentful Paint (FCP)**: < 1.8 seconds
- **Bundle Size**: < 1MB (gzipped)

### 5.2 Performance Testing Tools

**File: `scripts/performance-test.js`**
```javascript
const lighthouse = require('lighthouse')
const chromeLauncher = require('chrome-launcher')

async function runPerformanceTest(url = 'http://localhost:5173') {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] })
  const options = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance'],
    port: chrome.port,
  }

  const runnerResult = await lighthouse(url, options)
  await chrome.kill()

  const { lhr } = runnerResult
  const performance = lhr.categories.performance.score * 100

  console.log(`Performance Score: ${performance}`)
  console.log(`LCP: ${lhr.audits['largest-contentful-paint'].displayValue}`)
  console.log(`FID: ${lhr.audits['max-potential-fid'].displayValue}`)
  console.log(`CLS: ${lhr.audits['cumulative-layout-shift'].displayValue}`)

  // Assert performance thresholds
  if (performance < 90) {
    throw new Error(`Performance score ${performance} is below threshold of 90`)
  }

  return runnerResult
}

runPerformanceTest().catch(console.error)
```

### 5.3 Bundle Analysis

**File: `scripts/analyze-bundle.js`**
```javascript
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

function analyzeBundle() {
  // Build the application
  execSync('npm run build', { stdio: 'inherit' })

  // Analyze bundle size
  const distPath = path.join(__dirname, '../dist')
  const assets = fs.readdirSync(distPath)
  
  const jsAssets = assets.filter(asset => asset.endsWith('.js'))
  const cssAssets = assets.filter(asset => asset.endsWith('.css'))

  console.log('Bundle Analysis:')
  console.log('================')
  
  jsAssets.forEach(asset => {
    const stats = fs.statSync(path.join(distPath, asset))
    const sizeKB = (stats.size / 1024).toFixed(2)
    console.log(`${asset}: ${sizeKB} KB`)
  })

  cssAssets.forEach(asset => {
    const stats = fs.statSync(path.join(distPath, asset))
    const sizeKB = (stats.size / 1024).toFixed(2)
    console.log(`${asset}: ${sizeKB} KB`)
  })

  // Check total bundle size
  const totalSize = jsAssets.reduce((total, asset) => {
    return total + fs.statSync(path.join(distPath, asset)).size
  }, 0)

  const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2)
  console.log(`\nTotal JS Bundle Size: ${totalSizeMB} MB`)

  if (totalSizeMB > 1) {
    console.warn('⚠️  Bundle size exceeds 1MB recommendation')
  }
}

analyzeBundle()
```

## 6. Test Execution Strategy

### 6.1 Local Development
```bash
# Run unit tests in watch mode
npm run test:watch

# Run unit tests with coverage
npm run test:coverage

# Run integration tests
npm run test:integration

# Run E2E tests
npm run e2e

# Run accessibility tests
npm run test:a11y

# Run performance tests
npm run test:performance
```

### 6.2 CI/CD Pipeline

**File: `.github/workflows/test.yml`**
```yaml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run build
      - run: npm run e2e
      
      - name: Upload E2E test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/

  accessibility-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run test:a11y

  performance-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run build
      - run: npm run test:performance
```

## 7. Test Data Management

### 7.1 Test Data Factories

**File: `src/test-utils/factories.ts`**
```typescript
import { WeightEntry, WorkoutEntry, Task } from '../api'

export const createWeightEntry = (overrides: Partial<WeightEntry> = {}): WeightEntry => ({
  id: Math.random().toString(36).substr(2, 9),
  userId: 'test-user',
  date: '2024-01-01',
  weight: 150,
  ...overrides,
})

export const createWorkoutEntry = (overrides: Partial<WorkoutEntry> = {}): WorkoutEntry => ({
  id: Math.random().toString(36).substr(2, 9),
  userId: 'test-user',
  date: '2024-01-01',
  type: 'Running',
  duration: 30,
  ...overrides,
})

export const createTask = (overrides: Partial<Task> = {}): Task => ({
  id: Math.random().toString(36).substr(2, 9),
  title: 'Test task',
  description: 'Test description',
  completed: false,
  ...overrides,
})
```

### 7.2 Test Database Setup

**File: `server/test-utils/setup.ts`**
```typescript
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

const prisma = new PrismaClient()

export async function setupTestDatabase() {
  // Create test database
  execSync('createdb phelper_test', { stdio: 'ignore' })
  
  // Run migrations
  execSync('npx prisma migrate deploy', { 
    stdio: 'ignore',
    env: { ...process.env, DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/phelper_test' }
  })
}

export async function cleanupTestDatabase() {
  await prisma.$executeRaw`TRUNCATE TABLE weight, workout, task, user RESTART IDENTITY CASCADE`
  await prisma.$disconnect()
}

export async function teardownTestDatabase() {
  await prisma.$disconnect()
  execSync('dropdb phelper_test', { stdio: 'ignore' })
}
```

## 8. Success Metrics

### 8.1 Coverage Metrics
- **Unit Test Coverage**: 90%+
- **Integration Test Coverage**: 80%+
- **E2E Test Coverage**: Critical user paths 100%

### 8.2 Quality Metrics
- **Zero critical bugs in production**
- **Accessibility compliance**: WCAG 2.1 AA
- **Performance score**: 90+ Lighthouse
- **Bundle size**: <1MB gzipped

### 8.3 Reliability Metrics
- **Test suite execution time**: <5 minutes
- **Flaky test rate**: <1%
- **CI/CD success rate**: 95%+
- **Mean time to detection**: <1 hour

This comprehensive testing strategy ensures the fitness tracking app meets the highest standards of quality, accessibility, and performance while maintaining reliability throughout the development lifecycle.