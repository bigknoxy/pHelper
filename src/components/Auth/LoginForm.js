import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
export default function LoginForm() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const onSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await login(email, password, remember);
        }
        catch (err) {
            const e = err;
            setError((e && e.message) || 'Login failed');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("form", { onSubmit: onSubmit, "aria-label": "login-form", children: [error && _jsx("div", { role: "alert", style: { color: 'red' }, children: error }), _jsxs("div", { children: [_jsx("label", { htmlFor: "email", children: "Email" }), _jsx("input", { id: "email", value: email, onChange: e => setEmail(e.target.value), type: "email", "aria-label": "email" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "password", children: "Password" }), _jsx("input", { id: "password", value: password, onChange: e => setPassword(e.target.value), type: "password", "aria-label": "password" })] }), _jsx("div", { children: _jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: remember, onChange: e => setRemember(e.target.checked), "aria-label": "remember me" }), " Remember me"] }) }), _jsx("div", { children: _jsx("button", { type: "submit", children: loading ? 'Logging in...' : 'Log in' }) })] }));
}
