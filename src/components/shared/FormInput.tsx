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
  ...rest
}: FormInputProps) {
  // ensure there is an aria-label for accessibility
  const inputAria = ariaLabel ?? `${label}-input`

  return (
    <Box mb={4}>
      <Text 
        as="label"
        color="gray.300" 
        fontSize="sm" 
        fontWeight="medium"
        mb={2}
        display="block"
      >
        {label}
        {required && <Text as="span" color="red.400" ml={1}>*</Text>}
      </Text>
      <Input
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
        aria-describedby={error ? `${inputAria}-error` : undefined}
        {...rest}
      />
      {error && (
        <Text 
          id={`${inputAria}-error`}
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
