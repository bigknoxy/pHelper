import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, Heading, Text, Stack, Input } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import Button from './shared/Button';
import { useWorkouts } from '../hooks/useWorkouts';
export default function WorkoutLogger() {
    const { token } = useAuth();
    const { workouts = [], addWorkout, isAdding } = useWorkouts(Boolean(token));
    const today = new Date().toISOString().slice(0, 10);
    const [date, setDate] = useState(today);
    const [type, setType] = useState('');
    const [duration, setDuration] = useState('');
    const [notes, setNotes] = useState('');
    // keep local state only for form inputs; data comes from the hook
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
            // eslint-disable-next-line no-console
            console.error('Failed to add workout', err);
        }
    };
    return (_jsx(Box, { children: !token ? (_jsx(Text, { color: "red.400", children: "Please log in to use the Workout Logger." })) : (_jsxs(_Fragment, { children: [_jsx(Heading, { size: "md", mb: 4, children: "Log Your Workout" }), _jsxs(Stack, { gap: 4, align: "stretch", children: [_jsxs("label", { children: ["Date", _jsx(Input, { type: "date", "aria-label": "date", value: date, onChange: e => setDate(e.target.value) })] }), _jsxs("label", { children: ["Type", _jsx(Input, { "aria-label": "type", value: type, onChange: e => setType(e.target.value), placeholder: "e.g. Running" })] }), _jsxs("label", { children: ["Duration (min)", _jsx(Input, { type: "number", "aria-label": "duration", value: duration, onChange: e => setDuration(e.target.value) })] }), _jsxs("label", { children: ["Notes", _jsx(Input, { "aria-label": "notes", value: notes, onChange: e => setNotes(e.target.value) })] }), _jsx(Button, { colorScheme: "teal", variant: "solid", size: "md", borderRadius: "md", boxShadow: "md", fontWeight: "bold", _hover: { bg: "teal.300", boxShadow: "lg", cursor: "pointer" }, loading: isAdding, "aria-label": "Add Workout", onClick: handleAddEntry, children: "Add Workout" })] }), workouts.length > 0 && (_jsxs(Box, { mt: 8, children: [_jsx(Heading, { size: "sm", mb: 2, children: "History" }), _jsx(Stack, { gap: 2, children: workouts.map((entry, idx) => (_jsx(Box, { children: _jsxs(Text, { children: [entry.date, ": ", entry.type, ", ", entry.duration, " min, ", entry.notes] }) }, entry.id || idx))) })] }))] })) }));
}
