import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { Box, Heading, Text, Stack, Input, HStack, Button as ChakraButton, VStack, SimpleGrid, Badge } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import Button from './shared/Button';
import { useWorkouts } from '../hooks/useWorkouts';
import { useWorkoutTemplates, useWorkoutTemplate } from '../hooks/useWorkoutTemplates';
import WorkoutBuilder from './WorkoutBuilder';
export default function WorkoutLogger() {
    const { token } = useAuth();
    const { workouts = [], addWorkout, isAdding } = useWorkouts(Boolean(token));
    const { templates, isLoading: templatesLoading } = useWorkoutTemplates({}, Boolean(token));
    const [mode, setMode] = useState('simple');
    const [selectedTemplateId, setSelectedTemplateId] = useState(null);
    const [showTemplateSelection, setShowTemplateSelection] = useState(false);
    const { data: selectedTemplate } = useWorkoutTemplate(selectedTemplateId || '', Boolean(selectedTemplateId));
    const initialWorkoutExercises = useMemo(() => {
        if (selectedTemplate) {
            return selectedTemplate.exercises.map((te, index) => ({
                id: `temp-${te.id}`,
                exerciseId: te.exerciseId,
                exercise: te.exercise,
                sets: te.sets,
                reps: te.reps,
                weight: te.weight,
                duration: te.duration,
                restTime: te.restTime,
                order: index,
                notes: te.notes,
            }));
        }
        return [];
    }, [selectedTemplate]);
    // Simple mode state
    const today = new Date().toISOString().slice(0, 10);
    const [date, setDate] = useState(today);
    const [type, setType] = useState('');
    const [duration, setDuration] = useState('');
    const [notes, setNotes] = useState('');
    const handleAddEntry = async () => {
        if (!date || !type || !duration)
            return;
        try {
            await addWorkout({ type, duration: parseInt(duration, 10), date, notes });
            setDate(today);
            setType('');
            setDuration('');
            setNotes('');
        }
        catch (err) {
            console.error('Failed to add workout', err);
        }
    };
    const handleStructuredWorkoutSave = async (workoutData) => {
        try {
            await addWorkout({
                type: workoutData.name,
                duration: 60, // TODO: Calculate actual duration from exercises
                date: today,
                notes: `${workoutData.exercises.length} exercises`,
                templateId: selectedTemplateId || undefined,
                exercises: workoutData.exercises
            });
            setMode('simple'); // Switch back to simple mode after saving
            setSelectedTemplateId(null);
            setShowTemplateSelection(false);
        }
        catch (err) {
            console.error('Failed to save structured workout', err);
        }
    };
    const handleSelectTemplate = (templateId) => {
        setSelectedTemplateId(templateId);
        setShowTemplateSelection(false);
    };
    const handleSkipTemplate = () => {
        setSelectedTemplateId(null);
        setShowTemplateSelection(false);
    };
    const handleStartStructured = () => {
        setShowTemplateSelection(true);
    };
    return (_jsx(Box, { children: !token ? (_jsx(Text, { color: "red.400", children: "Please log in to use the Workout Logger." })) : (_jsxs(_Fragment, { children: [_jsx(Heading, { size: "md", mb: 4, children: "Log Your Workout" }), _jsxs(HStack, { mb: 6, gap: 2, children: [_jsx(ChakraButton, { size: "sm", colorScheme: mode === 'simple' ? 'teal' : 'gray', variant: mode === 'simple' ? 'solid' : 'outline', onClick: () => setMode('simple'), children: "Simple" }), _jsx(ChakraButton, { size: "sm", colorScheme: mode === 'structured' ? 'teal' : 'gray', variant: mode === 'structured' ? 'solid' : 'outline', onClick: () => {
                                setMode('structured');
                                handleStartStructured();
                            }, children: "Structured" })] }), mode === 'simple' ? (
                /* Simple Workout Logging */
                _jsxs(Stack, { gap: 4, align: "stretch", children: [_jsxs("label", { htmlFor: "workout-date", children: ["Date", _jsx(Input, { id: "workout-date", name: "date", type: "date", "aria-label": "date", value: date, onChange: e => setDate(e.target.value) })] }), _jsxs("label", { htmlFor: "workout-type", children: ["Type", _jsx(Input, { id: "workout-type", name: "type", "aria-label": "type", value: type, onChange: e => setType(e.target.value), placeholder: "e.g. Running" })] }), _jsxs("label", { htmlFor: "workout-duration", children: ["Duration (min)", _jsx(Input, { id: "workout-duration", name: "duration", type: "number", "aria-label": "duration", value: duration, onChange: e => setDuration(e.target.value) })] }), _jsxs("label", { htmlFor: "workout-notes", children: ["Notes", _jsx(Input, { id: "workout-notes", name: "notes", "aria-label": "notes", value: notes, onChange: e => setNotes(e.target.value) })] }), _jsx(Button, { colorScheme: "teal", variant: "solid", size: "md", borderRadius: "md", boxShadow: "md", fontWeight: "bold", _hover: { bg: "teal.300", boxShadow: "lg", cursor: "pointer" }, loading: isAdding, "aria-label": "Add Workout", onClick: handleAddEntry, children: "Add Workout" })] })) : (
                /* Structured Workout Logging */
                _jsx(_Fragment, { children: showTemplateSelection ? (_jsxs(VStack, { gap: 4, align: "stretch", children: [_jsx(Heading, { size: "md", children: "Select a Template (Optional)" }), templatesLoading ? (_jsx(Text, { children: "Loading templates..." })) : templates.length === 0 ? (_jsx(Text, { children: "No templates available. Create one first or skip to build from scratch." })) : (_jsx(SimpleGrid, { columns: { base: 1, md: 2 }, gap: 4, children: templates.map((template) => (_jsx(Box, { p: 4, borderWidth: 1, borderRadius: "md", borderColor: "gray.200", children: _jsxs(VStack, { gap: 2, align: "stretch", children: [_jsx(Text, { fontWeight: "bold", children: template.name }), _jsx(Text, { fontSize: "sm", color: "gray.600", children: template.description }), _jsx(Badge, { colorScheme: "blue", children: template.category }), _jsx(HStack, { children: _jsx(Button, { size: "sm", colorScheme: "teal", onClick: () => handleSelectTemplate(template.id), children: "Use Template" }) })] }) }, template.id))) })), _jsx(HStack, { children: _jsx(Button, { onClick: handleSkipTemplate, children: "Skip and Build from Scratch" }) })] })) : (_jsx(WorkoutBuilder, { onSave: handleStructuredWorkoutSave, initialExercises: initialWorkoutExercises })) })), workouts.length > 0 && (_jsxs(Box, { mt: 8, children: [_jsx(Heading, { size: "sm", mb: 2, children: "Recent Workouts" }), _jsx(Stack, { gap: 2, children: workouts.slice(0, 10).map((entry, idx) => (_jsx(Box, { p: 3, borderWidth: 1, borderRadius: "md", borderColor: "gray.200", children: _jsxs(Text, { children: [_jsx("strong", { children: new Date(entry.date).toLocaleDateString() }), ": ", entry.type, ", ", entry.duration, " min", entry.notes && ` - ${entry.notes}`] }) }, entry.id || idx))) })] }))] })) }));
}
