import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAuth } from '../context/AuthContext';
export default function TopBarAuth() {
    const { userId, logout } = useAuth();
    if (userId) {
        return (_jsxs("div", { children: [_jsx("span", { children: userId }), _jsx("button", { onClick: logout, children: "Logout" })] }));
    }
    return (
    // When not authenticated we no longer show login/register links because the
    // app will render the login form by default. Keep TopBar minimal.
    _jsx("div", {}));
}
