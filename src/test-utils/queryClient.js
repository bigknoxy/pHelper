import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
// Create a QueryClient for tests
export const createTestQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
        mutations: {
            retry: false,
        },
    },
});
// Wrapper component for QueryClientProvider in tests
export const QueryClientWrapper = ({ children, client }) => {
    const queryClient = client || createTestQueryClient();
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
};
