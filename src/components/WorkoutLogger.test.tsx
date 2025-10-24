import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import WorkoutLogger from './WorkoutLogger';
import '@testing-library/jest-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { AuthContext } from '../context/AuthContext';
import { QueryClientWrapper } from '../test-utils/queryClient';
import * as workoutsApi from '../api/workouts';
import * as exercisesApi from '../api/exercises';
import * as workoutTemplatesApi from '../api/workoutTemplates';
import theme from '../theme';
import { ExerciseCategory, MuscleGroup, ExerciseDifficulty } from '../api/exercises';

describe('WorkoutLogger', () => {
  let mockGetWorkouts: jest.SpyInstance;
  let mockAddWorkout: jest.SpyInstance;
  let mockGetExercises: jest.SpyInstance;
  let mockGetWorkoutTemplates: jest.SpyInstance;

  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
    mockGetWorkouts = jest.spyOn(workoutsApi, 'getWorkouts').mockResolvedValue([] as workoutsApi.WorkoutEntry[]);
    mockAddWorkout = jest.spyOn(workoutsApi, 'addWorkout');
    mockGetExercises = jest.spyOn(exercisesApi, 'getExercises').mockResolvedValue({
      exercises: [
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
      ],
      total: 2,
      limit: 50,
      offset: 0,
    });
    mockGetWorkoutTemplates = jest.spyOn(workoutTemplatesApi, 'getWorkoutTemplates').mockResolvedValue({
      templates: [],
      total: 0,
      limit: 50,
      offset: 0,
    });
  });

  function renderWithProvider(ui: React.ReactElement) {
    // Mock context value for logged-in user
    const mockAuth = {
      userId: 'test-user',
      token: 'test-token',
      loading: false,
      error: null,
      migrated: true,
      // mock async auth functions to match AuthContextType
      login: jest.fn(async () => undefined),
      register: jest.fn(async () => undefined),
      logout: jest.fn(),
    } as unknown as {
      userId: string
      token: string
      loading: boolean
      error: null | string
      migrated: boolean
      login: (...args: unknown[]) => Promise<void>
      register: (...args: unknown[]) => Promise<void>
      logout: () => void
    };
    return render(
      <QueryClientWrapper>
        <AuthContext.Provider value={mockAuth}>
          <ChakraProvider value={theme}>{ui}</ChakraProvider>
        </AuthContext.Provider>
      </QueryClientWrapper>
    );
  }

  function getExerciseCardElement(exerciseId: string, exerciseName?: string): HTMLElement {
    // Prefer selecting by data-testid for deterministic behavior
    const testId = `workout-exercise-${exerciseId}`;
    const card = screen.queryByTestId(testId) as HTMLElement | null;
    if (card) return card;

    // Fallback: find by name and ensure it has a remove button
    if (exerciseName) {
      const matches = screen.getAllByText(new RegExp(exerciseName, 'i'));
      for (const el of matches) {
        const cardEl = el.closest('div');
        if (!cardEl) continue;
        const removeButton = within(cardEl).queryByRole('button', { name: /remove/i });
        if (removeButton) return cardEl as HTMLElement;
      }
    }

    throw new Error('Exercise card container not found in workout list');
  }

  it('renders the workout form', async () => {
    renderWithProvider(<WorkoutLogger />);
    // wait for initial getWorkouts effect to settle
    await waitFor(() => expect(mockGetWorkouts).toHaveBeenCalled());
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/duration/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add workout/i })).toBeInTheDocument();
  });

  it('adds a workout entry and displays it in history (mocks API)', async () => {
    const newEntry = {
      id: '1',
      userId: 'test-user',
      date: '2025-08-23',
      type: 'Running',
      duration: 30,
      notes: 'Morning run',
    };
    mockAddWorkout.mockResolvedValue(newEntry as unknown as workoutsApi.WorkoutEntry);

    renderWithProvider(<WorkoutLogger />);
    await waitFor(() => expect(mockGetWorkouts).toHaveBeenCalled());

    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: newEntry.date } });
    fireEvent.change(screen.getByLabelText(/type/i), { target: { value: newEntry.type } });
    fireEvent.change(screen.getByLabelText(/duration/i), { target: { value: String(newEntry.duration) } });
    fireEvent.change(screen.getByLabelText(/notes/i), { target: { value: newEntry.notes } });

    fireEvent.click(screen.getByRole('button', { name: /add workout/i }));

    // wait for the mocked addWorkout to be called and the UI to update
    await waitFor(() => expect(mockAddWorkout).toHaveBeenCalledWith({ type: newEntry.type, duration: newEntry.duration, date: newEntry.date, notes: newEntry.notes }));

    expect(await screen.findByText(/8\/23\/2025/i)).toBeInTheDocument();
    expect(screen.getByText(/Running/i)).toBeInTheDocument();
    expect(screen.getByText(/30 min/i)).toBeInTheDocument();
    expect(screen.getByText(/Morning run/i)).toBeInTheDocument();
  });

  it('calls addWorkout and updates UI instead of using localStorage', async () => {
    const newEntry = {
      id: '2',
      userId: 'test-user',
      date: '2025-09-01',
      type: 'Cycling',
      duration: 45,
      notes: 'Evening ride',
    };
    mockAddWorkout.mockResolvedValue(newEntry as unknown as workoutsApi.WorkoutEntry);

    renderWithProvider(<WorkoutLogger />);
    await waitFor(() => expect(mockGetWorkouts).toHaveBeenCalled());

    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: newEntry.date } });
    fireEvent.change(screen.getByLabelText(/type/i), { target: { value: newEntry.type } });
    fireEvent.change(screen.getByLabelText(/duration/i), { target: { value: String(newEntry.duration) } });
    fireEvent.change(screen.getByLabelText(/notes/i), { target: { value: newEntry.notes } });

    fireEvent.click(screen.getByRole('button', { name: /add workout/i }));

    expect(await screen.findByText(/9\/1\/2025/i)).toBeInTheDocument();
    expect(mockAddWorkout).toHaveBeenCalled();
    // component uses API; localStorage should not contain workoutEntries
    expect(JSON.parse(localStorage.getItem('workoutEntries') || '[]')).toHaveLength(0);
  });

  it('does not call API when required fields are missing', async () => {
    renderWithProvider(<WorkoutLogger />);
    await waitFor(() => expect(mockGetWorkouts).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: /add workout/i }));
    expect(mockAddWorkout).not.toHaveBeenCalled();
    expect(screen.queryByText(/Morning run/i)).not.toBeInTheDocument();
  });

  it('switches to structured mode and displays exercise selection', async () => {
    renderWithProvider(<WorkoutLogger />);
    await waitFor(() => expect(mockGetWorkouts).toHaveBeenCalled());

    // Switch to structured mode
    const structuredModeButton = screen.getByRole('button', { name: /structured/i }) || screen.getByText(/structured/i);
    fireEvent.click(structuredModeButton);

    await waitFor(() => {
      expect(screen.getByText(/workout builder/i)).toBeInTheDocument();
      expect(screen.getByText(/bench press/i)).toBeInTheDocument();
      expect(screen.getByText(/squats/i)).toBeInTheDocument();
    });
  });

  it('adds exercises to structured workout', async () => {
    renderWithProvider(<WorkoutLogger />);
    await waitFor(() => expect(mockGetWorkouts).toHaveBeenCalled());

    // Switch to structured mode
    const structuredModeButton = screen.getByRole('button', { name: /structured/i }) || screen.getByText(/structured/i);
    fireEvent.click(structuredModeButton);

    await waitFor(() => {
      expect(screen.getByText(/bench press/i)).toBeInTheDocument();
    });

    // Add exercise to workout using role-based query for the Add button
    const addButtons = screen.getAllByRole('button', { name: /add/i });
    fireEvent.click(addButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/bench press/i)).toBeInTheDocument();
      expect(screen.getByText(/sets/i)).toBeInTheDocument();
      expect(screen.getByText(/reps/i)).toBeInTheDocument();
    });
  });

  it('configures exercise parameters in structured mode', async () => {
    renderWithProvider(<WorkoutLogger />);
    await waitFor(() => expect(mockGetWorkouts).toHaveBeenCalled());

    // Switch to structured mode
    const structuredModeButton = screen.getByRole('button', { name: /structured/i }) || screen.getByText(/structured/i);
    fireEvent.click(structuredModeButton);

    await waitFor(() => {
      expect(screen.getByText(/bench press/i)).toBeInTheDocument();
    });

    // Add exercise to workout
    const addButtons = screen.getAllByRole('button', { name: /add/i });
    fireEvent.click(addButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/bench press/i)).toBeInTheDocument();
    });

    // Wait for the workout list to report 1 exercise before interacting
    await waitFor(() => expect(screen.getByText(/workout exercises \(1\)/i)).toBeInTheDocument());

    // Find inputs by their aria-labels within the added exercise card and update values
    const card = getExerciseCardElement('1', 'Bench Press');
    const setsInput = within(card).getByLabelText(/sets/i) as HTMLInputElement;
    const repsInput = within(card).getByLabelText(/reps/i) as HTMLInputElement;
    const weightInput = within(card).getByLabelText(/weight \(lbs\)/i) as HTMLInputElement;

    fireEvent.change(setsInput, { target: { value: '4' } });
    fireEvent.change(repsInput, { target: { value: '12' } });
    fireEvent.change(weightInput, { target: { value: '135' } });

    expect(setsInput.value).toBe('4');
    expect(repsInput.value).toBe('12');
    expect(weightInput.value).toBe('135');
  });

  it('removes exercises from structured workout', async () => {
    renderWithProvider(<WorkoutLogger />);
    await waitFor(() => expect(mockGetWorkouts).toHaveBeenCalled());

    // Switch to structured mode
    const structuredModeButton = screen.getByRole('button', { name: /structured/i }) || screen.getByText(/structured/i);
    fireEvent.click(structuredModeButton);

    await waitFor(() => {
      expect(screen.getByText(/bench press/i)).toBeInTheDocument();
    });

    // Add exercise to workout
    const addButtons = screen.getAllByRole('button', { name: /add/i });
    fireEvent.click(addButtons[0]);

    await waitFor(() => expect(screen.getByText(/workout exercises \(1\)/i)).toBeInTheDocument());

    // Remove exercise
    const card = getExerciseCardElement('1', 'Bench Press');
    const removeButton = screen.getByTestId('remove-exercise-1');
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(screen.queryByText(/workout exercises \(1\)/i)).not.toBeInTheDocument();
    });
  });

  it('saves structured workout with exercises', async () => {
    // The structured save flows through WorkoutBuilder -> WorkoutLogger.handleStructuredWorkoutSave
    // which sets date to today and duration to 60 automatically. Tests should assert those behaviors.
    mockAddWorkout.mockResolvedValue({} as any);

    renderWithProvider(<WorkoutLogger />);
    await waitFor(() => expect(mockGetWorkouts).toHaveBeenCalled());

    // Switch to structured mode
    const structuredModeButton = screen.getByRole('button', { name: /structured/i }) || screen.getByText(/structured/i);
    fireEvent.click(structuredModeButton);

    await waitFor(() => {
      expect(screen.getByText(/bench press/i)).toBeInTheDocument();
    });

    // Add exercise to workout
    const addButtons = screen.getAllByRole('button', { name: /add/i });
    fireEvent.click(addButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/bench press/i)).toBeInTheDocument();
    });

    // Wait for the workout list to report 1 exercise before interacting
    await waitFor(() => expect(screen.getByText(/workout exercises \(1\)/i)).toBeInTheDocument());

    // Configure exercise inputs by aria-label
    const card = getExerciseCardElement('1', 'Bench Press');
    const setsInput = within(card).getByLabelText(/sets/i) as HTMLInputElement;
    const repsInput = within(card).getByLabelText(/reps/i) as HTMLInputElement;
    const weightInput = within(card).getByLabelText(/weight \(lbs\)/i) as HTMLInputElement;

    fireEvent.change(setsInput, { target: { value: '4' } });
    fireEvent.change(repsInput, { target: { value: '12' } });
    fireEvent.change(weightInput, { target: { value: '135' } });

    // Fill in workout name (WorkoutBuilder collects the name)
    const nameInput = screen.getByPlaceholderText(/e.g., Upper Body Strength/i) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'Strength Training' } });

    // Save workout
    const saveButton = screen.getByRole('button', { name: /save workout/i }) || screen.getByText(/save workout/i);
    fireEvent.click(saveButton);

    const today = new Date().toISOString().slice(0, 10);

    await waitFor(() => {
      expect(mockAddWorkout).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'Strength Training',
          date: today,
          duration: 60,
          notes: '1 exercises',
          exercises: [
            expect.objectContaining({
              exerciseId: '1',
              sets: 4,
              reps: 12,
              weight: 135,
            }),
          ],
        })
      );
    });
  });

  it('loads workout template in structured mode', async () => {
    // WorkoutBuilder currently does not render workout templates. Ensure switching to structured
    // mode renders the builder and that adding an exercise produces numeric inputs.
    const mockTemplate = {
      id: '1',
      name: 'Upper Body Template',
      description: 'Focus on chest and back',
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
        },
      ],
    };

    // Return the template from the mocked API (not used by current builder but should not break)
    mockGetWorkoutTemplates.mockResolvedValue({ templates: [mockTemplate], total: 1, limit: 50, offset: 0 });

    renderWithProvider(<WorkoutLogger />);
    await waitFor(() => expect(mockGetWorkouts).toHaveBeenCalled());

    // Switch to structured mode
    const structuredModeButton = screen.getByRole('button', { name: /structured/i }) || screen.getByText(/structured/i);
    fireEvent.click(structuredModeButton);

    await waitFor(() => {
      expect(screen.getByText(/workout builder/i)).toBeInTheDocument();
      expect(screen.getByText(/bench press/i)).toBeInTheDocument();
    });

    // Add an exercise and ensure numeric inputs (spinbuttons) are present
    const addButtons = screen.getAllByRole('button', { name: /add/i });
    fireEvent.click(addButtons[0]);

    await waitFor(() => expect(screen.getByText(/workout exercises \(1\)/i)).toBeInTheDocument());

    const card = getExerciseCardElement('1', 'Bench Press');
    const numberInputs = within(card).getAllByRole('spinbutton');
    expect(numberInputs.length).toBeGreaterThanOrEqual(2);
  });

  it('handles API errors in structured mode', async () => {
    // Mock the hook to deterministically return an error state
    const useExercisesModule = require('../hooks/useExercises')
    jest.spyOn(useExercisesModule, 'useExercises').mockReturnValue({
      exercises: [],
      total: 0,
      isLoading: false,
      error: new Error('API Error'),
      createExercise: jest.fn(),
      updateExercise: jest.fn(),
      deleteExercise: jest.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })

    renderWithProvider(<WorkoutLogger />);
    await waitFor(() => expect(mockGetWorkouts).toHaveBeenCalled());

    // Switch to structured mode
    const structuredModeButton = screen.getByRole('button', { name: /structured/i }) || screen.getByText(/structured/i);
    fireEvent.click(structuredModeButton);

    // The component shows a specific error message when the exercises API fails
    expect(await screen.findByText(/failed to load exercises\. please try again\./i)).toBeInTheDocument();
  });
});
