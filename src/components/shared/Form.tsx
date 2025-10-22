import React from 'react';
import { Box, Stack, Text } from '@chakra-ui/react';
import Button from './Button';

interface FormField {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'textarea';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  'aria-label'?: string;
}

interface FormProps {
  title?: string;
  fields: FormField[];
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
  isLoading?: boolean;
  error?: string;
  children?: React.ReactNode;
}

export default function Form({
  title,
  fields,
  onSubmit,
  submitLabel,
  isLoading = false,
  error,
  children
}: FormProps) {
  return (
    <Box as="form" role="form" aria-labelledby={title ? "form-title" : undefined} onSubmit={onSubmit}>
      {title && (
        <Text id="form-title" fontSize="lg" fontWeight="bold" mb={4}>
          {title}
        </Text>
      )}

      {error && (
        <Text color="red.400" fontSize="sm" mb={4} role="alert">
          {error}
        </Text>
      )}

      <Stack gap={4} align="stretch">
        {fields.map((field) => (
          <Box key={field.name}>
            <label
              htmlFor={field.name}
              style={{
                color: '#D1D5DB',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px',
                display: 'block'
              }}
            >
              {field.label}
              {field.required && <span style={{ color: '#F56565', marginLeft: '4px' }}>*</span>}
            </label>
             {field.type === 'textarea' ? (
               <textarea
                 id={field.name}
                 name={field.name}
                 value={field.value}
                 onChange={(e) => field.onChange(e.target.value)}
                 placeholder={field.placeholder}
                 style={{
                   backgroundColor: '#2a2a32',
                   border: '2px solid #4B5563',
                   color: 'white',
                   borderRadius: '6px',
                   padding: '12px',
                   minHeight: '100px',
                   width: '100%',
                   fontSize: '14px',
                   fontFamily: 'inherit'
                 }}
                 disabled={field.disabled}
                 aria-label={field['aria-label']}
                 aria-invalid={!!error}
                 required={field.required}
                 rows={4}
               />
             ) : (
               <input
                 id={field.name}
                 name={field.name}
                 type={field.type || 'text'}
                 value={field.value}
                 onChange={(e) => field.onChange(e.target.value)}
                 placeholder={field.placeholder}
                 style={{
                   backgroundColor: '#2a2a32',
                   border: '2px solid #4B5563',
                   color: 'white',
                   borderRadius: '6px',
                   padding: '12px',
                   width: '100%',
                   fontSize: '14px',
                   fontFamily: 'inherit'
                 }}
                 disabled={field.disabled}
                 aria-label={field['aria-label']}
                 aria-invalid={!!error}
                 required={field.required}
               />
             )}
          </Box>
        ))}

        {children}

        <Button
          type="submit"
          colorScheme="teal"
          variant="solid"
          size="md"
          loading={isLoading}
          aria-label={submitLabel}
          disabled={isLoading}
        >
          {submitLabel}
        </Button>
      </Stack>
    </Box>
  );
}