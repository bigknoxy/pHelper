import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Flex, useToken } from '@chakra-ui/react';
import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import WeightTracker from './components/WeightTracker';
import WorkoutLogger from './components/WorkoutLogger';
import TaskTracker from './components/TaskTracker';
import Dashboard from './components/Dashboard';
import TopBarAuth from './components/TopBarAuth';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import ErrorBoundary from './components/shared/ErrorBoundary';
import './App.css';
function App() {
    const { userId, loading } = useAuth();
    const tabs = [
        { label: "Dashboard", value: "dashboard" },
        { label: "Weight", value: "weight" },
        { label: "Workouts", value: "workouts" },
        { label: "Tasks", value: "tasks" },
    ];
    const [selected, setSelected] = useState("dashboard");
    // resolve color tokens for places that need concrete color strings (e.g. boxShadow, borders)
    const [primary500, primary400, primary300, surface900, surface800] = useToken('colors', [
        'primary.500',
        'primary.400',
        'primary.300',
        'surface.900',
        'surface.800',
    ]);
    // Simple client-side routing for /login and /register when not using react-router
    const path = typeof window !== 'undefined' ? window.location.pathname : '/';
    // If auth status is still being determined, show nothing to avoid flash
    if (loading) {
        return _jsx(Box, { p: 4, children: "Loading..." });
    }
    // If user is not authenticated and not explicitly navigating to /register,
    // show the login form by default.
    if (!userId && path !== '/register')
        return (_jsxs(Box, { p: 4, children: [_jsx(TopBarAuth, {}), _jsx(LoginForm, {})] }));
    if (!userId && path === '/register')
        return (_jsxs(Box, { p: 4, children: [_jsx(TopBarAuth, {}), _jsx(RegisterForm, {})] }));
    return (_jsx(ErrorBoundary, { children: _jsxs(Box, { bg: "background.900", minH: "100vh", color: "text.inverted", children: [_jsx(TopBarAuth, {}), _jsx(Flex, { as: "nav", gap: 4, p: 4, justify: "center", bg: surface900, borderRadius: "xl", boxShadow: "md", children: tabs.map((tab) => (_jsx(Box, { as: "button", role: "tab", "aria-selected": selected === tab.value, px: 5, py: 2, fontWeight: "bold", borderRadius: "md", bg: selected === tab.value ? primary400 : surface900, color: selected === tab.value ? "gray.900" : "gray.300", boxShadow: selected === tab.value ? `0 2px 8px ${primary500}80` : undefined, border: selected === tab.value ? `2px solid ${primary500}` : "2px solid transparent", transition: "all 0.2s", _hover: {
                            bg: selected === tab.value ? primary300 : surface800,
                            color: "white",
                            borderColor: primary500,
                        }, onClick: () => setSelected(tab.value), onKeyDown: (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setSelected(tab.value);
                            }
                        }, "aria-pressed": selected === tab.value, children: tab.label }, tab.value))) }), _jsxs(Box, { mt: 8, px: 4, children: [selected === "dashboard" && _jsx(Dashboard, {}), selected === "weight" && _jsx(WeightTracker, {}), selected === "workouts" && _jsx(WorkoutLogger, {}), selected === "tasks" && _jsx(TaskTracker, {})] })] }) }));
}
export default App;
