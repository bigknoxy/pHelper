import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen, fireEvent } from '@testing-library/react';
import WorkoutLogger from './WorkoutLogger';
import '@testing-library/jest-dom';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
describe('WorkoutLogger', () => {
    beforeEach(() => {
        localStorage.clear();
    });
    function renderWithProvider(ui) {
        return render(_jsx(ChakraProvider, { value: defaultSystem, children: ui }));
    }
    it('renders the workout form', () => {
        renderWithProvider(_jsx(WorkoutLogger, {}));
        expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/type/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/duration/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add workout/i })).toBeInTheDocument();
    });
    it('adds a workout entry and displays it in history', () => {
        renderWithProvider(_jsx(WorkoutLogger, {}));
        fireEvent.change(screen.getByLabelText(/date/i), { target: { value: '2025-08-23' } });
        fireEvent.change(screen.getByLabelText(/type/i), { target: { value: 'Running' } });
        fireEvent.change(screen.getByLabelText(/duration/i), { target: { value: '30' } });
        fireEvent.change(screen.getByLabelText(/notes/i), { target: { value: 'Morning run' } });
        fireEvent.click(screen.getByRole('button', { name: /add workout/i }));
        expect(screen.getByText(/2025-08-23/i)).toBeInTheDocument();
        expect(screen.getByText(/Running/i)).toBeInTheDocument();
        expect(screen.getByText(/30 min/i)).toBeInTheDocument();
        expect(screen.getByText(/Morning run/i)).toBeInTheDocument();
    });
    it('persists workout entries in LocalStorage', () => {
        renderWithProvider(_jsx(WorkoutLogger, {}));
        fireEvent.change(screen.getByLabelText(/date/i), { target: { value: '2025-08-23' } });
        fireEvent.change(screen.getByLabelText(/type/i), { target: { value: 'Cycling' } });
        fireEvent.change(screen.getByLabelText(/duration/i), { target: { value: '45' } });
        fireEvent.change(screen.getByLabelText(/notes/i), { target: { value: 'Evening ride' } });
        fireEvent.click(screen.getByRole('button', { name: /add workout/i }));
        expect(JSON.parse(localStorage.getItem('workoutEntries') || '[]')).toHaveLength(1);
    });
    it('does not add entry if required fields are missing', () => {
        renderWithProvider(_jsx(WorkoutLogger, {}));
        fireEvent.click(screen.getByRole('button', { name: /add workout/i }));
        expect(screen.queryByText(/Morning run/i)).not.toBeInTheDocument();
    });
});
