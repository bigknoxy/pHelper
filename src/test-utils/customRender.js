import { jsx as _jsx } from "react/jsx-runtime";
import { render as rtlRender } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { AuthContext } from '../context/AuthContext';
import { QueryClientWrapper } from './queryClient';
import theme from '../theme';
// Basic custom render helper that wraps a UI with AuthContext and ChakraProvider
export function customRender(ui, options) {
    const { authValue } = options || {};
    const defaultAuth = {
        userId: null,
        token: null,
        loading: false,
        error: null,
        migrated: false,
        login: jest.fn(),
        register: jest.fn(),
        logout: jest.fn(),
        ...authValue,
    };
    try {
        return rtlRender(_jsx(QueryClientWrapper, { children: _jsx(AuthContext.Provider, { value: defaultAuth, children: _jsx(ChakraProvider, { value: theme, children: ui }) }) }));
    }
    catch (err) {
        // Log AggregateError inner errors for easier debugging
        // eslint-disable-next-line no-console
        console.error('customRender caught error:', err);
        if (err && err.errors) {
            // eslint-disable-next-line no-console
            console.error('AggregateError inner errors:');
            // eslint-disable-next-line no-console
            err.errors.forEach((e, i) => console.error(i, e && e.stack ? e.stack : e));
        }
        throw err;
    }
}
// Provide a render wrapper so tests can import { render } from this file
export function render(ui, options) {
    return customRender(ui, options);
}
export * from '@testing-library/react';
export default customRender;
