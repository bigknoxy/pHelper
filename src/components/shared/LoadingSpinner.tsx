import { Spinner, Box, Text, SpinnerProps } from '@chakra-ui/react'

interface LoadingSpinnerProps {
  size?: SpinnerProps['size']
  message?: string
}

export default function LoadingSpinner({ size = 'md', message }: LoadingSpinnerProps) {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={3} py={8} role="status" aria-live="polite">
      <Spinner
        size={size}
        // keep teal accent
        color="primary.500"
        aria-label="Loading"
      />
      {message && (
        <Text color="gray.400" fontSize="sm">
          {message}
        </Text>
      )}
    </Box>
  )
}
