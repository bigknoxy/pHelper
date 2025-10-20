import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAuth } from '../context/AuthContext';
export default function TopBarAuth() {
    const { userId, logout } = useAuth();
    if (userId) {
        return (_jsxs("div", { children: [_jsx("span", { children: userId }), _jsx("button", { onClick: logout, children: "Logout" })] }));
    }
    return (_jsxs("div", { children: [_jsx("a", { href: "/login", children: "Login" }), ' | ', _jsx("a", { href: "/register", children: "Register" })] }));
}
