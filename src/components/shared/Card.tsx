import { Box, BoxProps } from '@chakra-ui/react'

interface CardProps extends BoxProps {
  children: React.ReactNode
  variant?: 'default' | 'highlighted'
}

export default function Card({ children, variant = 'default', ...props }: CardProps) {
  const bg = variant === 'highlighted' ? 'surface.800' : 'surface.900'
  const borderColor = variant === 'highlighted' ? 'primary.500' : 'transparent'

  return (
    <Box
      bg={bg}
      p={6}
      borderRadius="xl"
      boxShadow="md"
      border="2px solid"
      borderColor={borderColor}
      transition="all 0.2s"
      _hover={{
        transform: 'translateY(-2px)',
        boxShadow: 'lg',
        borderColor: variant === 'default' ? 'success.500' : 'primary.500',
      }}
      {...props}
    >
      {children}
    </Box>
  )
}