

# pHelper

A personal health and productivity tracker with tabbed navigation for weight, workouts, and tasks. Offline-first, mobile-friendly, and privacy-focused.

## Features

- Dashboard with summary metrics
- Weight, workout, and task tracking
- Modern dark theme with teal accent
- Mobile-friendly responsive design
- Local storage (no backend required)
- "Add" buttons with clear styling
- Date pickers default to today
- Weight tracked in US pounds (lb)

## Tech Stack

- React 19
- TypeScript
- Vite
- Chakra UI
- Recharts
- Jest
- ESLint

## Getting Started

1. **Install dependencies**
  ```sh
  npm install
  ```
2. **Start development server**
  ```sh
  npm run dev
  ```
3. **Build for production**
  ```sh
  npm run build
  ```
4. **Run tests**
  ```sh
  npm test
  ```
5. **Lint code**
  ```sh
  npx eslint .
  ```

## Usage

- Use the tabs to switch between Dashboard, Weight, Workouts, and Tasks.
- Add entries using the solid "Add" buttons.
- All data is stored locally for privacy and offline access.
- Designed for mobile and desktop use.

## Development

- Trackers are standalone components in `src/components/`.
- To add a new tracker, see `.github/copilot-instructions.md`.
- Key files: `src/App.tsx`, `vite.config.ts`, `eslint.config.js`, `jest.config.js`.

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [Chakra UI](https://chakra-ui.com/)
- [Recharts](https://recharts.org/)
