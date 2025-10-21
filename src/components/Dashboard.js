import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { Box, SimpleGrid, Text, useBreakpointValue, Heading } from "@chakra-ui/react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useWeights } from "../hooks/useWeights";
import { useWorkouts } from "../hooks/useWorkouts";
import { useTasks } from "../hooks/useTasks";
import Card from "./shared/Card";
import LoadingSpinner from "./shared/LoadingSpinner";
import ErrorMessage from "./shared/ErrorMessage";
import ChartContainer from "./shared/ChartContainer";
import Button from "./shared/Button";
export default function Dashboard() {
    const { weights = [], isLoading: weightsLoading, error: weightsError } = useWeights();
    const { workouts = [], isLoading: workoutsLoading, error: workoutsError } = useWorkouts();
    const { tasks = [], isLoading: tasksLoading, error: tasksError } = useTasks();
    const isLoading = weightsLoading || workoutsLoading || tasksLoading;
    const error = weightsError || workoutsError || tasksError;
    const [timeRange, setTimeRange] = useState('7');
    const gridCols = useBreakpointValue({ base: 1, sm: 2, md: 3, lg: 4 });
    const handleTimeRangeChange = (e) => setTimeRange(e.target.value);
    // compute metrics (last 7 days) - memoized for performance
    const metrics = useMemo(() => {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        const last7Weights = (weights || []).filter((w) => w.date >= sevenDaysAgo);
        const latestWeight = last7Weights.length > 0 ? last7Weights[last7Weights.length - 1].weight : null;
        const weightTrend = last7Weights.length > 1 ? last7Weights[last7Weights.length - 1].weight - last7Weights[0].weight : 0;
        const totalWorkouts = (workouts || []).length;
        const lastWorkout = (workouts && workouts.length > 0) ? workouts[workouts.length - 1].date : null;
        const workoutTypes = (workouts || []).map((w) => w.type);
        const mostFrequentWorkout = workoutTypes.length > 0 ? workoutTypes.reduce((a, b) => workoutTypes.filter(v => v === a).length >= workoutTypes.filter(v => v === b).length ? a : b) : null;
        const totalTasks = (tasks || []).length;
        const completedTasks = (tasks || []).filter((t) => Boolean(t.completed)).length;
        const pendingTasks = totalTasks - completedTasks;
        return {
            latestWeight,
            weightTrend,
            totalWorkouts,
            lastWorkout,
            mostFrequentWorkout,
            totalTasks,
            completedTasks,
            pendingTasks,
            last7Weights
        };
    }, [weights, workouts, tasks]);
    if (isLoading) {
        return _jsx(LoadingSpinner, { message: "Loading dashboard..." });
    }
    if (error) {
        const message = error?.message || 'Failed to load dashboard data. Please try again later.';
        return _jsx(ErrorMessage, { title: "Dashboard Error", message: message });
    }
    const exportData = () => {
        const data = {
            weights,
            workouts,
            tasks,
            exportDate: new Date().toISOString(),
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fitness-data-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
    };
    const { latestWeight, weightTrend, totalWorkouts, lastWorkout, mostFrequentWorkout, totalTasks, completedTasks, pendingTasks, last7Weights } = metrics;
    return (_jsxs(Box, { p: { base: 4, md: 6 }, children: [_jsxs(Box, { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 6, children: [_jsx(Heading, { as: "h1", size: "lg", color: "white", children: "Fitness Dashboard" }), _jsxs(Box, { display: "flex", gap: 3, alignItems: "center", children: [_jsx("label", { htmlFor: "time-range-select", style: { display: 'none' }, children: "Time range" }), _jsxs("select", { id: "time-range-select", value: timeRange, onChange: handleTimeRangeChange, style: { background: 'surface.900', color: 'text.inverted', borderColor: 'muted.700', padding: '6px 10px', borderRadius: 6 }, children: [_jsx("option", { value: "7", children: "Last 7 days" }), _jsx("option", { value: "30", children: "Last 30 days" }), _jsx("option", { value: "90", children: "Last 90 days" })] }), _jsx(Button, { onClick: exportData, size: "sm", colorScheme: "teal", variant: "outline", "aria-label": "Export dashboard data", children: "Export Data" })] })] }), _jsxs(SimpleGrid, { columns: gridCols, gap: 4, children: [_jsxs(Card, { variant: "highlighted", as: "section", "aria-labelledby": "latest-weight-heading", children: [_jsx(Text, { id: "latest-weight-heading", fontSize: "lg", color: "gray.400", mb: 2, children: "Latest Weight" }), _jsx(Text, { fontSize: "3xl", color: "primary.500", fontWeight: "bold", children: latestWeight ? `${latestWeight} lb` : 'No data' }), _jsxs(Text, { fontSize: "sm", color: "gray.500", mt: 1, children: ["Last 7 days: ", weightTrend >= 0 ? '+' : '', weightTrend, " lb"] }), last7Weights.length > 0 && (_jsx(Box, { mt: 3, children: _jsx(ChartContainer, { title: "Weight Trend", height: 100, children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(LineChart, { data: last7Weights, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "muted.700" }), _jsx(XAxis, { dataKey: "date", stroke: "#9CA3AF", fontSize: 10, tickFormatter: (value) => new Date(value).toLocaleDateString() }), _jsx(YAxis, { stroke: "#9CA3AF", fontSize: 10, domain: ["dataMin - 2", "dataMax + 2"] }), _jsx(Tooltip, { contentStyle: {
                                                        backgroundColor: '#1F2937',
                                                        border: '1px solid #374151',
                                                        borderRadius: '6px'
                                                    }, labelStyle: { color: '#F3F4F6' } }), _jsx(Line, { type: "monotone", dataKey: "weight", stroke: "primary.500", strokeWidth: 2, dot: { fill: 'primary.500', r: 3 }, activeDot: { r: 5 } })] }) }) }) }))] }), _jsxs(Card, { as: "section", "aria-labelledby": "workouts-heading", children: [_jsx(Text, { id: "workouts-heading", fontSize: "lg", color: "gray.400", mb: 2, children: "Total Workouts" }), _jsx(Text, { fontSize: "3xl", color: "primary.500", fontWeight: "bold", children: totalWorkouts }), _jsxs(Text, { fontSize: "sm", color: "gray.500", mt: 1, children: ["Last: ", lastWorkout || 'No data'] }), _jsxs(Text, { fontSize: "sm", color: "gray.500", children: ["Most frequent: ", mostFrequentWorkout || 'No data'] })] }), _jsxs(Card, { as: "section", "aria-labelledby": "tasks-heading", children: [_jsx(Text, { id: "tasks-heading", fontSize: "lg", color: "gray.400", mb: 2, children: "Task Progress" }), _jsxs(Text, { fontSize: "3xl", color: "primary.500", fontWeight: "bold", children: [completedTasks, "/", totalTasks] }), _jsxs(Text, { fontSize: "sm", color: "gray.500", mt: 1, children: ["Pending: ", pendingTasks] }), totalTasks > 0 && (_jsxs(Box, { mt: 3, children: [_jsx(Box, { bg: "surface.800", borderRadius: "md", overflow: "hidden", children: _jsx(Box, { h: 4, bg: "primary.500", style: { width: `${(completedTasks / totalTasks) * 100}%` }, transition: "width 0.3s ease" }) }), _jsxs(Text, { fontSize: "xs", color: "gray.500", mt: 1, children: [Math.round((completedTasks / totalTasks) * 100), "% complete"] })] }))] }), _jsxs(Card, { as: "section", "aria-labelledby": "quick-stats-heading", children: [_jsx(Text, { id: "quick-stats-heading", fontSize: "lg", color: "gray.400", mb: 2, children: "Quick Stats" }), _jsxs(Box, { children: [_jsxs(Text, { fontSize: "sm", color: "gray.300", mb: 1, children: ["\uD83C\uDFC3\u200D\u2642\uFE0F Workouts this week: ", (workouts || []).filter((w) => {
                                                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                                                return new Date(w.date) >= weekAgo;
                                            }).length] }), _jsxs(Text, { fontSize: "sm", color: "gray.300", mb: 1, children: ["\uD83D\uDCCB Tasks completed today: ", (tasks || []).filter((t) => {
                                                const today = new Date().toDateString();
                                                return Boolean(t.completed) && new Date(t.createdAt || '').toDateString() === today;
                                            }).length] }), _jsx(Text, { fontSize: "sm", color: "gray.300", children: "\uD83C\uDFAF Goal streak: 3 days" })] })] })] })] }));
}
