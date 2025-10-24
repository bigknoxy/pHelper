import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Heading, Text, Flex } from '@chakra-ui/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useExerciseAnalytics } from '../../api/enhancedAnalytics';
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C', '#8DD1E1', '#D084D0'];
export default function MuscleGroupBalance() {
    const { data: exerciseAnalytics, isLoading, error } = useExerciseAnalytics();
    if (error) {
        return (_jsx(Box, { p: 4, bg: "red.50", borderRadius: "md", border: "1px", borderColor: "red.200", children: _jsx(Text, { color: "red.600", children: "Failed to load muscle group balance. Please try again." }) }));
    }
    const chartData = exerciseAnalytics?.muscleGroups.map((group, index) => ({
        name: group.muscle_group,
        value: group.total_sets,
        color: COLORS[index % COLORS.length],
    })) || [];
    return (_jsxs(Box, { children: [_jsx(Heading, { size: "md", mb: 4, children: "Muscle Group Balance" }), isLoading ? (_jsx(Flex, { justify: "center", py: 8, children: _jsx(Text, { children: "Loading..." }) })) : chartData.length === 0 ? (_jsx(Text, { textAlign: "center", py: 8, color: "gray.500", children: "No data available." })) : (_jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: chartData, cx: "50%", cy: "50%", labelLine: false, label: ({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`, outerRadius: 80, fill: "#8884d8", dataKey: "value", children: chartData.map((entry, index) => (_jsx(Cell, { fill: entry.color }, `cell-${index}`))) }), _jsx(Tooltip, {}), _jsx(Legend, {})] }) }))] }));
}
