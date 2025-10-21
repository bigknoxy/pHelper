import { Button as ChakraButton, ButtonProps } from '@chakra-ui/react'

interface AppButtonProps extends ButtonProps {
  'aria-label'?: string
  // Chakra's Button typing may expose `loading` instead of `isLoading` depending on version.
  // Support both by accepting `loading` here and forwarding it to the underlying Chakra button.
  loading?: boolean
}

export default function Button(props: AppButtonProps) {
  const { children, ...rest } = props
  return (
    <ChakraButton
      {...rest}
      aria-label={props['aria-label']}
      transition="transform 0.15s ease, box-shadow 0.15s ease"
      _hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}
      _active={{ transform: 'translateY(0)' }}
      _focus={{ boxShadow: 'outline' }}
    >
      {children}
    </ChakraButton>
  )
}
