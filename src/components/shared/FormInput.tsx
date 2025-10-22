import { Input, Box, Text, InputProps } from '@chakra-ui/react'

interface FormInputProps extends Omit<InputProps, 'onChange' | 'size'> {
  label: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'email' | 'password' | 'number' | 'date'
  placeholder?: string
  error?: string
  required?: boolean
  disabled?: boolean
  'aria-label'?: string
  id?: string
  name?: string
}

export default function FormInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  error,
  required = false,
  disabled = false,
  'aria-label': ariaLabel,
  id,
  name,
  ...rest
}: FormInputProps) {
  // Generate a unique id if not provided
  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substr(2, 9)}`
  const inputName = name || inputId
  // ensure there is an aria-label for accessibility
  const inputAria = ariaLabel ?? `${label}-input`

  return (
    <Box mb={4}>
      <label
        htmlFor={inputId}
        style={{
          color: '#D1D5DB',
          fontSize: '14px',
          fontWeight: '500',
          marginBottom: '8px',
          display: 'block'
        }}
      >
        {label}
        {required && <span style={{ color: '#F56565', marginLeft: '4px' }}>*</span>}
      </label>
      <Input
        id={inputId}
        name={inputName}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        placeholder={placeholder}
        bg="surface.800"
        border="2px solid"
        borderColor={error ? 'red.500' : 'gray.600'}
        color="white"
        _placeholder={{ color: 'gray.500' }}
        _focus={{
          borderColor: error ? 'red.500' : 'primary.500',
          boxShadow: error ? '0 0 0 1px red.500' : '0 0 0 1px rgba(11,197,234,0.25)',
        }}
        borderRadius="md"
        disabled={disabled}
        aria-label={inputAria}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...rest}
      />
      {error && (
        <Text
          id={`${inputId}-error`}
          color="red.400"
          fontSize="xs"
          mt={1}
          role="alert"
        >
          {error}
        </Text>
      )}
    </Box>
  )
}
