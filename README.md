
# pHelper: Personal Tracker MVP

## Overview
pHelper is a modern React + TypeScript app built with Vite, Chakra UI, and Recharts. It provides three main trackers:

- **Weight Tracker**: Log daily weight in pounds (lb), auto-selects today's date, shows history and trend chart.
- **Workout Logger**: Log workouts (date auto-selected), type, duration, and notes. History is shown.
- **Task Tracker**: Add, complete, and delete tasks. All data is stored in localStorage for privacy and offline use.

## Features
- Fast, responsive UI with a dark theme and teal accent color.
- Tabbed navigation for easy switching between trackers.
- All "Add" buttons are visually distinct and interactive.
- Date pickers default to today for convenience.
- No backend required; all data is local.

## Getting Started
1. Install dependencies:
  ```bash
  npm install
  ```
2. Start the dev server:
  ```bash
  npm run dev
  ```
3. Build for production:
  ```bash
  npm run build
  ```
4. Run tests:
  ```bash
  npm test
  ```

## Code Structure
- `src/components/`: Main UI components (WeightTracker, WorkoutLogger, TaskTracker)
- `src/App.tsx`: Tabbed navigation and main layout
- `src/assets/`, `public/`: Static assets
- `App.css`, `index.css`: Styling

## UI/UX Conventions
- Tabs use a modern dark theme with teal highlight for the selected tab.
- All "Add" buttons have solid backgrounds, rounded corners, and clear hover/focus states.
- Forms use Chakra UI for accessibility and consistency.

## Customization
- To add a new tracker, create a new component in `src/components/`, add it to the tab list in `App.tsx`, and follow the co-location pattern for tests.

## Tech Stack
- React 19, TypeScript, Vite, Chakra UI, Recharts
- Jest for testing, ESLint for linting

## License
MIT
