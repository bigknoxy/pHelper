import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from '@chakra-ui/react';
export default function ErrorMessage({ title, message, variant = 'error' }) {
    const color = variant === 'warning' ? 'orange' : 'red';
    return (_jsxs(Box, { bg: "#2a1a1a", border: "1px solid", borderColor: `${color}.500`, borderRadius: "md", p: 4, mb: 4, role: "alert", "aria-live": "assertive", children: [_jsxs(Box, { display: "flex", alignItems: "center", gap: 2, mb: 2, children: [_jsx(Box, { w: 4, h: 4, borderRadius: "full", bg: `${color}.500`, "aria-hidden": true }), title && (_jsx(Text, { color: `${color}.300`, fontWeight: "bold", children: title }))] }), _jsx(Text, { color: "gray.300", fontSize: "sm", children: message })] }));
}
