

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

## Auth & Migration UI

- Run unit tests for auth and migration flows: `npm test`
- A simple login and register UI is available at `/login` and `/register` when running the client
- The Data Migration UI lets users export a local backup (JSON) and import local items to the backend with simple conflict detection

## Usage

- Use the tabs to switch between Dashboard, Weight, Workouts, and Tasks.
- Add entries using the solid "Add" buttons.
- All data is stored locally for privacy and offline access.
- Designed for mobile and desktop use.

## Development

- Trackers are standalone components in `src/components/`.
- To add a new tracker, see `.github/copilot-instructions.md`.
- Key files: `src/App.tsx`, `vite.config.ts`, `eslint.config.js`, `jest.config.js`.

## Backend & Database Setup

### Start/Stop PostgreSQL (Docker)
```sh
cd server
docker compose up -d
```
To stop:
```sh
docker compose down
```
Data is persisted in the Docker volume `pgdata`.

### Prisma Migrations
Set environment variables in `server/.env`:
```
DATABASE_URL="postgresql://phelper:phelperpass@localhost:55432/phelperdb"
JWT_SECRET="your_jwt_secret"
```
Run migrations:
```sh
cd server
export DATABASE_URL="postgresql://phelper:phelperpass@localhost:55432/phelperdb"
npx prisma migrate dev --schema=prisma/schema.prisma
```

### Seeding the Database
To seed test data:
```sh
npx prisma db seed
```
(See `server/prisma/seed.ts` for details.)

### API Endpoints
- Auth: `/api/auth/register`, `/api/auth/login`
- Trackers: `/api/weights`, `/api/workouts`, `/api/tasks`

### Backup/Restore
Backup DB volume:
```sh
docker run --rm -v pHelper_pgdata:/var/lib/postgresql/data -v $(pwd):/backup busybox tar czvf /backup/pgdata-backup.tar.gz /var/lib/postgresql/data
```
Restore:
```sh
docker run --rm -v pHelper_pgdata:/var/lib/postgresql/data -v $(pwd):/backup busybox tar xzvf /backup/pgdata-backup.tar.gz -C /
```

### API Documentation
See `server/src/utils/swagger.ts` for Swagger/OpenAPI spec.

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [Chakra UI](https://chakra-ui.com/)
- [Recharts](https://recharts.org/)
