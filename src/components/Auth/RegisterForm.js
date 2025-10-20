import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
export default function RegisterForm() {
    const { register } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const onSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await register(email, password, true);
        }
        catch (err) {
            const e = err;
            setError((e && e.message) || 'Registration failed');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("form", { onSubmit: onSubmit, "aria-label": "register-form", children: [error && _jsx("div", { role: "alert", style: { color: 'red' }, children: error }), _jsxs("div", { children: [_jsx("label", { htmlFor: "reg-email", children: "Email" }), _jsx("input", { id: "reg-email", value: email, onChange: e => setEmail(e.target.value), type: "email", "aria-label": "email" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "reg-password", children: "Password" }), _jsx("input", { id: "reg-password", value: password, onChange: e => setPassword(e.target.value), type: "password", "aria-label": "password" })] }), _jsx("div", { children: _jsx("button", { type: "submit", "aria-label": "register button", disabled: loading, children: loading ? 'Registering...' : 'Register' }) })] }));
}
