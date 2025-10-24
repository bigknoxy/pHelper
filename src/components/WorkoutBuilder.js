import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { Box, Heading, Text, Input, SimpleGrid, Badge, HStack, VStack, Button, Flex, } from '@chakra-ui/react';
import { useExercises } from '../hooks/useExercises';
import Card from './shared/Card';
export default function WorkoutBuilder({ onSave, initialExercises = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [workoutExercises, setWorkoutExercises] = useState(initialExercises.length > 0 ? initialExercises : []);
    const [workoutName, setWorkoutName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    // Fetch exercises for the library
    const { exercises, isLoading, error } = useExercises({
        search: searchTerm,
        category: selectedCategory || undefined,
        limit: 50,
    });
    // Filter out exercises already in the workout
    const availableExercises = useMemo(() => {
        const workoutExerciseIds = workoutExercises.map(we => we.exerciseId);
        return exercises.filter(exercise => !workoutExerciseIds.includes(exercise.id));
    }, [exercises, workoutExercises]);
    const handleAddExercise = (exercise) => {
        const isCardio = exercise.category === 'CARDIO';
        const newWorkoutExercise = {
            id: `temp-${Date.now()}`,
            exerciseId: exercise.id,
            exercise,
            sets: 1,
            order: workoutExercises.length,
            notes: '',
            ...(isCardio ? {} : { reps: 10, weight: 0 }) // Default reps and weight for strength exercises
        };
        setWorkoutExercises(prev => [...prev, newWorkoutExercise]);
    };
    const handleRemoveExercise = (exerciseId) => {
        setWorkoutExercises(prev => prev.filter(we => we.exerciseId !== exerciseId)
            .map((we, index) => ({ ...we, order: index })));
    };
    const handleExerciseUpdate = (exerciseId, updates) => {
        setWorkoutExercises(prev => prev.map(we => we.exerciseId === exerciseId ? { ...we, ...updates } : we));
    };
    const handleSave = async () => {
        if (!workoutName.trim() || workoutExercises.length === 0) {
            return;
        }
        setIsSaving(true);
        try {
            const workoutData = {
                name: workoutName.trim(),
                exercises: workoutExercises.map(({ id, exercise, ...we }) => we)
            };
            if (onSave) {
                onSave(workoutData);
            }
            // Reset form
            setWorkoutName('');
            setWorkoutExercises([]);
        }
        catch (error) {
            console.error('Failed to save workout:', error);
        }
        finally {
            setIsSaving(false);
        }
    };
    if (error) {
        return (_jsx(Box, { p: 4, bg: "red.50", borderRadius: "md", border: "1px", borderColor: "red.200", children: _jsx(Text, { color: "red.600", children: "Failed to load exercises. Please try again." }) }));
    }
    return (_jsx(Box, { children: _jsxs(VStack, { gap: 6, align: "stretch", children: [_jsxs(Box, { children: [_jsx(Heading, { size: "lg", mb: 2, children: "Workout Builder" }), _jsx(Text, { color: "gray.600", children: "Create a custom workout by selecting exercises and setting parameters" })] }), _jsx(Card, { children: _jsx(VStack, { gap: 4, align: "stretch", p: 6, children: _jsxs(Box, { children: [_jsx(Text, { fontSize: "sm", fontWeight: "medium", mb: 2, children: "Workout Name" }), _jsx(Input, { placeholder: "e.g., Upper Body Strength", value: workoutName, onChange: (e) => setWorkoutName(e.target.value) })] }) }) }), _jsxs(Flex, { gap: 6, children: [_jsx(Box, { flex: 1, children: _jsx(Card, { children: _jsxs(VStack, { gap: 4, align: "stretch", p: 6, children: [_jsxs(HStack, { children: [_jsx(Input, { placeholder: "Search exercises...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), flex: 1 }), _jsxs("select", { value: selectedCategory, onChange: (e) => setSelectedCategory(e.target.value), style: {
                                                        padding: '8px',
                                                        borderRadius: '6px',
                                                        border: '1px solid #4A5568',
                                                        backgroundColor: '#2D3748',
                                                        color: 'white'
                                                    }, children: [_jsx("option", { value: "", children: "All Categories" }), _jsx("option", { value: "STRENGTH", children: "Strength" }), _jsx("option", { value: "CARDIO", children: "Cardio" }), _jsx("option", { value: "FLEXIBILITY", children: "Flexibility" }), _jsx("option", { value: "BALANCE", children: "Balance" }), _jsx("option", { value: "FUNCTIONAL", children: "Functional" }), _jsx("option", { value: "SPORTS", children: "Sports" })] })] }), isLoading ? (_jsx(Flex, { justify: "center", py: 8, children: _jsx(Text, { children: "Loading exercises..." }) })) : availableExercises.length === 0 ? (_jsx(Text, { textAlign: "center", py: 8, color: "gray.500", children: "No exercises available." })) : (_jsx(SimpleGrid, { columns: { base: 1, md: 2 }, gap: 3, children: availableExercises.map(exercise => (_jsx(Card, { children: _jsxs(VStack, { gap: 2, align: "stretch", p: 4, children: [_jsxs(HStack, { justify: "space-between", children: [_jsx(Text, { fontSize: "sm", fontWeight: "medium", children: exercise.name }), _jsx(Button, { size: "xs", colorScheme: "teal", onClick: () => handleAddExercise(exercise), children: "Add" })] }), _jsxs(HStack, { gap: 1, children: [_jsx(Badge, { size: "xs", colorScheme: "blue", children: exercise.category }), _jsx(Badge, { size: "xs", colorScheme: "green", children: exercise.difficulty })] })] }) }, exercise.id))) }))] }) }) }), _jsx(Box, { flex: 1, children: _jsx(Card, { children: _jsxs(VStack, { gap: 4, align: "stretch", p: 6, children: [_jsxs(HStack, { justify: "space-between", children: [_jsxs(Text, { fontSize: "lg", fontWeight: "medium", children: ["Workout Exercises (", workoutExercises.length, ")"] }), workoutExercises.length > 0 && (_jsx(Button, { colorScheme: "teal", size: "sm", onClick: handleSave, disabled: isSaving, children: isSaving ? 'Saving...' : 'Save Workout' }))] }), workoutExercises.length === 0 ? (_jsx(Text, { textAlign: "center", py: 8, color: "gray.500", children: "Add exercises from the library to build your workout." })) : (_jsx(VStack, { gap: 3, align: "stretch", children: workoutExercises.map((workoutExercise) => (_jsx(WorkoutExerciseCard, { workoutExercise: workoutExercise, onUpdate: (updates) => handleExerciseUpdate(workoutExercise.exerciseId, updates), onRemove: () => handleRemoveExercise(workoutExercise.exerciseId) }, workoutExercise.id))) }))] }) }) })] })] }) }));
}
function WorkoutExerciseCard({ workoutExercise, onUpdate, onRemove }) {
    const { exercise, sets, reps, weight, duration, restTime, notes, distance, calories } = workoutExercise;
    const isCardio = exercise.category === 'CARDIO';
    return (_jsx(Card, { "data-testid": `workout-exercise-${workoutExercise.exerciseId}`, children: _jsxs(VStack, { gap: 3, align: "stretch", p: 4, children: [_jsxs(HStack, { justify: "space-between", align: "start", children: [_jsxs(VStack, { gap: 1, align: "start", flex: 1, children: [_jsx(Text, { fontSize: "sm", fontWeight: "medium", children: exercise.name }), _jsxs(HStack, { gap: 1, children: [_jsx(Badge, { size: "xs", colorScheme: "blue", children: exercise.category }), _jsx(Badge, { size: "xs", colorScheme: "green", children: exercise.difficulty })] })] }), _jsx(Button, { size: "xs", colorScheme: "red", variant: "outline", onClick: onRemove, "data-testid": `remove-exercise-${workoutExercise.exerciseId}`, children: "Remove" })] }), _jsxs(VStack, { gap: 3, align: "stretch", children: [isCardio ? (
                        // Cardio-specific inputs
                        _jsx(_Fragment, { children: _jsxs(HStack, { gap: 3, children: [_jsxs(Box, { flex: 1, children: [_jsx(Text, { fontSize: "xs", fontWeight: "medium", mb: 1, children: "Duration (sec)" }), _jsx(Input, { "aria-label": "Duration (sec)", type: "number", size: "sm", min: 0, value: duration || '', onChange: (e) => onUpdate({ duration: parseInt(e.target.value) || undefined }), placeholder: "Optional" })] }), _jsxs(Box, { flex: 1, children: [_jsx(Text, { fontSize: "xs", fontWeight: "medium", mb: 1, children: "Distance (km)" }), _jsx(Input, { "aria-label": "Distance (km)", type: "number", size: "sm", min: 0, step: 0.1, value: distance || '', onChange: (e) => onUpdate({ distance: parseFloat(e.target.value) || undefined }), placeholder: "Optional" })] }), _jsxs(Box, { flex: 1, children: [_jsx(Text, { fontSize: "xs", fontWeight: "medium", mb: 1, children: "Calories" }), _jsx(Input, { "aria-label": "Calories", type: "number", size: "sm", min: 0, value: calories || '', onChange: (e) => onUpdate({ calories: parseInt(e.target.value) || undefined }), placeholder: "Optional" })] })] }) })) : (
                        // Strength-specific inputs
                        _jsxs(_Fragment, { children: [_jsxs(HStack, { gap: 3, children: [_jsxs(Box, { flex: 1, children: [_jsx(Text, { fontSize: "xs", fontWeight: "medium", mb: 1, children: "Sets" }), _jsx(Input, { "aria-label": "Sets", type: "number", size: "sm", min: 1, max: 20, value: sets, onChange: (e) => onUpdate({ sets: parseInt(e.target.value) || 1 }) })] }), _jsxs(Box, { flex: 1, children: [_jsx(Text, { fontSize: "xs", fontWeight: "medium", mb: 1, children: "Reps" }), _jsx(Input, { "aria-label": "Reps", type: "number", size: "sm", min: 1, max: 100, value: reps || '', onChange: (e) => onUpdate({ reps: parseInt(e.target.value) || undefined }), placeholder: "Optional" })] }), _jsxs(Box, { flex: 1, children: [_jsx(Text, { fontSize: "xs", fontWeight: "medium", mb: 1, children: "Weight (lbs)" }), _jsx(Input, { "aria-label": "Weight (lbs)", type: "number", size: "sm", min: 0, step: 2.5, value: weight || '', onChange: (e) => onUpdate({ weight: parseFloat(e.target.value) || undefined }), placeholder: "Optional" })] })] }), _jsxs(HStack, { gap: 3, children: [_jsxs(Box, { flex: 1, children: [_jsx(Text, { fontSize: "xs", fontWeight: "medium", mb: 1, children: "Duration (sec)" }), _jsx(Input, { "aria-label": "Duration (sec)", type: "number", size: "sm", min: 0, value: duration || '', onChange: (e) => onUpdate({ duration: parseInt(e.target.value) || undefined }), placeholder: "Optional" })] }), _jsxs(Box, { flex: 1, children: [_jsx(Text, { fontSize: "xs", fontWeight: "medium", mb: 1, children: "Rest (sec)" }), _jsx(Input, { "aria-label": "Rest (sec)", type: "number", size: "sm", min: 0, value: restTime || '', onChange: (e) => onUpdate({ restTime: parseInt(e.target.value) || undefined }), placeholder: "Optional" })] })] })] })), _jsxs(Box, { children: [_jsx(Text, { fontSize: "xs", fontWeight: "medium", mb: 1, children: "Notes" }), _jsx(Input, { size: "sm", placeholder: "Exercise notes...", value: notes || '', onChange: (e) => onUpdate({ notes: e.target.value }) })] })] })] }) }));
}
