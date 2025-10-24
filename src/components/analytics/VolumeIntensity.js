import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Heading, Text, Flex } from '@chakra-ui/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useExerciseAnalytics } from '../../api/enhancedAnalytics';
export default function VolumeIntensity() {
    const { data: exerciseAnalytics, isLoading, error } = useExerciseAnalytics();
    if (error) {
        return (_jsx(Box, { p: 4, bg: "red.50", borderRadius: "md", border: "1px", borderColor: "red.200", children: _jsx(Text, { color: "red.600", children: "Failed to load volume and intensity. Please try again." }) }));
    }
    const chartData = exerciseAnalytics?.topExercises.slice(0, 10).map(exercise => ({
        name: exercise.name,
        totalSets: exercise.total_sets,
        avgWeight: exercise.avg_weight,
    })) || [];
    return (_jsxs(Box, { children: [_jsx(Heading, { size: "md", mb: 4, children: "Volume and Intensity" }), isLoading ? (_jsx(Flex, { justify: "center", py: 8, children: _jsx(Text, { children: "Loading..." }) })) : chartData.length === 0 ? (_jsx(Text, { textAlign: "center", py: 8, color: "gray.500", children: "No data available." })) : (_jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(BarChart, { data: chartData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "name" }), _jsx(YAxis, {}), _jsx(Tooltip, {}), _jsx(Bar, { dataKey: "totalSets", fill: "#319795" })] }) }))] }));
}
