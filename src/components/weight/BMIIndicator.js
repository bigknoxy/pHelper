import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, Text, VStack, HStack, Input, Button, } from '@chakra-ui/react';
import { useMutation } from '@tanstack/react-query';
import { calculateBMI } from '../../api/bmi';
const BMIIndicator = () => {
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [bmi, setBmi] = useState(null);
    const [category, setCategory] = useState('');
    const calculateBMIMutation = useMutation({
        mutationFn: (data) => calculateBMI(data.weight, data.height),
        onSuccess: (data) => {
            setBmi(data.bmi);
            setCategory(data.category);
        },
        onError: (error) => {
            alert('Error calculating BMI: ' + error.message);
        },
    });
    const handleCalculate = () => {
        if (!weight || !height)
            return;
        calculateBMIMutation.mutate({ weight: parseFloat(weight), height: parseFloat(height) });
    };
    return (_jsx(Box, { p: 4, borderWidth: 1, borderRadius: "md", children: _jsxs(VStack, { gap: 4, align: "stretch", children: [_jsx(Text, { fontSize: "lg", fontWeight: "bold", children: "BMI Calculator" }), _jsxs(HStack, { gap: 2, children: [_jsx(Input, { type: "number", placeholder: "Weight (lbs)", value: weight, onChange: (e) => setWeight(e.target.value) }), _jsx(Input, { type: "number", placeholder: "Height (inches)", value: height, onChange: (e) => setHeight(e.target.value) }), _jsx(Button, { onClick: handleCalculate, colorScheme: "teal", loading: calculateBMIMutation.isPending, children: "Calculate" })] }), bmi && (_jsxs(Box, { children: [_jsxs(Text, { children: ["Your BMI: ", bmi] }), _jsxs(Text, { children: ["Category: ", category] })] }))] }) }));
};
export default BMIIndicator;
