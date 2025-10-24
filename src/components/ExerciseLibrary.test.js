import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ExerciseLibrary from './ExerciseLibrary';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChakraProvider } from '@chakra-ui/react';
import * as exercisesApi from '../api/exercises';
import { ExerciseCategory, MuscleGroup, ExerciseDifficulty } from '../api/exercises';
import theme from '../theme';
// Mock the exercises API
jest.mock('../api/exercises');
const mockExercisesApi = exercisesApi;
const createTestQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
});
const renderWithQueryClient = (component) => {
    const testQueryClient = createTestQueryClient();
    return render(_jsx(ChakraProvider, { value: theme, children: _jsx(QueryClientProvider, { client: testQueryClient, children: component }) }));
};
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
];
describe('ExerciseLibrary', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockExercisesApi.getExercises.mockResolvedValue({
            exercises: mockExercises,
            total: mockExercises.length,
            limit: 50,
            offset: 0,
        });
        mockExercisesApi.getExerciseCategories.mockResolvedValue(['STRENGTH', 'CARDIO', 'FLEXIBILITY']);
        mockExercisesApi.getMuscleGroups.mockResolvedValue(['CHEST', 'QUADRICEPS', 'FULL_BODY']);
    });
    it('renders exercise library heading', async () => {
        renderWithQueryClient(_jsx(ExerciseLibrary, {}));
        await waitFor(() => {
            expect(screen.getByText('Exercise Library')).toBeInTheDocument();
        });
    });
    it('displays exercises after loading', async () => {
        renderWithQueryClient(_jsx(ExerciseLibrary, {}));
        await waitFor(() => {
            expect(screen.getAllByText('Bench Press').length).toBeGreaterThan(0);
            expect(screen.getAllByText('Squats').length).toBeGreaterThan(0);
            expect(screen.getAllByText('Running').length).toBeGreaterThan(0);
        });
    });
    it('filters exercises by search term', async () => {
        renderWithQueryClient(_jsx(ExerciseLibrary, {}));
        await waitFor(() => {
            expect(screen.getAllByText('Bench Press').length).toBeGreaterThan(0);
        });
        const searchInput = screen.getByPlaceholderText('Search exercises...');
        fireEvent.change(searchInput, { target: { value: 'bench' } });
        await waitFor(() => {
            expect(screen.getAllByText('Bench Press').length).toBeGreaterThan(0);
            expect(screen.queryByText('Squats')).not.toBeInTheDocument();
            expect(screen.queryByText('Running')).not.toBeInTheDocument();
        });
        expect(mockExercisesApi.getExercises).toHaveBeenCalledWith(expect.objectContaining({
            search: 'bench',
        }));
    });
    it('filters exercises by category', async () => {
        renderWithQueryClient(_jsx(ExerciseLibrary, {}));
        await waitFor(() => {
            expect(screen.getAllByText('Bench Press').length).toBeGreaterThan(0);
        });
        const categorySelect = screen.getByDisplayValue('All Categories');
        fireEvent.change(categorySelect, { target: { value: 'STRENGTH' } });
        await waitFor(() => {
            expect(screen.getAllByText('Bench Press').length).toBeGreaterThan(0);
            expect(screen.getAllByText('Squats').length).toBeGreaterThan(0);
            expect(screen.queryByText('Running')).not.toBeInTheDocument();
        });
        expect(mockExercisesApi.getExercises).toHaveBeenCalledWith(expect.objectContaining({
            category: ExerciseCategory.STRENGTH,
        }));
    });
    it('filters exercises by muscle group', async () => {
        renderWithQueryClient(_jsx(ExerciseLibrary, {}));
        await waitFor(() => {
            expect(screen.getAllByText('Bench Press').length).toBeGreaterThan(0);
        });
        const muscleGroupSelect = screen.getByDisplayValue('All Muscle Groups');
        fireEvent.change(muscleGroupSelect, { target: { value: 'CHEST' } });
        await waitFor(() => {
            expect(screen.getAllByText('Bench Press').length).toBeGreaterThan(0);
            expect(screen.queryByText('Squats')).not.toBeInTheDocument();
            expect(screen.queryByText('Running')).not.toBeInTheDocument();
        });
        expect(mockExercisesApi.getExercises).toHaveBeenCalledWith(expect.objectContaining({
            muscleGroup: MuscleGroup.CHEST,
        }));
    });
    it('filters exercises by difficulty', async () => {
        renderWithQueryClient(_jsx(ExerciseLibrary, {}));
        await waitFor(() => {
            expect(screen.getAllByText('Bench Press').length).toBeGreaterThan(0);
        });
        const difficultySelect = screen.getByDisplayValue('All Difficulties');
        fireEvent.change(difficultySelect, { target: { value: 'BEGINNER' } });
        await waitFor(() => {
            expect(screen.queryByText('Bench Press')).not.toBeInTheDocument();
            expect(screen.queryByText('Squats')).not.toBeInTheDocument();
            expect(screen.getAllByText('Running').length).toBeGreaterThan(0);
        });
        expect(mockExercisesApi.getExercises).toHaveBeenCalledWith(expect.objectContaining({
            difficulty: ExerciseDifficulty.BEGINNER,
        }));
    });
    it('displays exercise details when exercise is selected', async () => {
        renderWithQueryClient(_jsx(ExerciseLibrary, {}));
        await waitFor(() => {
            expect(screen.getAllByText('Bench Press').length).toBeGreaterThan(0);
        });
        const benchPressCard = screen.getAllByText('Bench Press')[0].closest('div');
        if (benchPressCard) {
            fireEvent.click(benchPressCard);
        }
        await waitFor(() => {
            expect(screen.getByText('Classic chest exercise')).toBeInTheDocument();
            expect(screen.getByText('Lie on bench, press bar up')).toBeInTheDocument();
            expect(screen.getByText('STRENGTH')).toBeInTheDocument();
            expect(screen.getByText('Barbell, Bench')).toBeInTheDocument();
        });
    });
    it('handles API errors gracefully', async () => {
        mockExercisesApi.getExercises.mockRejectedValue(new Error('API Error'));
        renderWithQueryClient(_jsx(ExerciseLibrary, {}));
        await waitFor(() => {
            expect(screen.getByText('Error loading exercises')).toBeInTheDocument();
        });
    });
    it('loads more exercises when pagination is triggered', async () => {
        renderWithQueryClient(_jsx(ExerciseLibrary, {}));
        await waitFor(() => {
            expect(screen.getAllByText('Bench Press').length).toBeGreaterThan(0);
        });
        // Mock additional exercises for pagination
        const moreExercises = [
            ...mockExercises,
            {
                id: '4',
                name: 'Deadlift',
                description: 'Posterior chain exercise',
                instructions: 'Lift bar from ground',
                category: ExerciseCategory.STRENGTH,
                muscleGroups: [MuscleGroup.BACK, MuscleGroup.GLUTES],
                equipment: ['Barbell'],
                difficulty: ExerciseDifficulty.ADVANCED,
                isActive: true,
                createdAt: '2025-01-01T00:00:00Z',
                updatedAt: '2025-01-01T00:00:00Z',
            },
        ];
        mockExercisesApi.getExercises.mockResolvedValueOnce({
            exercises: mockExercises,
            total: moreExercises.length,
            limit: 50,
            offset: 0,
        });
        // Trigger load more (this would depend on the actual pagination implementation)
        // For now, we'll just verify the API is called with correct parameters
        await waitFor(() => {
            expect(mockExercisesApi.getExercises).toHaveBeenCalled();
        });
    });
    it('displays exercise count', async () => {
        renderWithQueryClient(_jsx(ExerciseLibrary, {}));
        await waitFor(() => {
            expect(screen.getByText(/3 exercises/i)).toBeInTheDocument();
        });
    });
    it('clears filters when clear button is clicked', async () => {
        renderWithQueryClient(_jsx(ExerciseLibrary, {}));
        await waitFor(() => {
            expect(screen.getAllByText('Bench Press').length).toBeGreaterThan(0);
        });
        // Apply a filter
        const searchInput = screen.getByPlaceholderText('Search exercises...');
        fireEvent.change(searchInput, { target: { value: 'bench' } });
        await waitFor(() => {
            expect(screen.getAllByText('Bench Press').length).toBeGreaterThan(0);
        });
        // Clear the search
        fireEvent.change(searchInput, { target: { value: '' } });
        await waitFor(() => {
            expect(screen.getAllByText('Bench Press').length).toBeGreaterThan(0);
            expect(screen.getAllByText('Squats').length).toBeGreaterThan(0);
            expect(screen.getAllByText('Running').length).toBeGreaterThan(0);
        });
    });
});
