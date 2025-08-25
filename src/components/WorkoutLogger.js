import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Button, Heading, Text, Stack } from '@chakra-ui/react';
import { Input, List } from '@chakra-ui/react';
const LOCAL_STORAGE_KEY = 'workoutEntries';
export default function WorkoutLogger() {
    const [workoutEntries, setWorkoutEntries] = useState([]);
    // Auto-select today's date in YYYY-MM-DD format
    const today = new Date().toISOString().slice(0, 10);
    const [date, setDate] = useState(today);
    const [type, setType] = useState('');
    const [duration, setDuration] = useState('');
    const [notes, setNotes] = useState('');
    useEffect(() => {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
            setWorkoutEntries(JSON.parse(stored));
        }
    }, []);
    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(workoutEntries));
    }, [workoutEntries]);
    const handleAddEntry = () => {
        if (!date || !type || !duration)
            return;
        setWorkoutEntries([
            ...workoutEntries,
            { date, type, duration: parseInt(duration), notes },
        ]);
        setDate('');
        setType('');
        setDuration('');
        setNotes('');
    };
    return (_jsxs(Box, { children: [_jsx(Heading, { size: "md", mb: 4, children: "Log Your Workout" }), _jsxs(Stack, { gap: 4, align: "stretch", children: [_jsxs("label", { children: ["Date", _jsx(Input, { type: "date", "aria-label": "date", value: date, onChange: e => setDate(e.target.value) })] }), _jsxs("label", { children: ["Type", _jsx(Input, { "aria-label": "type", value: type, onChange: e => setType(e.target.value), placeholder: "e.g. Running" })] }), _jsxs("label", { children: ["Duration (min)", _jsx(Input, { type: "number", "aria-label": "duration", value: duration, onChange: e => setDuration(e.target.value) })] }), _jsxs("label", { children: ["Notes", _jsx(Input, { "aria-label": "notes", value: notes, onChange: e => setNotes(e.target.value) })] }), _jsx(Button, { colorScheme: "teal", variant: "solid", size: "md", borderRadius: "md", boxShadow: "md", fontWeight: "bold", _hover: { bg: "teal.300", boxShadow: "lg", cursor: "pointer" }, children: "Add Workout" })] }), workoutEntries.length > 0 && (_jsxs(Box, { mt: 8, children: [_jsx(Heading, { size: "sm", mb: 2, children: "History" }), _jsx(List.Root, { gap: "2", children: workoutEntries.map((entry, idx) => (_jsx(List.Item, { children: _jsxs(Text, { children: [entry.date, ": ", entry.type, ", ", entry.duration, " min, ", entry.notes] }) }, idx))) })] }))] }));
}
