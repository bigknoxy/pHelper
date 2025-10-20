import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Button, Heading, Text, Stack, Input } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { getWorkouts, addWorkout } from '../api/workouts';
export default function WorkoutLogger() {
    const { token } = useAuth();
    const [workoutEntries, setWorkoutEntries] = useState([]);
    const today = new Date().toISOString().slice(0, 10);
    const [date, setDate] = useState(today);
    const [type, setType] = useState('');
    const [duration, setDuration] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    // local storage key kept for backward compatibility; component prefers API when token is present
    // mark as used to satisfy lint (kept for backward compatibility)
    const LOCAL_STORAGE_KEY = 'workoutEntries';
    void LOCAL_STORAGE_KEY;
    useEffect(() => {
        if (!token)
            return;
        setLoading(true);
        getWorkouts()
            .then((data) => setWorkoutEntries(data))
            .finally(() => setLoading(false));
    }, [token]);
    const handleAddEntry = async () => {
        if (!date || !type || !duration)
            return;
        setLoading(true);
        try {
            const entry = await addWorkout(type, parseInt(duration), date, notes);
            setWorkoutEntries(prev => [...prev, entry]);
            setDate(today);
            setType('');
            setDuration('');
            setNotes('');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx(Box, { children: !token ? (_jsx(Text, { color: "red.400", children: "Please log in to use the Workout Logger." })) : (_jsxs(_Fragment, { children: [_jsx(Heading, { size: "md", mb: 4, children: "Log Your Workout" }), _jsxs(Stack, { gap: 4, align: "stretch", children: [_jsxs("label", { children: ["Date", _jsx(Input, { type: "date", "aria-label": "date", value: date, onChange: e => setDate(e.target.value) })] }), _jsxs("label", { children: ["Type", _jsx(Input, { "aria-label": "type", value: type, onChange: e => setType(e.target.value), placeholder: "e.g. Running" })] }), _jsxs("label", { children: ["Duration (min)", _jsx(Input, { type: "number", "aria-label": "duration", value: duration, onChange: e => setDuration(e.target.value) })] }), _jsxs("label", { children: ["Notes", _jsx(Input, { "aria-label": "notes", value: notes, onChange: e => setNotes(e.target.value) })] }), _jsx(Button, { colorScheme: "teal", variant: "solid", size: "md", borderRadius: "md", boxShadow: "md", fontWeight: "bold", _hover: { bg: "teal.300", boxShadow: "lg", cursor: "pointer" }, loading: loading, "aria-label": "Add Workout", onClick: handleAddEntry, children: "Add Workout" })] }), workoutEntries.length > 0 && (_jsxs(Box, { mt: 8, children: [_jsx(Heading, { size: "sm", mb: 2, children: "History" }), _jsx(Stack, { gap: 2, children: workoutEntries.map((entry, idx) => (_jsx(Box, { children: _jsxs(Text, { children: [entry.date, ": ", entry.type, ", ", entry.duration, " min, ", entry.notes] }) }, entry.id || idx))) })] }))] })) }));
}
