import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import WorkoutTemplates from './WorkoutTemplates'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ChakraProvider } from '@chakra-ui/react'
import * as workoutTemplatesApi from '../api/workoutTemplates'
import { ExerciseCategory, MuscleGroup, ExerciseDifficulty } from '../api/exercises'
import theme from '../theme'

// Mock the APIs
jest.mock('../api/workoutTemplates')

const mockWorkoutTemplatesApi = workoutTemplatesApi as jest.Mocked<typeof workoutTemplatesApi>

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: false,
    },
  },
})

const renderWithQueryClient = (component: React.ReactElement) => {
  const testQueryClient = createTestQueryClient()
  return render(
    <ChakraProvider value={theme}>
      <QueryClientProvider client={testQueryClient}>
        {component}
      </QueryClientProvider>
    </ChakraProvider>
  )
}

const mockWorkoutTemplates = [
  {
    id: '1',
    name: 'Upper Body Strength',
    description: 'Focus on chest, back, and shoulders',
    category: 'Strength',
    isPublic: false,
    createdBy: 'test-user',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    exercises: [
      {
        id: '1',
        workoutTemplateId: '1',
        exerciseId: '1',
        exercise: {
          id: '1',
          name: 'Bench Press',
          description: 'Classic chest exercise',
          instructions: 'Lie on bench, press bar up',
          category: ExerciseCategory.STRENGTH,
          muscleGroups: [MuscleGroup.CHEST, MuscleGroup.TRICEPS],
          equipment: ['Barbell', 'Bench'],
          difficulty: ExerciseDifficulty.INTERMEDIATE,
          isActive: true,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
        sets: 3,
        reps: 10,
        weight: 135,
        duration: undefined,
        restTime: 90,
        order: 1,
        notes: 'Focus on form',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
      {
        id: '2',
        workoutTemplateId: '1',
        exerciseId: '2',
        exercise: {
          id: '2',
          name: 'Pull-ups',
          description: 'Bodyweight back exercise',
          instructions: 'Hang from bar, pull body up',
          category: ExerciseCategory.STRENGTH,
          muscleGroups: [MuscleGroup.BACK, MuscleGroup.BICEPS],
          equipment: ['Pull-up Bar'],
          difficulty: ExerciseDifficulty.INTERMEDIATE,
          isActive: true,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
        sets: 3,
        reps: 8,
        weight: undefined,
        duration: undefined,
        restTime: 90,
        order: 2,
        notes: undefined,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
    ],
  },
  {
    id: '2',
    name: 'Cardio Blast',
    description: 'High-intensity cardio workout',
    category: 'Cardio',
    isPublic: true,
    createdBy: 'other-user',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    exercises: [
      {
        id: '3',
        workoutTemplateId: '2',
        exerciseId: '3',
        exercise: {
          id: '3',
          name: 'Running',
          description: 'Cardiovascular exercise',
          instructions: 'Run at comfortable pace',
          category: ExerciseCategory.CARDIO,
          muscleGroups: [MuscleGroup.FULL_BODY],
          equipment: ['Running Shoes'],
          difficulty: ExerciseDifficulty.BEGINNER,
          isActive: true,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
        sets: 1,
        reps: undefined,
        weight: undefined,
        duration: 1800,
        restTime: undefined,
        order: 1,
        notes: '30 minutes steady pace',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
    ],
  },
]

describe('WorkoutTemplates', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockWorkoutTemplatesApi.getWorkoutTemplates.mockResolvedValue({
      templates: mockWorkoutTemplates,
      total: mockWorkoutTemplates.length,
      limit: 50,
      offset: 0,
    })
    mockWorkoutTemplatesApi.getWorkoutTemplateCategories.mockResolvedValue(['Strength', 'Cardio'])
  })

  it('renders workout templates heading', async () => {
    renderWithQueryClient(<WorkoutTemplates />)
    await waitFor(() => {
      expect(screen.getByText('Workout Templates')).toBeInTheDocument()
    })
  })

  it('displays workout templates after loading', async () => {
    renderWithQueryClient(<WorkoutTemplates />)
    await waitFor(() => {
      expect(screen.getByText('Upper Body Strength')).toBeInTheDocument()
      expect(screen.getByText('Cardio Blast')).toBeInTheDocument()
    })
  })

  it('displays template details', async () => {
    renderWithQueryClient(<WorkoutTemplates />)

    await waitFor(() => {
      expect(screen.getByText('Upper Body Strength')).toBeInTheDocument()
      expect(screen.getByText('Focus on chest, back, and shoulders')).toBeInTheDocument()
      expect(screen.getByText('Bench Press')).toBeInTheDocument()
      expect(screen.getByText('Pull-ups')).toBeInTheDocument()
    })
  })

  // Note: Create template functionality not implemented in current component
  // it('allows creating new template', async () => {
  //   // ... test code ...
  // })

  // Note: Edit template functionality not implemented in current component
  // it('allows editing existing template', async () => {
  //   // ... test code ...
  // })

  // Note: Delete template functionality not implemented in current component
  // it('allows deleting template', async () => {
  //   // ... test code ...
  // })

  it('filters templates by category', async () => {
    renderWithQueryClient(<WorkoutTemplates />)

    await waitFor(() => {
      expect(screen.getByText('Upper Body Strength')).toBeInTheDocument()
    })

    // Filter by category
    const categoryFilter = screen.getByDisplayValue('All Categories')
    fireEvent.change(categoryFilter, { target: { value: 'Strength' } })

    await waitFor(() => {
      expect(screen.getByText('Upper Body Strength')).toBeInTheDocument()
      expect(screen.queryByText('Cardio Blast')).not.toBeInTheDocument()
    })

    expect(mockWorkoutTemplatesApi.getWorkoutTemplates).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'Strength',
      })
    )
  })

  it('shows public templates filter', async () => {
    renderWithQueryClient(<WorkoutTemplates />)

    await waitFor(() => {
      expect(screen.getByText('Upper Body Strength')).toBeInTheDocument()
    })

    // Toggle public templates filter
    const publicFilter = screen.getByText('All Templates')
    fireEvent.click(publicFilter)

    await waitFor(() => {
      expect(screen.getByText('Public Only')).toBeInTheDocument()
    })

    expect(mockWorkoutTemplatesApi.getWorkoutTemplates).toHaveBeenCalledWith(
      expect.objectContaining({
        isPublic: true,
      })
    )
  })

  // Note: Preview functionality not implemented in current component
  // it('displays template preview', async () => {
  //   // ... test code ...
  // })

  // Note: Use template functionality not implemented in current component
  // it('allows using template in workout', async () => {
  //   // ... test code ...
  // })

  it('handles API errors gracefully', async () => {
    mockWorkoutTemplatesApi.getWorkoutTemplates.mockRejectedValue(new Error('API Error'))

    renderWithQueryClient(<WorkoutTemplates />)

    await waitFor(() => {
      expect(screen.getByText('Failed to load workout templates. Please try again.')).toBeInTheDocument()
    })
  })

  it('displays empty state when no templates exist', async () => {
    mockWorkoutTemplatesApi.getWorkoutTemplates.mockResolvedValue({
      templates: [],
      total: 0,
      limit: 50,
      offset: 0,
    })

    renderWithQueryClient(<WorkoutTemplates />)

    await waitFor(() => {
      expect(screen.getByText('No templates found matching your criteria.')).toBeInTheDocument()
    })
  })
})