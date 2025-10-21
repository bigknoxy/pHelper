import { Box, Text } from '@chakra-ui/react'

interface ErrorMessageProps {
  title?: string
  message: string
  variant?: 'error' | 'warning'
}

export default function ErrorMessage({ title, message, variant = 'error' }: ErrorMessageProps) {
  const color = variant === 'warning' ? 'orange' : 'red'

  return (
    <Box 
      bg="#2a1a1a" 
      border="1px solid" 
      borderColor={`${color}.500`} 
      borderRadius="md" 
      p={4} 
      mb={4}
      role="alert"
      aria-live="assertive"
    >
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Box 
          w={4} 
          h={4} 
          borderRadius="full" 
          bg={`${color}.500`}
          aria-hidden
        />
        {title && (
          <Text color={`${color}.300`} fontWeight="bold">
            {title}
          </Text>
        )}
      </Box>
      <Text color="gray.300" fontSize="sm">
        {message}
      </Text>
    </Box>
  )
}
