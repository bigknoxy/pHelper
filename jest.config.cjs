module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'ts-jest',
  },
  setupFilesAfterEnv: ['@testing-library/jest-dom', './jest.setup.js', './server/jest.setup.js', './src/setupTests.ts'],
  // Ignore e2e Playwright tests when running unit tests with Jest
  testPathIgnorePatterns: ['/e2e/'],
};
