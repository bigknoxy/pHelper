# AGENTS.md

## Build, Lint, and Test Commands
- **Install:** `npm install`
- **Dev server:** `npm run dev`
- **Build:** `npm run build`
- **Lint:** `npm run lint` or `npx eslint .`
- **Test all:** `npm test`
- **Test single file:** `npx jest src/components/TaskTracker.test.tsx`
- **Preview build:** `npm run preview`

## Code Style Guidelines
- **Imports:** Use ES6 imports; group external before internal; absolute paths for `src/components/*`.
- **Formatting:** 2 spaces, no semicolons, trailing commas in objects/arrays.
- **Types:** Use TypeScript for all components; prefer explicit types for props, state, and functions.
- **Naming:** PascalCase for components, camelCase for variables/functions, UPPER_SNAKE_CASE for constants.
- **Error Handling:** Use try/catch for localStorage and async code; fail gracefully (return empty array/object).
- **Components:** Functional components only; co-locate tests as `*.test.tsx`.
- **UI:** Chakra UI for layout, dark theme, teal accent; solid, rounded "Add" buttons.
- **Tabs:** Modern dark theme, teal highlight for selected tab.
- **Data:** Store locally (no backend); use US pounds for weight.
- **Testing:** Use Jest + Testing Library; test files next to components.
- **Linting:** ESLint with recommended, React Hooks, TypeScript, and Vite configs.
- **Extending:** Add new trackers in `src/components/`, update `App.tsx` tab list.

## Design Documents
- See [design/persistence-postgres.md](design/persistence-postgres.md) for the persistent storage architecture and migration plan.

---

If you want to improve or extend this file, let me know!
