
# Copilot Instructions for pHelper (MVP)

## Project Overview
- **Stack:** React 19, TypeScript, Vite, Chakra UI, Recharts, Jest, ESLint
- **Main UI Components:** `src/components/WeightTracker.tsx`, `WorkoutLogger.tsx`, `TaskTracker.tsx`
- **Entry Point:** `src/App.tsx` (tabbed navigation)
- **Styling:** Dark theme, teal accent, Chakra UI components

## Architecture & Patterns
- **Tabbed Navigation:** All trackers are accessed via tabs in `App.tsx`.
- **Local Storage:** All data is stored locally for privacy/offline use.
- **Component Structure:** Each tracker is a standalone component. Add new trackers in `src/components/` and update `App.tsx`.
- **Testing:** Co-located Jest test files (e.g., `TaskTracker.test.tsx`).

## Developer Workflows
- **Install:** `npm install`
- **Dev Server:** `npm run dev` (hot reload)
- **Build:** `npm run build`
- **Test:** `npm test`
- **Lint:** `npx eslint .`

## UI/UX Conventions
- Tabs: Modern dark theme, teal highlight for selected tab
- "Add" buttons: Solid, rounded, bold, clear hover/focus
- Date pickers: Default to today
- Weight: US pounds (lb)

## Integration Points
- **External Libraries:** Chakra UI, Recharts, React, Vite, Jest, ESLint
- **No backend integration**

## Examples
- To add a new tracker:
  1. Create `NewTracker.tsx` in `src/components/`
  2. Add styles to `App.css` or a new CSS file
  3. Add `NewTracker.test.tsx` for tests
  4. Import and add to tab list in `App.tsx`

## Key Files
- `src/components/`: All main UI components
- `src/App.tsx`: Tabbed navigation and layout
- `vite.config.ts`: Vite build/dev config
- `eslint.config.js`: Lint rules
- `jest.config.js`/`jest.config.cjs`: Test config
- `README.md`: Setup, features, and usage

---
**Feedback:** If any section is unclear or missing, specify which workflows, patterns, or integrations need more detail.
