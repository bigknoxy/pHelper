import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import WorkoutBuilder from './WorkoutBuilder'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ChakraProvider } from '@chakra-ui/react'
import * as exercisesApi from '../api/exercises'
import * as workoutTemplatesApi from '../api/workoutTemplates'
import { ExerciseCategory, MuscleGroup, ExerciseDifficulty } from '../api/exercises'
import theme from '../theme'

// Mock the APIs
jest.mock('../api/exercises')
jest.mock('../api/workoutTemplates')

const mockExercisesApi = exercisesApi as jest.Mocked<typeof exercisesApi>
const mockWorkoutTemplatesApi = workoutTemplatesApi as jest.Mocked<typeof workoutTemplatesApi>

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
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

const mockExercises = [
  {
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
  {
    id: '2',
    name: 'Squats',
    description: 'Lower body compound movement',
    instructions: 'Stand with feet shoulder-width, lower by bending knees',
    category: ExerciseCategory.STRENGTH,
    muscleGroups: [MuscleGroup.QUADRICEPS, MuscleGroup.GLUTES],
    equipment: ['Barbell'],
    difficulty: ExerciseDifficulty.INTERMEDIATE,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
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
]

describe('WorkoutBuilder', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockExercisesApi.getExercises.mockResolvedValue({
      exercises: mockExercises,
      total: mockExercises.length,
      limit: 50,
      offset: 0,
    })
    mockWorkoutTemplatesApi.getWorkoutTemplates.mockResolvedValue({
      templates: [],
      total: 0,
      limit: 50,
      offset: 0,
    })
  })

  it('renders workout builder heading', async () => {
    renderWithQueryClient(<WorkoutBuilder />)
    await waitFor(() => {
      expect(screen.getByText('Workout Builder')).toBeInTheDocument()
    })
  })

  it('displays exercises after loading', async () => {
    renderWithQueryClient(<WorkoutBuilder />)
    await waitFor(() => {
      expect(screen.getByText('Bench Press')).toBeInTheDocument()
      expect(screen.getByText('Squats')).toBeInTheDocument()
    })
  })

  it('allows adding exercises to workout', async () => {
    renderWithQueryClient(<WorkoutBuilder />)

    await waitFor(() => {
      expect(screen.getByText('Bench Press')).toBeInTheDocument()
    })

    // Find and click the add button for Bench Press
    const addButtons = screen.getAllByText('Add')
    fireEvent.click(addButtons[0])

    await waitFor(() => {
      expect(screen.getByText('Bench Press')).toBeInTheDocument()
      expect(screen.getByText('Sets')).toBeInTheDocument()
      expect(screen.getByText('Reps')).toBeInTheDocument()
    })
  })

  it('allows configuring exercise parameters', async () => {
    renderWithQueryClient(<WorkoutBuilder />)

    await waitFor(() => {
      expect(screen.getByText('Bench Press')).toBeInTheDocument()
    })

    // Add exercise to workout
    const addButtons = screen.getAllByText('Add')
    fireEvent.click(addButtons[0])

    await waitFor(() => {
      expect(screen.getByText('Bench Press')).toBeInTheDocument()
    })

    // Configure sets and reps
    const setsInput = screen.getByLabelText('Sets')
    const repsInput = screen.getByLabelText('Reps')

    fireEvent.change(setsInput, { target: { value: '4' } })
    fireEvent.change(repsInput, { target: { value: '12' } })

    expect(setsInput).toHaveValue(4)
    expect(repsInput).toHaveValue(12)
  })

  it('allows removing exercises from workout', async () => {
    renderWithQueryClient(<WorkoutBuilder />)

    await waitFor(() => {
      expect(screen.getByText('Bench Press')).toBeInTheDocument()
    })

    // Add exercise to workout
    const addButtons = screen.getAllByText('Add')
    fireEvent.click(addButtons[0])

    await waitFor(() => {
      expect(screen.getByText('Bench Press')).toBeInTheDocument()
    })

    // Remove exercise
    const removeButtons = screen.getAllByText('Remove')
    fireEvent.click(removeButtons[0])

    await waitFor(() => {
      expect(screen.queryByTestId('workout-exercise-1')).not.toBeInTheDocument()
    })
  })

  it('saves workout', async () => {
    const mockOnSave = jest.fn()

    renderWithQueryClient(<WorkoutBuilder onSave={mockOnSave} />)

    await waitFor(() => {
      expect(screen.getByText('Bench Press')).toBeInTheDocument()
    })

    // Add exercise to workout
    const addButtons = screen.getAllByText('Add')
    fireEvent.click(addButtons[0])

    await waitFor(() => {
      expect(screen.getByText('Bench Press')).toBeInTheDocument()
    })

    // Fill in workout details
    const nameInput = screen.getByPlaceholderText('e.g., Upper Body Strength')

    fireEvent.change(nameInput, { target: { value: 'Test Workout' } })

    // Save workout
    const saveButton = screen.getByText('Save Workout')
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Workout',
          exercises: expect.any(Array),
        })
      )
    })
  })

  it('displays workout summary', async () => {
    renderWithQueryClient(<WorkoutBuilder />)

    await waitFor(() => {
      expect(screen.getByText('Bench Press')).toBeInTheDocument()
    })

    // Add exercise to workout
    const addButtons = screen.getAllByText('Add')
    fireEvent.click(addButtons[0])

    await waitFor(() => {
      expect(screen.getByText('Workout Exercises (1)')).toBeInTheDocument()
    })
  })

  it('handles API errors gracefully', async () => {
    mockExercisesApi.getExercises.mockRejectedValue(new Error('API Error'))

    renderWithQueryClient(<WorkoutBuilder />)

    await waitFor(() => {
      expect(screen.getByText('Failed to load exercises. Please try again.')).toBeInTheDocument()
    })
  })

  it('filters exercises in workout builder', async () => {
    renderWithQueryClient(<WorkoutBuilder />)

    await waitFor(() => {
      expect(screen.getByText('Bench Press')).toBeInTheDocument()
    })

    // Filter by category
    const categoryFilter = screen.getByDisplayValue('All Categories')
    fireEvent.change(categoryFilter, { target: { value: 'STRENGTH' } })

    await waitFor(() => {
      expect(screen.getByText('Bench Press')).toBeInTheDocument()
      expect(screen.getByText('Squats')).toBeInTheDocument()
    })

    expect(mockExercisesApi.getExercises).toHaveBeenCalledWith(
      expect.objectContaining({
        category: ExerciseCategory.STRENGTH,
      })
    )
  })

  it('allows configuring cardio exercise parameters', async () => {
    renderWithQueryClient(<WorkoutBuilder />)

    await waitFor(() => {
      expect(screen.getByText('Running')).toBeInTheDocument()
    })

    // Add cardio exercise to workout
    const addButtons = screen.getAllByText('Add')
    fireEvent.click(addButtons[2]) // Running is the third exercise

    await waitFor(() => {
      expect(screen.getByText('Running')).toBeInTheDocument()
      expect(screen.getByText('Duration (sec)')).toBeInTheDocument()
      expect(screen.getByText('Distance (km)')).toBeInTheDocument()
      expect(screen.getByText('Calories')).toBeInTheDocument()
    })

    // Configure cardio parameters
    const durationInput = screen.getByLabelText('Duration (sec)')
    const distanceInput = screen.getByLabelText('Distance (km)')
    const caloriesInput = screen.getByLabelText('Calories')

    fireEvent.change(durationInput, { target: { value: '1800' } })
    fireEvent.change(distanceInput, { target: { value: '5' } })
    fireEvent.change(caloriesInput, { target: { value: '300' } })

    expect(durationInput).toHaveValue(1800)
    expect(distanceInput).toHaveValue(5)
    expect(caloriesInput).toHaveValue(300)
  })
})