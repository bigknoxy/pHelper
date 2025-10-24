import { jsx as _jsx } from "react/jsx-runtime";
import { screen, waitFor } from '@testing-library/react';
import { render } from '../test-utils/customRender';
import PerformanceAnalytics from './PerformanceAnalytics';
// Mock hooks that would perform network calls so tests run without XHR
jest.mock('../hooks/usePersonalRecords', () => ({
    usePersonalRecords: () => ({
        records: [
            { id: 'r1', date: '2025-01-15', value: 225, exercise: { id: 'e1', name: 'Bench Press' } },
        ],
        total: 1,
        isLoading: false,
        error: null,
        deleteRecord: jest.fn(),
        isDeleting: false,
    }),
    usePersonalRecordStats: () => ({
        data: {
            exerciseStats: [
                { exerciseId: 'e1', _max: { value: 225 }, _count: { id: 15 } },
            ],
        },
        isLoading: false,
        error: null,
    }),
}));
jest.mock('../hooks/useExercises', () => ({
    useExercises: () => ({
        exercises: [{ id: 'e1', name: 'Bench Press' }],
        total: 1,
        isLoading: false,
        error: null,
    }),
}));
describe('PerformanceAnalytics', () => {
    it('renders performance analytics heading', async () => {
        render(_jsx(PerformanceAnalytics, {}));
        await waitFor(() => {
            expect(screen.getByText('Performance Analytics')).toBeInTheDocument();
        });
    });
    it('shows charts headings and recent personal records', async () => {
        render(_jsx(PerformanceAnalytics, {}));
        await waitFor(() => {
            expect(screen.getByText('Progress Over Time')).toBeInTheDocument();
            expect(screen.getByText('Exercise Statistics')).toBeInTheDocument();
            expect(screen.getByText('Recent Personal Records')).toBeInTheDocument();
            // Recent record content
            expect(screen.getAllByText('Bench Press').length).toBeGreaterThan(0);
            expect(screen.getByText(/225\s*lbs/)).toBeInTheDocument();
            expect(screen.getByText('1/15/2025')).toBeInTheDocument();
        });
    });
    it('shows error UI when hooks report an error', async () => {
        const personalModule = require('../hooks/usePersonalRecords');
        const usePersonalRecordsSpy = jest.spyOn(personalModule, 'usePersonalRecords').mockReturnValue({ records: [], isLoading: false, error: new Error('failed') });
        const usePersonalRecordStatsSpy = jest.spyOn(personalModule, 'usePersonalRecordStats').mockReturnValue({ data: { exerciseStats: [] }, isLoading: false, error: null });
        render(_jsx(PerformanceAnalytics, {}));
        await waitFor(() => {
            expect(screen.getByText('Failed to load performance analytics. Please try again.')).toBeInTheDocument();
        });
        usePersonalRecordsSpy.mockRestore();
        usePersonalRecordStatsSpy.mockRestore();
    });
});
