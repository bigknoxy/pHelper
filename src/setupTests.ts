// Jest setup for React Testing Library custom matchers
import '@testing-library/jest-dom'

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toBeChecked(): R
    }
  }
}
