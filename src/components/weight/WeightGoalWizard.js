import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, Button, Input, VStack, HStack, Text, } from '@chakra-ui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createWeightGoal } from '../../api/weightGoals';
const WeightGoalWizard = () => {
    const [formData, setFormData] = useState({
        goalWeight: 0,
        targetDate: '',
        milestones: []
    });
    const queryClient = useQueryClient();
    const createGoalMutation = useMutation({
        mutationFn: (data) => createWeightGoal(data),
        onSuccess: () => {
            alert('Goal created successfully!');
            queryClient.invalidateQueries({ queryKey: ['weightGoals'] });
            resetForm();
        },
        onError: (error) => {
            alert('Error creating goal: ' + error.message);
        },
    });
    const resetForm = () => {
        setFormData({ goalWeight: 0, targetDate: '', milestones: [] });
    };
    const handleSubmit = () => {
        const data = {
            goalWeight: formData.goalWeight,
            targetDate: formData.targetDate,
            milestones: formData.milestones.map(m => ({ milestoneWeight: m.weight, targetDate: m.date }))
        };
        createGoalMutation.mutate(data);
    };
    const addMilestone = () => {
        setFormData({
            ...formData,
            milestones: [...formData.milestones, { weight: 0, date: '' }]
        });
    };
    const updateMilestone = (index, field, value) => {
        const updatedMilestones = formData.milestones.map((m, i) => i === index ? { ...m, [field]: value } : m);
        setFormData({ ...formData, milestones: updatedMilestones });
    };
    const removeMilestone = (index) => {
        setFormData({
            ...formData,
            milestones: formData.milestones.filter((_, i) => i !== index)
        });
    };
    return (_jsxs(Box, { p: 4, borderWidth: 1, borderRadius: "md", children: [_jsx(Text, { fontSize: "lg", mb: 4, children: "Set Your Weight Goal" }), _jsxs(VStack, { gap: 4, align: "stretch", children: [_jsxs(Box, { children: [_jsx(Text, { mb: 2, children: "Goal Weight (lbs)" }), _jsx(Input, { type: "number", value: formData.goalWeight, onChange: (e) => setFormData({ ...formData, goalWeight: parseFloat(e.target.value) || 0 }) })] }), _jsxs(Box, { children: [_jsx(Text, { mb: 2, children: "Target Date" }), _jsx(Input, { type: "date", value: formData.targetDate, onChange: (e) => setFormData({ ...formData, targetDate: e.target.value }) })] }), _jsxs(Box, { children: [_jsx(Text, { mb: 2, children: "Milestones (Optional)" }), formData.milestones.map((milestone, index) => (_jsxs(HStack, { gap: 2, mb: 2, children: [_jsx(Input, { type: "number", placeholder: "Weight", value: milestone.weight, onChange: (e) => updateMilestone(index, 'weight', parseFloat(e.target.value) || 0) }), _jsx(Input, { type: "date", placeholder: "Date", value: milestone.date, onChange: (e) => updateMilestone(index, 'date', e.target.value) }), _jsx(Button, { onClick: () => removeMilestone(index), colorScheme: "red", size: "sm", children: "Remove" })] }, index))), _jsx(Button, { onClick: addMilestone, variant: "outline", children: "Add Milestone" })] }), _jsx(Button, { colorScheme: "teal", onClick: handleSubmit, disabled: formData.goalWeight <= 0 || !formData.targetDate, loading: createGoalMutation.isPending, children: "Create Goal" })] })] }));
};
export default WeightGoalWizard;
