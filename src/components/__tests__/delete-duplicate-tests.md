This file documents that the duplicate JS tests were removed to avoid ts-jest parsing issues.

Removed files:
- src/components/TaskTracker.test.js
- src/components/WorkoutLogger.test.js

Rationale: The repository contained duplicate test files in both .js and .tsx formats. ts-jest was attempting to compile the .js files without allowJs, causing "Cannot use import statement outside a module" runtime errors. To standardize on TypeScript tests and keep transforms simple, the .js duplicates were removed. Update or restore these files as .ts/.tsx if needed.
