import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WorkoutLogger from './WorkoutLogger';
import '@testing-library/jest-dom';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { AuthContext } from '../context/AuthContext';
import * as workoutsApi from '../api/workouts';

describe('WorkoutLogger', () => {
  let mockGetWorkouts: jest.SpyInstance;
  let mockAddWorkout: jest.SpyInstance;

  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
    mockGetWorkouts = jest.spyOn(workoutsApi, 'getWorkouts').mockResolvedValue([] as any);
    mockAddWorkout = jest.spyOn(workoutsApi, 'addWorkout');
  });

  function renderWithProvider(ui: React.ReactElement) {
    // Mock context value for logged-in user
    const mockAuth = {
      userId: 'test-user',
      token: 'test-token',
      loading: false,
      error: null,
      migrated: true,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
    } as any;
    return render(
      <AuthContext.Provider value={mockAuth}>
        <ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>
      </AuthContext.Provider>
    );
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
    mockAddWorkout.mockResolvedValue(newEntry as any);

    renderWithProvider(<WorkoutLogger />);
    await waitFor(() => expect(mockGetWorkouts).toHaveBeenCalled());

    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: newEntry.date } });
    fireEvent.change(screen.getByLabelText(/type/i), { target: { value: newEntry.type } });
    fireEvent.change(screen.getByLabelText(/duration/i), { target: { value: String(newEntry.duration) } });
    fireEvent.change(screen.getByLabelText(/notes/i), { target: { value: newEntry.notes } });

    fireEvent.click(screen.getByRole('button', { name: /add workout/i }));

    // wait for the mocked addWorkout to be called and the UI to update
    await waitFor(() => expect(mockAddWorkout).toHaveBeenCalledWith(newEntry.type, newEntry.duration, newEntry.date, newEntry.notes));

    expect(await screen.findByText(/2025-08-23/i)).toBeInTheDocument();
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
    mockAddWorkout.mockResolvedValue(newEntry as any);

    renderWithProvider(<WorkoutLogger />);
    await waitFor(() => expect(mockGetWorkouts).toHaveBeenCalled());

    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: newEntry.date } });
    fireEvent.change(screen.getByLabelText(/type/i), { target: { value: newEntry.type } });
    fireEvent.change(screen.getByLabelText(/duration/i), { target: { value: String(newEntry.duration) } });
    fireEvent.change(screen.getByLabelText(/notes/i), { target: { value: newEntry.notes } });

    fireEvent.click(screen.getByRole('button', { name: /add workout/i }));

    expect(await screen.findByText(/2025-09-01/i)).toBeInTheDocument();
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
});
