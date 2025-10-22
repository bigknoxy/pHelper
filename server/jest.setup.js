// Add custom matchers for React Testing Library
require('@testing-library/jest-dom')
// Polyfill TextEncoder for Node.js 18+ test environment
const { TextEncoder } = require('util')
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder
}
