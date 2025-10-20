// Add custom matchers for React Testing Library
require('@testing-library/jest-dom')
// Polyfill TextEncoder for Node.js 18+ test environment
const { TextEncoder } = require('util');
global.TextEncoder = TextEncoder;
