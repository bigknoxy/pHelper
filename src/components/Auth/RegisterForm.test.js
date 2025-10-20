import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen, fireEvent } from '@testing-library/react';
import RegisterForm from './RegisterForm';
import { AuthContext } from '../../context/AuthContext';
const mockRegister = jest.fn();
function renderWithAuth() {
    return render(_jsx(AuthContext.Provider, { value: { userId: null, token: null, loading: false, error: null, migrated: false, login: jest.fn(), register: mockRegister, logout: jest.fn() }, children: _jsx(RegisterForm, {}) }));
}
test('renders register form and submits', () => {
    renderWithAuth();
    const email = screen.getByLabelText(/email/i);
    const password = screen.getByLabelText(/password/i);
    const button = screen.getByRole('button', { name: /register/i });
    fireEvent.change(email, { target: { value: 'new@example.com' } });
    fireEvent.change(password, { target: { value: 'newpass' } });
    fireEvent.click(button);
    expect(mockRegister).toHaveBeenCalledWith('new@example.com', 'newpass', true);
});
