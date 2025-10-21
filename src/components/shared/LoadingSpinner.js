import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Spinner, Box, Text } from '@chakra-ui/react';
export default function LoadingSpinner({ size = 'md', message }) {
    return (_jsxs(Box, { display: "flex", flexDirection: "column", alignItems: "center", gap: 3, py: 8, role: "status", "aria-live": "polite", children: [_jsx(Spinner, { size: size, 
                // keep teal accent
                color: "primary.500", "aria-label": "Loading" }), message && (_jsx(Text, { color: "gray.400", fontSize: "sm", children: message }))] }));
}
