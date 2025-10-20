import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box } from '@chakra-ui/react';
import { useState } from 'react';
import { Flex } from '@chakra-ui/react';
import WeightTracker from './components/WeightTracker';
import WorkoutLogger from './components/WorkoutLogger';
import TaskTracker from './components/TaskTracker';
import Dashboard from './components/Dashboard';
import TopBarAuth from './components/TopBarAuth';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import './App.css';
function App() {
    const tabs = [
        { label: "Dashboard", value: "dashboard" },
        { label: "Weight", value: "weight" },
        { label: "Workouts", value: "workouts" },
        { label: "Tasks", value: "tasks" },
    ];
    const [selected, setSelected] = useState("dashboard");
    // Simple client-side routing for /login and /register when not using react-router
    const path = typeof window !== 'undefined' ? window.location.pathname : '/';
    if (path === '/login')
        return (_jsxs(Box, { p: 4, children: [_jsx(TopBarAuth, {}), _jsx(LoginForm, {})] }));
    if (path === '/register')
        return (_jsxs(Box, { p: 4, children: [_jsx(TopBarAuth, {}), _jsx(RegisterForm, {})] }));
    return (_jsxs(Box, { bg: "#18181b", minH: "100vh", color: "white", children: [_jsx(TopBarAuth, {}), _jsx(Flex, { as: "nav", gap: 4, p: 4, justify: "center", bg: "#23232a", borderRadius: "xl", boxShadow: "md", children: tabs.map((tab) => (_jsx(Box, { as: "button", px: 5, py: 2, fontWeight: "bold", borderRadius: "md", bg: selected === tab.value ? "teal.400" : "#23232a", color: selected === tab.value ? "gray.900" : "gray.300", boxShadow: selected === tab.value ? "0 2px 8px #0bc5ea80" : undefined, border: selected === tab.value ? "2px solid #0bc5ea" : "2px solid transparent", transition: "all 0.2s", _hover: {
                        bg: selected === tab.value ? "teal.300" : "#2d2d38",
                        color: "white",
                        borderColor: "#0bc5ea",
                    }, onClick: () => setSelected(tab.value), children: tab.label }, tab.value))) }), _jsxs(Box, { mt: 8, px: 4, children: [selected === "dashboard" && _jsx(Dashboard, {}), selected === "weight" && _jsx(WeightTracker, {}), selected === "workouts" && _jsx(WorkoutLogger, {}), selected === "tasks" && _jsx(TaskTracker, {})] })] }));
}
export default App;
