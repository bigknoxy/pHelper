import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { Box, Heading, Text, SimpleGrid, Badge, HStack, VStack, Spinner, Flex, } from '@chakra-ui/react';
import { useExercises } from '../hooks/useExercises';
import Card from './shared/Card';
import Button from './shared/Button';
import MvpTabs from './MvpTabs';
export default function ExerciseLibrary({ onSelectExercise, selectedExercises = [], multiSelect = false }) {
    const [searchTerm] = useState('');
    const [selectedCategory] = useState('');
    const [selectedMuscleGroups] = useState([]);
    const [selectedDifficulty] = useState('');
    // Fetch data
    const { exercises, isLoading, error } = useExercises({
        search: searchTerm,
        category: selectedCategory || undefined,
        muscleGroup: selectedMuscleGroups.length > 0 ? selectedMuscleGroups[0] : undefined,
        difficulty: selectedDifficulty || undefined,
        limit: 100,
    });
    // Filter exercises based on selected muscle groups
    const filteredExercises = useMemo(() => {
        if (selectedMuscleGroups.length === 0)
            return exercises;
        return exercises.filter(exercise => selectedMuscleGroups.some(group => exercise.muscleGroups.includes(group)));
    }, [exercises, selectedMuscleGroups]);
    // Group exercises by category for tabbed view
    const exercisesByCategory = useMemo(() => {
        const grouped = {};
        filteredExercises.forEach(exercise => {
            if (!grouped[exercise.category]) {
                grouped[exercise.category] = [];
            }
            grouped[exercise.category].push(exercise);
        });
        return grouped;
    }, [filteredExercises]);
    const handleExerciseSelect = (exercise) => {
        if (onSelectExercise) {
            onSelectExercise(exercise);
        }
    };
    if (error) {
        return (_jsx(Box, { p: 4, bg: "red.50", borderRadius: "md", border: "1px", borderColor: "red.200", children: _jsx(Text, { color: "red.600", children: "Failed to load exercises. Please try again." }) }));
    }
    // Create tabs for categories
    const categoryTabs = Object.keys(exercisesByCategory).map(category => ({
        label: `${category.charAt(0) + category.slice(1).toLowerCase()} (${exercisesByCategory[category].length})`,
        value: category,
        content: (_jsx(SimpleGrid, { columns: { base: 1, md: 2, lg: 3 }, gap: 4, children: exercisesByCategory[category].map(exercise => (_jsx(ExerciseCard, { exercise: exercise, isSelected: selectedExercises.includes(exercise.id), onSelect: () => handleExerciseSelect(exercise), showSelectButton: !!onSelectExercise }, exercise.id))) }))
    }));
    return (_jsx(Box, { children: _jsxs(VStack, { gap: 6, align: "stretch", children: [_jsxs(Box, { children: [_jsx(Heading, { size: "lg", mb: 2, children: "Exercise Library" }), _jsx(Text, { color: "gray.600", children: "Browse and search through our comprehensive exercise database" })] }), _jsx(Card, { children: _jsxs(VStack, { gap: 4, align: "stretch", p: 6, children: [_jsxs(HStack, { justify: "space-between", children: [_jsxs(Text, { fontSize: "lg", fontWeight: "medium", children: [filteredExercises.length, " Exercises"] }), multiSelect && selectedExercises.length > 0 && (_jsxs(Text, { fontSize: "sm", color: "gray.600", children: [selectedExercises.length, " selected"] }))] }), filteredExercises.length === 0 ? (_jsx(Text, { textAlign: "center", py: 8, color: "gray.500", children: "No exercises found matching your criteria." })) : (_jsx(MvpTabs, { tabs: categoryTabs }))] }) }), isLoading ? (_jsx(Flex, { justify: "center", py: 8, children: _jsx(Spinner, { size: "lg", color: "teal.500" }) })) : (_jsx(Card, { children: _jsxs(VStack, { gap: 4, align: "stretch", p: 6, children: [_jsxs(HStack, { justify: "space-between", children: [_jsxs(Text, { fontSize: "lg", fontWeight: "medium", children: [filteredExercises.length, " Exercises"] }), multiSelect && selectedExercises.length > 0 && (_jsxs(Text, { fontSize: "sm", color: "gray.600", children: [selectedExercises.length, " selected"] }))] }), filteredExercises.length === 0 ? (_jsx(Text, { textAlign: "center", py: 8, color: "gray.500", children: "No exercises found matching your criteria." })) : (_jsx(MvpTabs, { tabs: categoryTabs }))] }) }))] }) }));
}
function ExerciseCard({ exercise, isSelected, onSelect, showSelectButton }) {
    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'BEGINNER': return 'green';
            case 'INTERMEDIATE': return 'yellow';
            case 'ADVANCED': return 'red';
            default: return 'gray';
        }
    };
    const getCategoryColor = (category) => {
        switch (category) {
            case 'STRENGTH': return 'blue';
            case 'CARDIO': return 'red';
            case 'FLEXIBILITY': return 'purple';
            case 'BALANCE': return 'orange';
            case 'FUNCTIONAL': return 'teal';
            case 'SPORTS': return 'pink';
            default: return 'gray';
        }
    };
    return (_jsx(Card, { borderColor: isSelected ? 'teal.500' : 'transparent', borderWidth: isSelected ? 2 : 1, _hover: { shadow: 'md' }, cursor: showSelectButton ? 'pointer' : 'default', onClick: showSelectButton ? onSelect : undefined, children: _jsxs(VStack, { gap: 3, align: "stretch", p: 4, children: [_jsxs(HStack, { justify: "space-between", align: "start", children: [_jsx(Heading, { size: "md", flex: 1, children: exercise.name }), showSelectButton && (_jsx(Button, { size: "sm", colorScheme: isSelected ? 'gray' : 'teal', variant: isSelected ? 'outline' : 'solid', onClick: (e) => {
                                e.stopPropagation();
                                onSelect?.();
                            }, children: isSelected ? 'Selected' : 'Select' }))] }), _jsxs(HStack, { gap: 2, children: [_jsx(Badge, { colorScheme: getCategoryColor(exercise.category), size: "sm", children: exercise.category }), _jsx(Badge, { colorScheme: getDifficultyColor(exercise.difficulty), size: "sm", children: exercise.difficulty })] }), exercise.description && (_jsx(Text, { fontSize: "sm", color: "gray.600", children: exercise.description })), exercise.muscleGroups.length > 0 && (_jsxs(Box, { children: [_jsx(Text, { fontSize: "xs", fontWeight: "medium", mb: 1, children: "Target Muscles:" }), _jsxs(HStack, { gap: 1, wrap: "wrap", children: [exercise.muscleGroups.slice(0, 3).map(group => (_jsx(Badge, { size: "xs", colorScheme: "gray", children: group }, group))), exercise.muscleGroups.length > 3 && (_jsxs(Badge, { size: "xs", colorScheme: "gray", children: ["+", exercise.muscleGroups.length - 3, " more"] }))] })] })), exercise.equipment && exercise.equipment.length > 0 && (_jsxs(Box, { children: [_jsx(Text, { fontSize: "xs", fontWeight: "medium", mb: 1, children: "Equipment:" }), _jsxs(HStack, { gap: 1, wrap: "wrap", children: [exercise.equipment.slice(0, 2).map(equipment => (_jsx(Badge, { size: "xs", colorScheme: "blue", children: equipment }, equipment))), exercise.equipment.length > 2 && (_jsxs(Badge, { size: "xs", colorScheme: "blue", children: ["+", exercise.equipment.length - 2, " more"] }))] })] }))] }) }));
}
