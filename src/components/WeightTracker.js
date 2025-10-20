import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Button, Heading, Text, Stack } from '@chakra-ui/react';
import { Input, List } from '@chakra-ui/react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { getWeights, addWeight } from '../api/weights';
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
    return (_jsx(Box, { children: !token ? (_jsx(Text, { color: "red.400", children: "Please log in to use the Weight Tracker." })) : (_jsxs(_Fragment, { children: [_jsx(Heading, { size: "md", mb: 4, children: "Log Your Weight" }), _jsxs(Stack, { gap: 4, align: "stretch", children: [_jsxs("label", { children: ["Date", _jsx(Input, { type: "date", value: date, "aria-label": "date", onChange: e => setDate(e.target.value) })] }), _jsxs("label", { children: ["Weight (lb)", _jsx(Input, { type: "number", value: weight, "aria-label": "weight", onChange: e => setWeight(e.target.value) })] }), _jsx(Button, { colorScheme: "teal", variant: "solid", size: "md", borderRadius: "md", boxShadow: "md", fontWeight: "bold", _hover: { bg: "teal.300", boxShadow: "lg", cursor: "pointer" }, loading: loading, onClick: handleAddEntry, children: "Add Entry" })] }), weightEntries.length > 0 && (_jsxs(Box, { mt: 8, children: [_jsx(Heading, { size: "sm", mb: 2, children: "History" }), _jsx(List.Root, { gap: "2", children: weightEntries.map((entry, idx) => (_jsx(List.Item, { children: _jsxs(Text, { children: [entry.date, ": ", entry.weight, " lb"] }) }, entry.id || idx))) }), _jsx(Heading, { size: "sm", mb: 2, children: "Trend" }), _jsx(ResponsiveContainer, { width: "100%", height: 200, children: _jsxs(LineChart, { data: weightEntries, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "date" }), _jsx(YAxis, {}), _jsx(Tooltip, {}), _jsx(Line, { type: "monotone", dataKey: "weight", stroke: "#3182ce" })] }) })] }))] })) }));
}
