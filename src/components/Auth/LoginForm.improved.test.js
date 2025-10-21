import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginForm from './LoginForm.improved';
import { AuthContext } from '../../context/AuthContext';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
const mockLogin = jest.fn();
function renderWithAuth() {
    return render(_jsx(AuthContext.Provider, { value: {
            userId: null,
            token: null,
            loading: false,
            error: null,
            migrated: false,
            login: mockLogin,
            register: jest.fn(),
            logout: jest.fn()
        }, children: _jsx(ChakraProvider, { value: defaultSystem, children: _jsx(LoginForm, {}) }) }));
}
describe('LoginForm Improved', () => {
    beforeEach(() => {
        mockLogin.mockClear();
    });
    test('renders improved login form with all elements', () => {
        renderWithAuth();
        // Check for main heading
        expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
        // Check for form fields
        expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument();
        // Check for buttons and links
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /forgot password/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
        // Check for security badge
        expect(screen.getByText(/secure, encrypted connection/i)).toBeInTheDocument();
    });
    test('validates email field correctly', async () => {
        renderWithAuth();
        const emailInput = screen.getByLabelText(/email address/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });
        // Submit with empty email
        fireEvent.click(submitButton);
        await waitFor(() => {
            expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        });
        // Submit with invalid email
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
        fireEvent.click(submitButton);
        await waitFor(() => {
            expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
        });
        // Clear error on valid input
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        await waitFor(() => {
            expect(screen.queryByText(/please enter a valid email address/i)).not.toBeInTheDocument();
        });
    });
    test('validates password field correctly', async () => {
        renderWithAuth();
        const passwordInput = screen.getByLabelText(/^password$/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });
        // Submit with empty password
        fireEvent.click(submitButton);
        await waitFor(() => {
            expect(screen.getByText(/password is required/i)).toBeInTheDocument();
        });
        // Submit with short password
        fireEvent.change(passwordInput, { target: { value: '123' } });
        fireEvent.click(submitButton);
        await waitFor(() => {
            expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
        });
        // Clear error on valid input
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        await waitFor(() => {
            expect(screen.queryByText(/password must be at least 6 characters/i)).not.toBeInTheDocument();
        });
    });
    test('toggles password visibility', () => {
        renderWithAuth();
        const passwordInput = screen.getByLabelText(/^password$/i);
        const toggleButton = screen.getByRole('button', { name: /show password/i });
        // Initially password should be hidden
        expect(passwordInput.type).toBe('password');
        // Click to show password
        fireEvent.click(toggleButton);
        expect(passwordInput.type).toBe('text');
        expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument();
        // Click to hide password
        fireEvent.click(toggleButton);
        expect(passwordInput.type).toBe('password');
        expect(screen.getByRole('button', { name: /show password/i })).toBeInTheDocument();
    });
    test('submits form successfully with valid data', async () => {
        renderWithAuth();
        const emailInput = screen.getByLabelText(/email address/i);
        const passwordInput = screen.getByLabelText(/^password$/i);
        const rememberCheckbox = screen.getByLabelText(/remember me/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });
        // Fill form with valid data
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(rememberCheckbox);
        // Submit form
        fireEvent.click(submitButton);
        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123', true);
        });
    });
    test('handles login errors correctly', async () => {
        const errorMessage = 'Invalid credentials';
        mockLogin.mockRejectedValue(new Error(errorMessage));
        renderWithAuth();
        const emailInput = screen.getByLabelText(/email address/i);
        const passwordInput = screen.getByLabelText(/^password$/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });
        // Fill and submit form
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
        fireEvent.click(submitButton);
        await waitFor(() => {
            expect(screen.getByRole('alert')).toBeInTheDocument();
            expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
        });
    });
    test('shows loading state during submission', async () => {
        mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
        renderWithAuth();
        const emailInput = screen.getByLabelText(/email address/i);
        const passwordInput = screen.getByLabelText(/^password$/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });
        // Fill and submit form
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);
        // Check loading state
        expect(screen.getByRole('button', { name: /signing in/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
        // Wait for completion
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
        });
    });
    test('disables form fields during loading', async () => {
        mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
        renderWithAuth();
        const emailInput = screen.getByLabelText(/email address/i);
        const passwordInput = screen.getByLabelText(/^password$/i);
        const rememberCheckbox = screen.getByLabelText(/remember me/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });
        // Fill and submit form
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);
        // Check that fields are disabled during loading
        expect(emailInput).toBeDisabled();
        expect(passwordInput).toBeDisabled();
        expect(rememberCheckbox).toBeDisabled();
        // Wait for completion
        await waitFor(() => {
            expect(emailInput).not.toBeDisabled();
            expect(passwordInput).not.toBeDisabled();
            expect(rememberCheckbox).not.toBeDisabled();
        });
    });
    test('has proper accessibility attributes', () => {
        renderWithAuth();
        const emailInput = screen.getByLabelText(/email address/i);
        const passwordInput = screen.getByLabelText(/^password$/i);
        // Check form attributes
        expect(emailInput).toHaveAttribute('autoComplete', 'email');
        expect(passwordInput).toHaveAttribute('autoComplete', 'current-password');
        expect(emailInput).toHaveAttribute('type', 'email');
        expect(passwordInput).toHaveAttribute('type', 'password');
    });
    test('clears field errors when user starts typing', async () => {
        renderWithAuth();
        const emailInput = screen.getByLabelText(/email address/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });
        // Trigger validation error
        fireEvent.click(submitButton);
        await waitFor(() => {
            expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        });
        // Start typing in email field
        fireEvent.change(emailInput, { target: { value: 't' } });
        // Error should be cleared
        await waitFor(() => {
            expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
        });
    });
});
