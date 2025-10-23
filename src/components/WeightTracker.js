import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Text, Stack } from '@chakra-ui/react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { getWeights, addWeight } from '../api/weights';
import FormInput from './shared/FormInput';
import Button from './shared/Button';
import WeightGoalWizard from './weight/WeightGoalWizard';
import GoalProgressTracker from './weight/GoalProgressTracker';
import BMIIndicator from './weight/BMIIndicator';
export default function WeightTracker() {
    const { token } = useAuth();
    const [weightEntries, setWeightEntries] = useState([]);
    const today = new Date().toISOString().slice(0, 10);
    const [date, setDate] = useState(today);
    const [weight, setWeight] = useState('');
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (!token)
            return;
        setLoading(true);
        getWeights()
            .then((data) => setWeightEntries(data))
            .finally(() => setLoading(false));
    }, [token]);
    const handleAddEntry = async () => {
        if (!date || !weight)
            return;
        setLoading(true);
        try {
            const entry = await addWeight(parseFloat(weight), date);
            setWeightEntries([...weightEntries, entry]);
            setDate(today);
            setWeight('');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx(Box, { children: !token ? (_jsx(Text, { color: "red.400", children: "Please log in to use the Weight Tracker." })) : (_jsxs(_Fragment, { children: [_jsxs(Box, { as: "form", role: "form", "aria-labelledby": "weight-form-heading", onSubmit: e => {
                        e.preventDefault();
                        handleAddEntry();
                    }, children: [_jsx(Text, { id: "weight-form-heading", fontSize: "lg", fontWeight: "bold", mb: 4, children: "Log Your Weight" }), _jsxs(Stack, { gap: 4, align: "stretch", children: [_jsx(FormInput, { label: "Date", type: "date", value: date, onChange: setDate, required: true, "aria-label": "Weight entry date" }), _jsx(FormInput, { label: "Weight (lb)", type: "number", value: weight, onChange: setWeight, placeholder: "Enter your weight in pounds", required: true, "aria-label": "Weight in pounds" }), _jsx(Button, { type: "submit", colorScheme: "teal", variant: "solid", size: "md", loading: loading, "aria-label": "Add weight entry", children: "Add Entry" })] })] }), _jsx(Box, { mt: 8, children: _jsx(WeightGoalWizard, {}) }), _jsx(Box, { mt: 8, children: _jsx(GoalProgressTracker, {}) }), _jsx(Box, { mt: 8, children: _jsx(BMIIndicator, {}) }), weightEntries.length > 0 && (_jsxs(Box, { mt: 8, role: "region", "aria-labelledby": "weight-history-heading", children: [_jsx(Text, { id: "weight-history-heading", fontSize: "lg", fontWeight: "bold", mb: 4, children: "Weight History" }), _jsx(Stack, { gap: 2, as: "ul", listStyleType: "none", mb: 6, children: weightEntries.map((entry, idx) => (_jsx(Box, { as: "li", p: 2, borderWidth: "1px", borderRadius: "md", borderColor: "gray.600", bg: "surface.800", children: _jsxs(Text, { children: [new Date(entry.date).toLocaleDateString(), ": ", entry.weight, " lb"] }) }, entry.id || idx))) }), _jsx(Text, { fontSize: "lg", fontWeight: "bold", mb: 4, children: "Weight Trend" }), _jsx(Box, { borderWidth: "1px", borderRadius: "md", borderColor: "gray.600", p: 4, bg: "surface.800", children: _jsx(ResponsiveContainer, { width: "100%", height: 200, children: _jsxs(LineChart, { data: weightEntries, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#4B5563" }), _jsx(XAxis, { dataKey: "date", stroke: "#9CA3AF", fontSize: 12, tickFormatter: (value) => new Date(value).toLocaleDateString() }), _jsx(YAxis, { stroke: "#9CA3AF", fontSize: 12 }), _jsx(Tooltip, { contentStyle: {
                                                backgroundColor: '#1F2937',
                                                border: '1px solid #374151',
                                                borderRadius: '6px',
                                                color: '#F3F4F6'
                                            } }), _jsx(Line, { type: "monotone", dataKey: "weight", stroke: "#0bc5ea", strokeWidth: 2 })] }) }) })] }))] })) }));
}
