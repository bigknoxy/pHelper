import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Stack, Text } from '@chakra-ui/react';
export default function List({ items, title, emptyMessage = 'No items to display', variant = 'default', ariaLabel }) {
    if (items.length === 0) {
        return (_jsxs(Box, { role: "region", "aria-labelledby": title ? "list-title" : undefined, children: [title && (_jsx(Text, { id: "list-title", fontSize: "lg", fontWeight: "bold", mb: 4, children: title })), _jsx(Text, { color: "gray.500", textAlign: "center", py: 8, children: emptyMessage })] }));
    }
    return (_jsxs(Box, { role: "region", "aria-labelledby": title ? "list-title" : undefined, "aria-label": ariaLabel, children: [title && (_jsx(Text, { id: "list-title", fontSize: "lg", fontWeight: "bold", mb: 4, children: title })), _jsx(Stack, { gap: 2, as: "ul", listStyleType: "none", children: items.map((item) => (_jsxs(Box, { as: "li", display: "flex", alignItems: "center", justifyContent: "space-between", p: variant === 'card' ? 3 : 2, borderWidth: variant === 'card' ? "1px" : "0", borderRadius: variant === 'card' ? "md" : "none", borderColor: variant === 'card' ? "gray.600" : "transparent", bg: variant === 'card' ? "surface.800" : "transparent", _hover: variant === 'card' ? { bg: "surface.700" } : undefined, children: [_jsx(Box, { flex: 1, children: item.content }), item.actions && (_jsx(Box, { ml: 4, children: item.actions }))] }, item.id))) })] }));
}
