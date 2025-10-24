import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Heading, Text, Flex } from '@chakra-ui/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useEnhancedWorkoutAnalytics } from '../../api/enhancedAnalytics';
export default function WorkoutFrequency() {
    const { data: workoutAnalytics, isLoading, error } = useEnhancedWorkoutAnalytics();
    if (error) {
        return (_jsx(Box, { p: 4, bg: "red.50", borderRadius: "md", border: "1px", borderColor: "red.200", children: _jsx(Text, { color: "red.600", children: "Failed to load workout frequency. Please try again." }) }));
    }
    const chartData = workoutAnalytics?.workoutFrequency.map(item => ({
        date: new Date(item.date).toLocaleDateString(),
        count: item.count,
        duration: item.total_duration,
    })) || [];
    return (_jsxs(Box, { children: [_jsx(Heading, { size: "md", mb: 4, children: "Workout Frequency" }), isLoading ? (_jsx(Flex, { justify: "center", py: 8, children: _jsx(Text, { children: "Loading..." }) })) : chartData.length === 0 ? (_jsx(Text, { textAlign: "center", py: 8, color: "gray.500", children: "No data available." })) : (_jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(LineChart, { data: chartData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "date" }), _jsx(YAxis, {}), _jsx(Tooltip, {}), _jsx(Line, { type: "monotone", dataKey: "count", stroke: "#319795", strokeWidth: 2 })] }) }))] }));
}
