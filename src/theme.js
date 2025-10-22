import { createSystem, defaultConfig } from '@chakra-ui/react';
const theme = createSystem(defaultConfig, {
    theme: {
        tokens: {
            colors: {
                primary: {
                    50: { value: '#e6fbff' },
                    100: { value: '#bff3fb' },
                    200: { value: '#99ebf6' },
                    300: { value: '#4fe0f0' },
                    400: { value: '#17c8ef' },
                    500: { value: '#0bc5ea' }, // main teal accent
                    600: { value: '#0899b3' },
                    700: { value: '#06737f' },
                    800: { value: '#044d4b' },
                    900: { value: '#012826' },
                },
                accent: {
                    500: { value: '#0dd5fa' },
                    600: { value: '#0ab8dc' },
                },
                background: {
                    900: { value: '#18181b' }, // app background (dark)
                    800: { value: '#0f1112' },
                },
                surface: {
                    900: { value: '#23232a' }, // primary surface (cards, nav)
                    800: { value: '#2a2a32' }, // highlighted surface
                    700: { value: '#1f1f24' },
                    tooltip: { value: '#1F2937' },
                },
                text: {
                    primary: { value: '#E6EEF6' },
                    muted: { value: '#9CA3AF' },
                    inverted: { value: '#FFFFFF' },
                },
                muted: {
                    700: { value: '#4B5563' },
                    600: { value: '#6B7280' },
                },
                error: {
                    500: { value: '#F56565' },
                    600: { value: '#C53030' },
                },
                success: {
                    500: { value: '#38b2ac' },
                },
                warning: {
                    500: { value: '#F6AD55' },
                },
            },
        },
    },
});
export default theme;
