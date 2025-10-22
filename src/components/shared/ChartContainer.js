import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box } from '@chakra-ui/react';
import { ResponsiveContainer } from 'recharts';
export default function ChartContainer({ title, height = 200, children, loading }) {
    return (_jsxs(Box, { children: [title && (_jsx(Box, { color: "gray.300", fontSize: "sm", fontWeight: "medium", mb: 3, children: title })), _jsx(Box, { bg: "#1a1a1f", p: 4, borderRadius: "md", border: "1px solid", borderColor: "gray.700", children: loading ? (_jsx(Box, { display: "flex", alignItems: "center", justifyContent: "center", height: height, color: "gray.500", children: "Loading chart..." })) : (_jsx(ResponsiveContainer, { width: "100%", height: height, children: children })) })] }));
}
