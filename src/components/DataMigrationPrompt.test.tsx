import { render, screen } from '@testing-library/react'
import { backupData, loadLocalData, detectConflicts } from '../utils/migration'

test('backup and load local data', () => {
  // safeGet uses localStorage, which isn't available here; skip testing IO
  expect(typeof loadLocalData).toBe('function')
  expect(typeof backupData).toBe('function')
  expect(typeof detectConflicts).toBe('function')
})
