import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

// Create a QueryClient for tests. Configure to avoid background refetches
// so tests don't trigger "not wrapped in act" warnings.
export const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
    mutations: {
      retry: false,
    },
  },
})

// Wrapper component for QueryClientProvider in tests
export const QueryClientWrapper = ({ children, client }: { children: React.ReactNode; client?: QueryClient }) => {
  const queryClient = client || createTestQueryClient()
  return React.createElement(QueryClientProvider, { client: queryClient }, children)
}

