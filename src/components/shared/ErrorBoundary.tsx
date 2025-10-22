import React from 'react'
import { Box } from '@chakra-ui/react'
import ErrorMessage from './ErrorMessage'
import Button from './Button'

interface State {
  hasError: boolean
  error?: Error | null
}

export default class ErrorBoundary extends React.Component<React.PropsWithChildren<object>, State> {
  constructor(props: React.PropsWithChildren<object>) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // send to analytics/logging
    console.error('Uncaught error:', error, info)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      const message = this.state.error?.message || 'Something went wrong.'
      return (
        <Box p={6}>
          <ErrorMessage title="Application Error" message={message} />
          <Button mt={4} onClick={this.handleReset} aria-label="Retry after error" colorScheme="teal">
            Retry
          </Button>
        </Box>
      )
    }

    return this.props.children as React.ReactNode
  }
}
