import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, SimpleGrid, Text, useBreakpointValue } from "@chakra-ui/react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
function getWeightMetrics() {
    const entries = JSON.parse(localStorage.getItem("weightEntries") || "[]");
    const latest = entries.length ? entries[entries.length - 1].weight : "-";
    const last7 = entries.slice(-7);
    const trend = last7.length > 1 ? (last7[last7.length - 1].weight - last7[0].weight) : 0;
    return { latest, trend, chart: last7 };
}
function getWorkoutMetrics() {
    const entries = JSON.parse(localStorage.getItem("workoutEntries") || "[]");
    const total = entries.length;
    const last = total ? entries[total - 1].date : "-";
    const types = entries.map((e) => e.type);
    const freqType = types.length ? types.sort((a, b) => types.filter((t) => t === a).length - types.filter((t) => t === b).length).pop() : "-";
    return { total, last, freqType };
}
function getTaskMetrics() {
    const entries = JSON.parse(localStorage.getItem("tasks") || "[]");
    const total = entries.length;
    const completed = entries.filter((e) => e.completed).length;
    const pending = total - completed;
    return { total, completed, pending };
}
export default function Dashboard() {
    const weight = getWeightMetrics();
    const workout = getWorkoutMetrics();
    const task = getTaskMetrics();
    const gridCols = useBreakpointValue({ base: 1, sm: 2, md: 3 });
    return (_jsx(Box, { p: { base: 2, md: 6 }, children: _jsxs(SimpleGrid, { columns: gridCols, gap: 4, children: [_jsxs(Box, { bg: "#23232a", p: 4, borderRadius: "xl", boxShadow: "md", children: [_jsx(Text, { fontSize: "lg", color: "gray.400", children: "Latest Weight" }), _jsxs(Text, { fontSize: "2xl", color: "teal.300", fontWeight: "bold", children: [weight.latest, " lb"] }), _jsxs(Text, { fontSize: "sm", color: "gray.500", children: ["Last 7 days: ", weight.trend >= 0 ? "+" : "", weight.trend, " lb"] }), _jsx(Box, { mt: 2, h: "80px", children: _jsx(ResponsiveContainer, { width: "100%", height: 80, children: _jsxs(LineChart, { data: weight.chart, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "date", hide: true }), _jsx(YAxis, { hide: true }), _jsx(Tooltip, {}), _jsx(Line, { type: "monotone", dataKey: "weight", stroke: "#38b2ac", dot: false })] }) }) })] }), _jsxs(Box, { bg: "#23232a", p: 4, borderRadius: "xl", boxShadow: "md", children: [_jsx(Text, { fontSize: "lg", color: "gray.400", children: "Workouts" }), _jsx(Text, { fontSize: "2xl", color: "teal.300", fontWeight: "bold", children: workout.total }), _jsxs(Text, { fontSize: "sm", color: "gray.500", children: ["Last: ", workout.last, _jsx("br", {}), "Most: ", workout.freqType] })] }), _jsxs(Box, { bg: "#23232a", p: 4, borderRadius: "xl", boxShadow: "md", children: [_jsx(Text, { fontSize: "lg", color: "gray.400", children: "Tasks" }), _jsxs(Text, { fontSize: "2xl", color: "teal.300", fontWeight: "bold", children: [task.completed, "/", task.total] }), _jsxs(Text, { fontSize: "sm", color: "gray.500", children: ["Pending: ", task.pending] })] })] }) }));
}
