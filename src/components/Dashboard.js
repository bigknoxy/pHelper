import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { Box, SimpleGrid, Text, useBreakpointValue, Heading, VStack, HStack, Badge, IconButton } from "@chakra-ui/react";
import { Settings, TrendingUp, Target, Award } from "lucide-react";
import { useWeights } from "../hooks/useWeights";
import { useWorkouts } from "../hooks/useWorkouts";
import { useTasks } from "../hooks/useTasks";
import { useWeightAnalytics, useWorkoutAnalytics, useTaskAnalytics, useDashboardOverview, useInvalidateAnalytics } from "../hooks/useAnalytics";
import { useGoalAnalytics } from "../hooks/useGoals";
import { useDashboardStore } from "../stores/dashboardStore";
import Card from "./shared/Card";
import LoadingSpinner from "./shared/LoadingSpinner";
import ErrorMessage from "./shared/ErrorMessage";
import InteractiveChart from "./charts/InteractiveChart";
import GoalProgressIndicator from "./charts/GoalProgressIndicator";
import PersonalRecords from "./charts/PersonalRecords";
export default function Dashboard() {
    // Dashboard store for state management
    const { timeRange, chartType, selectedMetrics, showMovingAverage, showTrendLine, setTimeRange } = useDashboardStore();
    // Analytics hooks
    const { data: weightAnalytics, isLoading: weightLoading, error: weightError } = useWeightAnalytics(timeRange);
    const { data: workoutAnalytics, isLoading: workoutLoading, error: workoutError } = useWorkoutAnalytics(timeRange);
    const { data: taskAnalytics, isLoading: taskLoading, error: taskError } = useTaskAnalytics(timeRange);
    const { data: overview, isLoading: overviewLoading, error: overviewError } = useDashboardOverview(timeRange);
    const { data: goals, isLoading: goalsLoading, error: goalsError } = useGoalAnalytics();
    const { invalidateAllAnalytics } = useInvalidateAnalytics();
    // Legacy hooks for basic data (keeping for compatibility)
    const { isLoading: weightsLoading } = useWeights();
    const { isLoading: workoutsLoading } = useWorkouts();
    const { isLoading: tasksLoading } = useTasks();
    const isLoading = weightsLoading || workoutsLoading || tasksLoading || weightLoading || workoutLoading || taskLoading || overviewLoading || goalsLoading;
    const error = weightError || workoutError || taskError || overviewError || goalsError;
    const gridCols = useBreakpointValue({ base: 1, sm: 2, md: 3, lg: 4 });
    // Transform real goals data for the component
    const realGoals = useMemo(() => {
        if (!goals)
            return [];
        return goals.map(goal => ({
            id: goal.id,
            title: goal.title,
            target: goal.target,
            current: goal.current,
            unit: goal.unit,
            category: goal.category.toLowerCase(),
            status: goal.status.toLowerCase(),
            deadline: goal.deadline || undefined
        }));
    }, [goals]);
    // Transform real analytics data into personal records format
    const realRecords = useMemo(() => {
        const records = [];
        // Weight records
        if (weightAnalytics?.personalRecords) {
            const { personalRecords } = weightAnalytics;
            if (personalRecords.heaviest) {
                records.push({
                    id: 'weight-heaviest',
                    type: 'weight',
                    title: 'Heaviest Weight',
                    value: personalRecords.heaviest,
                    unit: 'lbs',
                    date: 'All time',
                    description: 'Personal best weight'
                });
            }
            if (personalRecords.lightest) {
                records.push({
                    id: 'weight-lightest',
                    type: 'weight',
                    title: 'Lightest Weight',
                    value: personalRecords.lightest,
                    unit: 'lbs',
                    date: 'All time',
                    description: 'Personal best weight'
                });
            }
            if (personalRecords.biggestLoss && personalRecords.biggestLoss < 0) {
                records.push({
                    id: 'weight-biggest-loss',
                    type: 'weight',
                    title: 'Biggest Loss',
                    value: Math.abs(personalRecords.biggestLoss),
                    unit: 'lbs',
                    date: 'All time',
                    description: 'Best weight loss in one period'
                });
            }
        }
        // Workout records
        if (workoutAnalytics?.personalRecords) {
            const { personalRecords } = workoutAnalytics;
            if (personalRecords.longestWorkout) {
                records.push({
                    id: 'workout-longest',
                    type: 'workout',
                    title: 'Longest Workout',
                    value: personalRecords.longestWorkout,
                    unit: 'minutes',
                    date: 'All time',
                    description: 'Personal best workout duration'
                });
            }
            if (personalRecords.mostWorkoutsInDay) {
                records.push({
                    id: 'workout-most-in-day',
                    type: 'workout',
                    title: 'Most Workouts in a Day',
                    value: personalRecords.mostWorkoutsInDay,
                    unit: 'count',
                    date: 'All time',
                    description: 'Most productive workout day'
                });
            }
            if (personalRecords.longestStreak) {
                records.push({
                    id: 'workout-longest-streak',
                    type: 'workout',
                    title: 'Longest Workout Streak',
                    value: personalRecords.longestStreak,
                    unit: 'days',
                    date: 'All time',
                    description: 'Longest consecutive workout streak'
                });
            }
        }
        // Task records
        if (taskAnalytics?.personalRecords) {
            const { personalRecords } = taskAnalytics;
            if (personalRecords.mostTasksCompletedInDay) {
                records.push({
                    id: 'task-most-in-day',
                    type: 'task',
                    title: 'Most Tasks in a Day',
                    value: personalRecords.mostTasksCompletedInDay,
                    unit: 'count',
                    date: 'All time',
                    description: 'Most productive task day'
                });
            }
            if (personalRecords.longestTaskStreak) {
                records.push({
                    id: 'task-longest-streak',
                    type: 'task',
                    title: 'Longest Task Streak',
                    value: personalRecords.longestTaskStreak,
                    unit: 'days',
                    date: 'All time',
                    description: 'Longest consecutive task completion streak'
                });
            }
        }
        return records;
    }, [weightAnalytics, workoutAnalytics, taskAnalytics]);
    const handleTimeRangeChange = (value) => {
        setTimeRange(value);
    };
    const handleRefreshData = () => {
        invalidateAllAnalytics();
    };
    if (isLoading) {
        return _jsx(LoadingSpinner, { message: "Loading enhanced dashboard..." });
    }
    if (error) {
        const message = error?.message || 'Failed to load dashboard data. Please try again later.';
        return _jsx(ErrorMessage, { title: "Dashboard Error", message: message });
    }
    return (_jsx(Box, { p: { base: 4, md: 6 }, children: _jsxs(VStack, { gap: 6, align: "stretch", children: [_jsxs(HStack, { justify: "space-between", align: "center", children: [_jsxs(HStack, { gap: 3, children: [_jsx(Heading, { as: "h1", size: "lg", color: "text.primary", children: "Enhanced Fitness Dashboard" }), _jsx(Badge, { colorScheme: "blue", variant: "subtle", children: "Phase 2" })] }), _jsxs(HStack, { gap: 3, children: [_jsxs("select", { value: timeRange, onChange: (e) => handleTimeRangeChange(e.target.value), style: {
                                        background: 'var(--chakra-colors-surface-50)',
                                        border: '1px solid var(--chakra-colors-muted-200)',
                                        borderRadius: '6px',
                                        padding: '8px 12px',
                                        fontSize: '14px',
                                        maxWidth: '150px',
                                        cursor: 'pointer'
                                    }, children: [_jsx("option", { value: "7", children: "Last 7 days" }), _jsx("option", { value: "30", children: "Last 30 days" }), _jsx("option", { value: "90", children: "Last 90 days" }), _jsx("option", { value: "365", children: "Last year" }), _jsx("option", { value: "all", children: "All time" })] }), _jsx(IconButton, { "aria-label": "Refresh data", size: "sm", variant: "outline", bg: "surface.50", onClick: handleRefreshData, children: _jsx(Settings, { size: 16 }) })] })] }), _jsxs(SimpleGrid, { columns: gridCols, gap: 4, children: [_jsx(Card, { as: "section", "aria-labelledby": "overview-weight", children: _jsxs(VStack, { gap: 2, align: "stretch", children: [_jsxs(HStack, { gap: 2, children: [_jsx(TrendingUp, { size: 20, color: "#3182CE" }), _jsx(Text, { id: "overview-weight", fontSize: "lg", fontWeight: "semibold", color: "text.primary", children: "Weight Trend" })] }), _jsx(Text, { fontSize: "2xl", fontWeight: "bold", color: "primary.500", children: overview?.overview?.latestWeight ? `${overview.overview.latestWeight} lbs` : 'No data' }), _jsx(Text, { fontSize: "sm", color: "text.secondary", children: overview?.overview?.weightChange ? (overview.overview.weightChange >= 0 ? '+' : '') + overview.overview.weightChange + ' lbs change' : 'No change data' })] }) }), _jsx(Card, { as: "section", "aria-labelledby": "overview-workouts", children: _jsxs(VStack, { gap: 2, align: "stretch", children: [_jsxs(HStack, { gap: 2, children: [_jsx(Target, { size: 20, color: "#38A169" }), _jsx(Text, { id: "overview-workouts", fontSize: "lg", fontWeight: "semibold", color: "text.primary", children: "Workouts" })] }), _jsx(Text, { fontSize: "2xl", fontWeight: "bold", color: "primary.500", children: overview?.overview?.totalWorkouts || 0 }), _jsxs(Text, { fontSize: "sm", color: "text.secondary", children: [overview?.overview?.totalDuration || 0, " minutes total"] })] }) }), _jsx(Card, { as: "section", "aria-labelledby": "overview-tasks", children: _jsxs(VStack, { gap: 2, align: "stretch", children: [_jsxs(HStack, { gap: 2, children: [_jsx(Award, { size: 20, color: "#D69E2E" }), _jsx(Text, { id: "overview-tasks", fontSize: "lg", fontWeight: "semibold", color: "text.primary", children: "Tasks" })] }), _jsxs(Text, { fontSize: "2xl", fontWeight: "bold", color: "primary.500", children: [overview?.overview?.completedTasks || 0, "/", overview?.overview?.totalTasks || 0] }), _jsxs(Text, { fontSize: "sm", color: "text.secondary", children: [overview?.overview?.completionRate ? overview.overview.completionRate.toFixed(1) : 0, "% complete"] })] }) }), _jsx(Card, { as: "section", "aria-labelledby": "overview-streak", children: _jsxs(VStack, { gap: 2, align: "stretch", children: [_jsx(Text, { id: "overview-streak", fontSize: "lg", fontWeight: "semibold", color: "text.primary", children: "Current Streaks" }), _jsxs(VStack, { gap: 1, align: "stretch", children: [_jsxs(Text, { fontSize: "sm", color: "text.secondary", children: ["Workout streak: ", workoutAnalytics?.summary?.streak || 0, " days"] }), _jsxs(Text, { fontSize: "sm", color: "text.secondary", children: ["Task streak: ", taskAnalytics?.personalRecords?.currentTaskStreak || 0, " days"] })] })] }) })] }), _jsxs(VStack, { gap: 6, align: "stretch", children: [_jsx(Text, { fontSize: "xl", fontWeight: "semibold", color: "text.primary", children: "Analytics Charts" }), _jsxs(SimpleGrid, { columns: { base: 1, lg: 2 }, gap: 6, children: [selectedMetrics.includes('weight') && weightAnalytics?.data && (_jsx(Card, { children: _jsx(InteractiveChart, { data: weightAnalytics.data.map(d => ({ date: d.date, weight: d.weight })), chartType: chartType, title: "Weight Trend", height: 300, showMovingAverage: showMovingAverage, showTrendLine: showTrendLine, movingAverageData: weightAnalytics.movingAverages, formatXAxis: (value) => new Date(value).toLocaleDateString(), formatYAxis: (value) => `${value} lbs` }) })), selectedMetrics.includes('workouts') && workoutAnalytics?.data && (_jsx(Card, { children: _jsx(InteractiveChart, { data: workoutAnalytics.data.map(d => ({ date: d.date, duration: d.duration })), chartType: chartType, title: "Workout Duration", height: 300, showMovingAverage: showMovingAverage, showTrendLine: showTrendLine, formatXAxis: (value) => new Date(value).toLocaleDateString(), formatYAxis: (value) => `${value} min` }) }))] })] }), _jsxs(VStack, { gap: 4, align: "stretch", children: [_jsx(Text, { fontSize: "xl", fontWeight: "semibold", color: "text.primary", children: "Goals & Progress" }), _jsx(GoalProgressIndicator, { goals: realGoals })] }), _jsxs(VStack, { gap: 4, align: "stretch", children: [_jsx(Text, { fontSize: "xl", fontWeight: "semibold", color: "text.primary", children: "Personal Records" }), _jsx(PersonalRecords, { records: realRecords })] })] }) }));
}
