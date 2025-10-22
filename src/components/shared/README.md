Shared components used across the app:

- Button.tsx - Chakra-wrapped accessible button
- Card.tsx - Styled container for panels
- Form.tsx - Complete form component with validation and accessibility
- FormInput.tsx - Labeled input with error handling
- List.tsx - Accessible list component with card and default variants
- LoadingSpinner.tsx - Centered spinner with optional message
- ErrorMessage.tsx - Styled error panel
- ChartContainer.tsx - Wrapper for responsive charts
- ErrorBoundary.tsx - React error boundary component

Guidelines:
- Prefer using these components in pages and feature components
- Keep ARIA labels on interactive elements
- Use Chakra color tokens where possible
- Form component provides consistent form patterns with proper accessibility
- List component supports both card and default display variants
