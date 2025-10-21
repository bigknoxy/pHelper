import { jsx as _jsx } from "react/jsx-runtime";
import { Box } from '@chakra-ui/react';
export default function Card({ children, variant = 'default', ...props }) {
    const bg = variant === 'highlighted' ? 'surface.800' : 'surface.900';
    const borderColor = variant === 'highlighted' ? 'primary.500' : 'transparent';
    return (_jsx(Box, { bg: bg, p: 6, borderRadius: "xl", boxShadow: "md", border: "2px solid", borderColor: borderColor, transition: "all 0.2s", _hover: {
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
            borderColor: variant === 'default' ? 'success.500' : 'primary.500',
        }, ...props, children: children }));
}
