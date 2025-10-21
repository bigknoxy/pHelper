module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  // Only run TypeScript test files (ignore .js tests to unblock CI)
  testMatch: ['**/?(*.)+(test|spec).ts?(x)'],
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'ts-jest',
  },
  setupFilesAfterEnv: ['@testing-library/jest-dom', './jest.setup.js', './server/jest.setup.js', './src/setupTests.ts'],
  // Ignore e2e Playwright tests when running unit tests with Jest
  testPathIgnorePatterns: ['/e2e/'],
};

