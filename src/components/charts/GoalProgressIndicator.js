import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text, VStack, HStack, Badge, Icon } from '@chakra-ui/react';
import { Target, TrendingUp, Award } from 'lucide-react';
const GoalProgressIndicator = ({ goals, showCompleted = true }) => {
    const activeGoals = goals.filter(goal => showCompleted || goal.status === 'active');
    if (activeGoals.length === 0) {
        return (_jsxs(Box, { p: 6, textAlign: "center", bg: "surface.50", borderRadius: "md", border: "1px solid", borderColor: "muted.200", children: [_jsx(Icon, { as: Target, boxSize: 48, color: "muted.400", mb: 3 }), _jsx(Text, { color: "text.secondary", fontSize: "lg", children: "No active goals" }), _jsx(Text, { color: "text.muted", fontSize: "sm", children: "Set some fitness goals to track your progress!" })] }));
    }
    const getProgressColor = (percentage) => {
        if (percentage >= 100)
            return 'green';
        if (percentage >= 75)
            return 'blue';
        if (percentage >= 50)
            return 'orange';
        return 'red';
    };
    const getStatusBadge = (goal) => {
        switch (goal.status) {
            case 'completed':
                return _jsx(Badge, { colorScheme: "green", size: "sm", children: "Completed" });
            case 'overdue':
                return _jsx(Badge, { colorScheme: "red", size: "sm", children: "Overdue" });
            case 'paused':
                return _jsx(Badge, { colorScheme: "yellow", size: "sm", children: "Paused" });
            case 'cancelled':
                return _jsx(Badge, { colorScheme: "gray", size: "sm", children: "Cancelled" });
            default:
                return _jsx(Badge, { colorScheme: "blue", size: "sm", children: "Active" });
        }
    };
    const formatValue = (value, unit) => {
        if (unit === 'count')
            return value.toLocaleString();
        return `${value} ${unit}`;
    };
    return (_jsx(VStack, { gap: 4, align: "stretch", children: activeGoals.map((goal) => {
            const percentage = Math.min((goal.current / goal.target) * 100, 100);
            const isCompleted = percentage >= 100;
            return (_jsx(Box, { p: 4, bg: "surface.50", borderRadius: "md", border: "1px solid", borderColor: "muted.200", position: "relative", children: _jsxs(VStack, { gap: 3, align: "stretch", children: [_jsxs(HStack, { justify: "space-between", align: "flex-start", children: [_jsxs(HStack, { gap: 2, children: [_jsx(Icon, { as: goal.category === 'weight' ? Target : goal.category === 'workouts' ? TrendingUp : Award, boxSize: 20, color: "primary.500" }), _jsxs(VStack, { gap: 0, align: "flex-start", children: [_jsx(Text, { fontSize: "md", fontWeight: "semibold", color: "text.primary", children: goal.title }), _jsxs(Text, { fontSize: "sm", color: "text.secondary", children: [formatValue(goal.current, goal.unit), " of ", formatValue(goal.target, goal.unit)] })] })] }), getStatusBadge(goal)] }), _jsxs(Box, { children: [_jsx(Box, { bg: "muted.100", borderRadius: "md", overflow: "hidden", height: "8px", children: _jsx(Box, { bg: `${getProgressColor(percentage)}.500`, height: "100%", width: `${percentage}%`, transition: "width 0.3s ease", borderRadius: percentage === 100 ? "md" : "0" }) }), _jsxs(HStack, { justify: "space-between", mt: 2, children: [_jsxs(Text, { fontSize: "sm", color: "text.muted", children: [percentage.toFixed(1), "% complete"] }), goal.deadline && (_jsxs(Text, { fontSize: "sm", color: "text.muted", children: ["Due: ", new Date(goal.deadline).toLocaleDateString()] }))] })] }), isCompleted && (_jsxs(HStack, { gap: 2, color: "green.500", children: [_jsx(Icon, { as: Award, boxSize: 16 }), _jsx(Text, { fontSize: "sm", fontWeight: "medium", children: "Goal achieved! \uD83C\uDF89" })] }))] }) }, goal.id));
        }) }));
};
export default GoalProgressIndicator;
