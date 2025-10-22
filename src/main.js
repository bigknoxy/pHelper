import { jsx as _jsx } from "react/jsx-runtime";
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/shared/ErrorBoundary';
import theme from './theme';
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 1,
        },
        mutations: {
            retry: 1,
        },
    },
});
createRoot(document.getElementById('root')).render(_jsx(StrictMode, { children: _jsx(QueryClientProvider, { client: queryClient, children: _jsx(ChakraProvider, { value: theme, children: _jsx(AuthProvider, { children: _jsx(ErrorBoundary, { children: _jsx(App, {}) }) }) }) }) }));
