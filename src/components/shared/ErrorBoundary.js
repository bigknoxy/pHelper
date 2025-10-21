import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Box } from '@chakra-ui/react';
import ErrorMessage from './ErrorMessage';
import Button from './Button';
export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, info) {
        // send to analytics/logging
        console.error('Uncaught error:', error, info);
    }
    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };
    render() {
        if (this.state.hasError) {
            const message = this.state.error?.message || 'Something went wrong.';
            return (_jsxs(Box, { p: 6, children: [_jsx(ErrorMessage, { title: "Application Error", message: message }), _jsx(Button, { mt: 4, onClick: this.handleReset, "aria-label": "Retry after error", colorScheme: "teal", children: "Retry" })] }));
        }
        return this.props.children;
    }
}
