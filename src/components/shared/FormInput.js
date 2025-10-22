import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Input, Box, Text } from '@chakra-ui/react';
export default function FormInput({ label, value, onChange, type = 'text', placeholder, error, required = false, disabled = false, 'aria-label': ariaLabel, id, name, ...rest }) {
    // Generate a unique id if not provided
    const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substr(2, 9)}`;
    const inputName = name || inputId;
    // ensure there is an aria-label for accessibility
    const inputAria = ariaLabel ?? `${label}-input`;
    return (_jsxs(Box, { mb: 4, children: [_jsxs("label", { htmlFor: inputId, style: {
                    color: '#D1D5DB',
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '8px',
                    display: 'block'
                }, children: [label, required && _jsx("span", { style: { color: '#F56565', marginLeft: '4px' }, children: "*" })] }), _jsx(Input, { id: inputId, name: inputName, value: value, onChange: (e) => onChange(e.target.value), type: type, placeholder: placeholder, bg: "surface.800", border: "2px solid", borderColor: error ? 'red.500' : 'gray.600', color: "white", _placeholder: { color: 'gray.500' }, _focus: {
                    borderColor: error ? 'red.500' : 'primary.500',
                    boxShadow: error ? '0 0 0 1px red.500' : '0 0 0 1px rgba(11,197,234,0.25)',
                }, borderRadius: "md", disabled: disabled, "aria-label": inputAria, "aria-invalid": !!error, "aria-describedby": error ? `${inputId}-error` : undefined, ...rest }), error && (_jsx(Text, { id: `${inputId}-error`, color: "red.400", fontSize: "xs", mt: 1, role: "alert", children: error }))] }));
}
