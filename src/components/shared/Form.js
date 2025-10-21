import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Stack, Text } from '@chakra-ui/react';
import Button from './Button';
export default function Form({ title, fields, onSubmit, submitLabel, isLoading = false, error, children }) {
    return (_jsxs(Box, { as: "form", role: "form", "aria-labelledby": title ? "form-title" : undefined, onSubmit: onSubmit, children: [title && (_jsx(Text, { id: "form-title", fontSize: "lg", fontWeight: "bold", mb: 4, children: title })), error && (_jsx(Text, { color: "red.400", fontSize: "sm", mb: 4, role: "alert", children: error })), _jsxs(Stack, { gap: 4, align: "stretch", children: [fields.map((field) => (_jsxs(Box, { children: [_jsxs("label", { htmlFor: field.name, style: {
                                    color: '#D1D5DB',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    marginBottom: '8px',
                                    display: 'block'
                                }, children: [field.label, field.required && _jsx("span", { style: { color: '#F56565', marginLeft: '4px' }, children: "*" })] }), field.type === 'textarea' ? (_jsx("textarea", { id: field.name, value: field.value, onChange: (e) => field.onChange(e.target.value), placeholder: field.placeholder, style: {
                                    backgroundColor: '#2a2a32',
                                    border: '2px solid #4B5563',
                                    color: 'white',
                                    borderRadius: '6px',
                                    padding: '12px',
                                    minHeight: '100px',
                                    width: '100%',
                                    fontSize: '14px',
                                    fontFamily: 'inherit'
                                }, disabled: field.disabled, "aria-label": field['aria-label'], "aria-invalid": !!error, required: field.required, rows: 4 })) : (_jsx("input", { id: field.name, type: field.type || 'text', value: field.value, onChange: (e) => field.onChange(e.target.value), placeholder: field.placeholder, style: {
                                    backgroundColor: '#2a2a32',
                                    border: '2px solid #4B5563',
                                    color: 'white',
                                    borderRadius: '6px',
                                    padding: '12px',
                                    width: '100%',
                                    fontSize: '14px',
                                    fontFamily: 'inherit'
                                }, disabled: field.disabled, "aria-label": field['aria-label'], "aria-invalid": !!error, required: field.required }))] }, field.name))), children, _jsx(Button, { type: "submit", colorScheme: "teal", variant: "solid", size: "md", loading: isLoading, "aria-label": submitLabel, disabled: isLoading, children: submitLabel })] })] }));
}
