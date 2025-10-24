import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { Box, Heading, Text, Input, SimpleGrid, Badge, HStack, VStack, Button, Flex, } from '@chakra-ui/react';
import { useWorkoutTemplates, useWorkoutTemplateCategories } from '../hooks/useWorkoutTemplates';
import Card from './shared/Card';
export default function WorkoutTemplates({ onSelectTemplate, onCreateWorkout }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [showPublicOnly, setShowPublicOnly] = useState(false);
    // Fetch data
    const { templates, isLoading, error } = useWorkoutTemplates({
        search: searchTerm,
        category: selectedCategory,
        isPublic: showPublicOnly,
        limit: 50,
    });
    const { data: categories = [] } = useWorkoutTemplateCategories();
    // Filter templates based on search and category
    const filteredTemplates = useMemo(() => {
        return templates.filter(template => {
            const matchesSearch = !searchTerm ||
                template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                template.description?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = !selectedCategory || template.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [templates, searchTerm, selectedCategory]);
    // Group templates by category for display
    const templatesByCategory = useMemo(() => {
        const grouped = {};
        filteredTemplates.forEach(template => {
            if (!grouped[template.category]) {
                grouped[template.category] = [];
            }
            grouped[template.category].push(template);
        });
        return grouped;
    }, [filteredTemplates]);
    const handleTemplateSelect = (template) => {
        if (onSelectTemplate) {
            onSelectTemplate(template);
        }
    };
    const handleCreateWorkout = (template) => {
        if (onCreateWorkout) {
            onCreateWorkout(template);
        }
    };
    if (error) {
        return (_jsx(Box, { p: 4, bg: "red.50", borderRadius: "md", border: "1px", borderColor: "red.200", children: _jsx(Text, { color: "red.600", children: "Failed to load workout templates. Please try again." }) }));
    }
    return (_jsx(Box, { children: _jsxs(VStack, { gap: 6, align: "stretch", children: [_jsxs(Box, { children: [_jsx(Heading, { size: "lg", mb: 2, children: "Workout Templates" }), _jsx(Text, { color: "gray.600", children: "Browse and manage workout templates to quickly start your workouts" })] }), _jsx(Card, { children: _jsx(VStack, { gap: 4, align: "stretch", p: 6, children: _jsxs(HStack, { gap: 4, children: [_jsx(Input, { placeholder: "Search templates...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), flex: 1 }), _jsxs("select", { value: selectedCategory, onChange: (e) => setSelectedCategory(e.target.value), style: {
                                        padding: '8px',
                                        borderRadius: '6px',
                                        border: '1px solid #4A5568',
                                        backgroundColor: '#2D3748',
                                        color: 'white'
                                    }, children: [_jsx("option", { value: "", children: "All Categories" }), categories.map(category => (_jsx("option", { value: category, children: category.charAt(0) + category.slice(1).toLowerCase() }, category)))] }), _jsx(Button, { size: "sm", variant: showPublicOnly ? 'solid' : 'outline', colorScheme: showPublicOnly ? 'teal' : 'gray', onClick: () => setShowPublicOnly(!showPublicOnly), children: showPublicOnly ? 'Public Only' : 'All Templates' })] }) }) }), isLoading ? (_jsx(Flex, { justify: "center", py: 8, children: _jsx(Text, { children: "Loading templates..." }) })) : filteredTemplates.length === 0 ? (_jsx(Card, { children: _jsx(Text, { textAlign: "center", py: 8, color: "gray.500", children: "No templates found matching your criteria." }) })) : (_jsx(VStack, { gap: 6, align: "stretch", children: Object.entries(templatesByCategory).map(([category, categoryTemplates]) => (_jsx(Card, { children: _jsxs(VStack, { gap: 4, align: "stretch", p: 6, children: [_jsx(HStack, { justify: "space-between", children: _jsxs(Text, { fontSize: "lg", fontWeight: "medium", children: [category.charAt(0) + category.slice(1).toLowerCase(), " (", categoryTemplates.length, ")"] }) }), _jsx(SimpleGrid, { columns: { base: 1, md: 2, lg: 3 }, gap: 4, children: categoryTemplates.map(template => (_jsx(WorkoutTemplateCard, { template: template, onSelect: () => handleTemplateSelect(template), onCreateWorkout: () => handleCreateWorkout(template) }, template.id))) })] }) }, category))) }))] }) }));
}
function WorkoutTemplateCard({ template, onSelect, onCreateWorkout }) {
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
    return (_jsx(Card, { children: _jsxs(VStack, { gap: 3, align: "stretch", p: 4, children: [_jsxs(HStack, { justify: "space-between", children: [_jsx(Heading, { size: "md", flex: 1, children: template.name }), template.isPublic && (_jsx(Badge, { colorScheme: "green", size: "sm", children: "Public" }))] }), _jsx(Badge, { colorScheme: getCategoryColor(template.category), size: "sm", children: template.category }), template.description && (_jsx(Text, { fontSize: "sm", color: "gray.600", children: template.description })), _jsxs(VStack, { gap: 2, align: "stretch", children: [_jsxs(Text, { fontSize: "xs", fontWeight: "medium", children: ["Exercises (", template.exercises.length, "):"] }), _jsxs(VStack, { gap: 1, align: "stretch", children: [template.exercises.slice(0, 3).map(exercise => (_jsxs(HStack, { justify: "space-between", children: [_jsx(Text, { fontSize: "xs", color: "gray.600", children: exercise.exercise.name }), _jsxs(HStack, { gap: 1, children: [_jsxs(Badge, { size: "xs", colorScheme: "gray", children: [exercise.sets, " sets"] }), exercise.reps && (_jsxs(Badge, { size: "xs", colorScheme: "gray", children: [exercise.reps, " reps"] }))] })] }, exercise.id))), template.exercises.length > 3 && (_jsxs(Text, { fontSize: "xs", color: "gray.500", children: ["+", template.exercises.length - 3, " more exercises"] }))] }), _jsxs(HStack, { gap: 2, children: [_jsx(Button, { size: "sm", colorScheme: "teal", variant: "outline", onClick: onSelect, flex: 1, children: "View Details" }), _jsx(Button, { size: "sm", colorScheme: "teal", onClick: onCreateWorkout, flex: 1, children: "Start Workout" })] })] })] }) }));
}
