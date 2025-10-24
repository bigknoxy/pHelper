import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, Heading, Text, SimpleGrid, HStack, VStack, Flex, Spinner, } from '@chakra-ui/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, } from 'recharts';
import { usePersonalRecords, usePersonalRecordStats } from '../hooks/usePersonalRecords';
import { useExercises } from '../hooks/useExercises';
import { RecordType } from '../api/personalRecords';
import { useEnhancedWorkoutAnalytics, useExerciseAnalytics } from '../api/enhancedAnalytics';
import Card from './shared/Card';
import MuscleGroupBalance from './analytics/MuscleGroupBalance';
import WorkoutFrequency from './analytics/WorkoutFrequency';
import VolumeIntensity from './analytics/VolumeIntensity';
export default function PerformanceAnalytics() {
    const [selectedExerciseId, setSelectedExerciseId] = useState('');
    const [selectedRecordType, setSelectedRecordType] = useState(RecordType.MAX_WEIGHT);
    const { records, isLoading: recordsLoading, error: recordsError } = usePersonalRecords({
        exerciseId: selectedExerciseId || undefined,
        recordType: selectedRecordType,
    });
    const { data: stats, isLoading: statsLoading, error: statsError } = usePersonalRecordStats(selectedExerciseId || undefined);
    const { exercises } = useExercises();
    const { data: workoutAnalytics } = useEnhancedWorkoutAnalytics();
    const { data: exerciseAnalytics } = useExerciseAnalytics();
    const chartData = records.map(record => ({
        date: new Date(record.date).toLocaleDateString(),
        value: record.value,
        exercise: record.exercise.name,
    }));
    const statsData = stats?.exerciseStats.map(stat => ({
        exercise: exercises.find(e => e.id === stat.exerciseId)?.name || 'Unknown',
        maxValue: stat._max.value,
        count: stat._count.id,
    })) || [];
    const isLoading = recordsLoading || statsLoading;
    if (recordsError || statsError) {
        return (_jsx(Box, { p: 4, bg: "red.50", borderRadius: "md", border: "1px", borderColor: "red.200", children: _jsx(Text, { color: "red.600", children: "Failed to load performance analytics. Please try again." }) }));
    }
    return (_jsx(Box, { children: _jsxs(VStack, { gap: 6, align: "stretch", children: [_jsxs(Box, { children: [_jsx(Heading, { size: "lg", mb: 2, children: "Performance Analytics" }), _jsx(Text, { color: "gray.600", children: "Track your personal records and progress over time" })] }), _jsx(Box, { children: _jsxs(HStack, { gap: 4, children: [_jsxs("select", { value: selectedExerciseId, onChange: (e) => setSelectedExerciseId(e.target.value), style: {
                                    padding: '8px',
                                    borderRadius: '6px',
                                    border: '1px solid #4A5568',
                                    backgroundColor: '#2D3748',
                                    color: 'white'
                                }, children: [_jsx("option", { value: "", children: "All Exercises" }), exercises.map(exercise => (_jsx("option", { value: exercise.id, children: exercise.name }, exercise.id)))] }), _jsxs("select", { value: selectedRecordType, onChange: (e) => setSelectedRecordType(e.target.value), style: {
                                    padding: '8px',
                                    borderRadius: '6px',
                                    border: '1px solid #4A5568',
                                    backgroundColor: '#2D3748',
                                    color: 'white'
                                }, children: [_jsx("option", { value: "MAX_WEIGHT", children: "Max Weight" }), _jsx("option", { value: "MAX_REPS", children: "Max Reps" }), _jsx("option", { value: "MAX_SETS", children: "Max Sets" }), _jsx("option", { value: "PERSONAL_BEST", children: "Personal Best" })] })] }) }), _jsxs(SimpleGrid, { columns: { base: 1, lg: 2 }, gap: 6, children: [_jsxs(Box, { children: [_jsx(Heading, { size: "md", mb: 4, children: "Progress Over Time" }), recordsLoading ? (_jsx(Flex, { justify: "center", py: 8, children: _jsx(Spinner, { size: "lg", color: "teal.500" }) })) : chartData.length === 0 ? (_jsx(Text, { textAlign: "center", py: 8, color: "gray.500", children: "No data available for the selected filters." })) : (_jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(LineChart, { data: chartData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "date" }), _jsx(YAxis, {}), _jsx(Tooltip, {}), _jsx(Line, { type: "monotone", dataKey: "value", stroke: "#319795", strokeWidth: 2 })] }) }))] }), _jsx(WorkoutFrequency, {}), _jsx(MuscleGroupBalance, {}), _jsx(VolumeIntensity, {}), _jsxs(Box, { children: [_jsx(Heading, { size: "md", mb: 4, children: "Exercise Statistics" }), statsLoading ? (_jsx(Flex, { justify: "center", py: 8, children: _jsx(Spinner, { size: "lg", color: "teal.500" }) })) : statsData.length === 0 ? (_jsx(Text, { textAlign: "center", py: 8, color: "gray.500", children: "No statistics available." })) : (_jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(BarChart, { data: statsData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "exercise" }), _jsx(YAxis, {}), _jsx(Tooltip, {}), _jsx(Bar, { dataKey: "maxValue", fill: "#319795" })] }) }))] })] }), _jsxs(Box, { children: [_jsx(Heading, { size: "md", mb: 4, children: "Recent Personal Records" }), recordsLoading ? (_jsx(Flex, { justify: "center", py: 8, children: _jsx(Spinner, { size: "lg", color: "teal.500" }) })) : records.length === 0 ? (_jsx(Text, { textAlign: "center", py: 8, color: "gray.500", children: "No recent records found." })) : (_jsx(SimpleGrid, { columns: { base: 1, md: 2, lg: 3 }, gap: 4, children: records.slice(0, 6).map(record => (_jsx(Box, { p: 4, borderWidth: 1, borderRadius: "md", borderColor: "gray.200", children: _jsxs(VStack, { gap: 2, align: "stretch", children: [_jsx(Text, { fontSize: "sm", fontWeight: "medium", children: record.exercise.name }), _jsxs(Text, { fontSize: "lg", fontWeight: "bold", color: "teal.500", children: [record.value, " ", selectedRecordType === 'MAX_WEIGHT' ? 'lbs' : selectedRecordType === 'MAX_REPS' ? 'reps' : ''] }), _jsx(Text, { fontSize: "xs", color: "gray.500", children: new Date(record.date).toLocaleDateString() })] }) }, record.id))) }))] })] }) }));
}
function OverviewCard({ title, value, helpText }) {
    return (_jsx(Card, { children: _jsxs(VStack, { gap: 2, align: "stretch", p: 4, children: [_jsx(Text, { fontSize: "sm", fontWeight: "medium", children: title }), _jsx(Text, { fontSize: "2xl", fontWeight: "bold", color: "teal.500", children: value }), helpText && (_jsx(Text, { fontSize: "xs", color: "gray.600", children: helpText }))] }) }));
}
