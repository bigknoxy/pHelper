import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Box, Stack, HStack, Input, Button, Link, Text, Heading, useToken, } from '@chakra-ui/react';
function passwordStrengthLabel(pwd) {
    if (!pwd)
        return 'Too short';
    let score = 0;
    if (pwd.length >= 8)
        score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd))
        score++;
    if (/[0-9]/.test(pwd))
        score++;
    if (/[^A-Za-z0-9]/.test(pwd))
        score++;
    return score <= 1 ? 'Weak' : score === 2 ? 'Fair' : score === 3 ? 'Good' : 'Strong';
}
export default function LoginForm() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    useEffect(() => {
        emailRef.current?.focus();
    }, []);
    // resolve token hex for inline styles that need concrete color strings
    const [primary500Hex] = useToken('colors', ['primary.500']);
    const validateEmail = (value) => {
        const v = value.trim();
        if (!v)
            return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(v))
            return 'Please enter a valid email address';
        return null;
    };
    const validatePassword = (value) => {
        if (!value)
            return 'Password is required';
        if (value.length < 6)
            return 'Password must be at least 6 characters';
        return null;
    };
    const validateForm = () => {
        const errors = {};
        const e = validateEmail(email);
        if (e)
            errors.email = e;
        const p = validatePassword(password);
        if (p)
            errors.password = p;
        setFieldErrors(errors);
        if (errors.email) {
            emailRef.current?.focus();
        }
        else if (errors.password) {
            passwordRef.current?.focus();
        }
        return Object.keys(errors).length === 0;
    };
    const handleEmailChange = (e) => {
        const sanitized = e.target.value.replace(/[\u0000-\u001F\u007F]/g, '').trim();
        setEmail(sanitized);
        const err = validateEmail(sanitized);
        if (sanitized === '') {
            setFieldErrors(prev => ({ ...prev, email: undefined }));
        }
        else if (err) {
            setFieldErrors(prev => ({ ...prev, email: err }));
        }
        else if (fieldErrors.email) {
            setFieldErrors(prev => ({ ...prev, email: undefined }));
        }
    };
    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        if (fieldErrors.password)
            setFieldErrors(prev => ({ ...prev, password: undefined }));
    };
    const onSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!validateForm())
            return;
        setLoading(true);
        try {
            await login(email, password, remember);
        }
        catch (err) {
            const ex = err;
            if (ex.message && (ex.message.includes('credentials') || ex.message.includes('401'))) {
                setError('Invalid email or password. Please try again.');
            }
            else if (ex.message && (ex.message.toLowerCase().includes('network') || ex.message.includes('fetch'))) {
                setError('Network error. Please check your connection and try again.');
            }
            else {
                setError('An unexpected error occurred. Please try again later.');
            }
        }
        finally {
            setLoading(false);
        }
    };
    const pwdLabel = passwordStrengthLabel(password);
    return (_jsx(Box, { minH: "100vh", bg: "background.900", display: "flex", alignItems: "center", justifyContent: "center", px: { base: 4, sm: 6, md: 8 }, children: _jsx(Box, { w: "full", maxW: { base: 'sm', sm: 'md' }, bg: "surface.900", rounded: "xl", shadow: "xl", p: { base: 6, sm: 8 }, border: "1px solid", borderColor: "gray.700", children: _jsxs(Stack, { gap: 6, align: "stretch", children: [_jsxs(Stack, { gap: 2, textAlign: "center", children: [_jsx(Heading, { size: { base: 'md', sm: 'lg' }, color: "white", children: "Welcome Back" }), _jsx(Text, { color: "gray.400", fontSize: { base: 'xs', sm: 'sm' }, children: "Sign in to your fitness tracking account" })] }), _jsxs(HStack, { gap: 2, justify: "center", children: [_jsx(Text, { color: "primary.500", fontSize: "xs", "aria-hidden": true, children: "\uD83D\uDD12" }), _jsx(Text, { color: "gray.400", fontSize: "xs", children: "Secure, encrypted connection" })] }), _jsx("form", { onSubmit: onSubmit, noValidate: true, "aria-label": "login-form", children: _jsxs(Stack, { gap: 4, children: [error && (_jsxs(Box, { bg: "red.900", color: "red.100", p: 3, borderRadius: "md", role: "alert", "aria-live": "polite", border: "1px solid", borderColor: "red.700", children: [_jsx(Text, { fontSize: "sm", fontWeight: "medium", children: "Error" }), _jsx(Text, { fontSize: "sm", children: error })] })), _jsxs(Box, { children: [_jsx("label", { style: { display: 'block', marginBottom: 4 }, children: _jsx(Text, { color: "gray.300", fontSize: "sm", fontWeight: "medium", children: "Email Address" }) }), _jsx(Input, { ref: emailRef, id: "email", name: "email", type: "email", value: email, onChange: handleEmailChange, bg: "background.900", border: "1px solid", borderColor: fieldErrors.email ? 'red.500' : 'gray.600', color: "white", _focus: { borderColor: 'primary.500', boxShadow: `0 0 0 1px ${primary500Hex}` }, _hover: { borderColor: 'gray.500' }, placeholder: "Enter your email", "aria-label": "email", "aria-describedby": fieldErrors.email ? 'email-error' : undefined, "aria-invalid": !!fieldErrors.email, autoComplete: "email", disabled: loading }), fieldErrors.email && (_jsx(Text, { id: "email-error", color: "red.400", fontSize: "xs", mt: 1, children: fieldErrors.email }))] }), _jsxs(Box, { children: [_jsx("label", { style: { display: 'block', marginBottom: 4 }, children: _jsx(Text, { color: "gray.300", fontSize: "sm", fontWeight: "medium", children: "Password" }) }), _jsxs(Box, { position: "relative", children: [_jsx(Input, { ref: passwordRef, id: "password", name: "password", type: showPassword ? 'text' : 'password', value: password, onChange: handlePasswordChange, bg: "background.900", border: "1px solid", borderColor: fieldErrors.password ? 'red.500' : 'gray.600', color: "white", _focus: { borderColor: 'primary.500', boxShadow: `0 0 0 1px ${primary500Hex}` }, _hover: { borderColor: 'gray.500' }, placeholder: "Enter your password", "aria-label": "password", "aria-describedby": fieldErrors.password ? 'password-error' : undefined, "aria-invalid": !!fieldErrors.password, autoComplete: "current-password", disabled: loading, pr: "40px" }), _jsx(Button, { position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", "aria-label": showPassword ? 'Hide password' : 'Show password', variant: "ghost", color: "gray.400", _hover: { color: 'white' }, onClick: () => setShowPassword(!showPassword), disabled: loading, size: "sm", p: 1, type: "button", children: showPassword ? '👁️' : '👁️‍🗨️' })] }), fieldErrors.password && (_jsx(Text, { id: "password-error", color: "red.400", fontSize: "xs", mt: 1, children: fieldErrors.password })), _jsxs(Text, { color: "gray.400", fontSize: "xs", mt: 2, "aria-live": "polite", children: ["Password strength: ", _jsx(Text, { as: "span", color: "white", children: pwdLabel })] })] }), _jsxs(HStack, { justify: "space-between", w: "full", children: [_jsxs("label", { htmlFor: "remember-me", style: { display: 'flex', alignItems: 'center', gap: 8 }, children: [_jsx("input", { id: "remember-me", name: "remember", type: "checkbox", checked: remember, onChange: (e) => setRemember(e.target.checked), "aria-label": "remember me", disabled: loading }), _jsx(Text, { fontSize: "sm", color: "gray.300", children: "Remember me" })] }), _jsx(Link, { color: "primary.500", fontSize: "sm", href: "/forgot-password", _hover: { color: 'accent.500', textDecoration: 'underline' }, children: "Forgot password?" })] }), _jsx(Button, { type: "submit", w: "full", bg: "primary.500", color: "white", fontWeight: "semibold", py: 3, borderRadius: "md", _hover: {
                                        bg: 'accent.500',
                                        transform: 'translateY(-1px)',
                                        boxShadow: `0 4px 12px ${primary500Hex}33`,
                                    }, _active: { transform: 'translateY(0)' }, transition: "all 0.2s", loading: loading, loadingText: "Signing in...", "aria-busy": loading, disabled: loading, children: "Sign In" })] }) }), _jsxs(HStack, { justify: "center", gap: 1, children: [_jsx(Text, { color: "gray.400", fontSize: "sm", children: "Don't have an account?" }), _jsx(Link, { color: "primary.500", fontSize: "sm", fontWeight: "medium", href: "/register", _hover: { color: 'accent.500', textDecoration: 'underline' }, children: "Sign up" })] })] }) }) }));
}
