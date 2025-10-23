import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text, VStack, HStack, } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { getWeightGoals } from '../../api/weightGoals';
import { getWeights } from '../../api/weights';
const GoalProgressTracker = () => {
    const { data: goals } = useQuery({
        queryKey: ['weightGoals'],
        queryFn: getWeightGoals,
    });
    const { data: weights } = useQuery({
        queryKey: ['weights'],
        queryFn: getWeights,
    });
    if (!goals || !weights)
        return _jsx(Text, { children: "Loading..." });
    const activeGoal = goals.find(g => !g.milestones.some(m => m.achieved));
    if (!activeGoal)
        return _jsx(Text, { children: "No active goals" });
    const latestWeight = weights[0]?.weight || 0;
    const progress = Math.min(100, ((activeGoal.goalWeight - latestWeight) / (activeGoal.goalWeight - latestWeight)) * 100); // Simplified
    return (_jsx(Box, { p: 4, borderWidth: 1, borderRadius: "md", children: _jsxs(VStack, { gap: 4, align: "stretch", children: [_jsx(Text, { fontSize: "lg", fontWeight: "bold", children: "Goal Progress" }), _jsxs(HStack, { justify: "space-between", children: [_jsxs(Text, { children: ["Current: ", latestWeight, " lbs"] }), _jsxs(Text, { children: ["Goal: ", activeGoal.goalWeight, " lbs"] })] }), _jsxs(Box, { children: [_jsxs(Text, { children: ["Progress: ", Math.round(progress), "%"] }), _jsx(Box, { bg: "gray.200", h: "4", borderRadius: "md", children: _jsx(Box, { bg: "teal.500", h: "4", w: `${progress}%`, borderRadius: "md" }) })] })] }) }));
};
export default GoalProgressTracker;
