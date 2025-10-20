import { backupData, loadLocalData, detectConflicts } from '../utils/migration'

test('migration util functions exist', () => {
  expect(typeof loadLocalData).toBe('function')
  expect(typeof backupData).toBe('function')
  expect(typeof detectConflicts).toBe('function')
})
