# pHelper MVP: Migration to Persistent PostgreSQL Storage

## Overview
This document outlines the architecture and migration plan for moving pHelper’s trackers (weight, workouts, tasks) from local-only storage to a persistent PostgreSQL backend. The solution leverages modern web app best practices, focusing on scalability, maintainability, and security.

---

## 1. Data Model

### Tables & Relationships

#### Users
- `id` (PK, UUID)
- `email` (unique, indexed)
- `password_hash`
- `created_at`
- `updated_at`

#### WeightEntries
- `id` (PK, UUID)
- `user_id` (FK → Users.id, indexed)
- `date` (DATE)
- `weight` (FLOAT)
- `note` (TEXT, optional)
- `created_at`
- `updated_at`

#### Workouts
- `id` (PK, UUID)
- `user_id` (FK → Users.id, indexed)
- `date` (DATE)
- `type` (VARCHAR)
- `duration` (INTEGER, minutes)
- `notes` (TEXT, optional)
- `created_at`
- `updated_at`

#### Tasks
- `id` (PK, UUID)
- `user_id` (FK → Users.id, indexed)
- `title` (VARCHAR)
- `description` (TEXT, optional)
- `status` (ENUM: 'pending', 'completed', 'archived')
- `due_date` (DATE, optional)
- `created_at`
- `updated_at`

**Relationships:**  Each tracker entry is owned by a user (`user_id` FK). No cross-tracker relationships required.

---

## 2. API Layer

### Approach
- **RESTful API** (recommended for MVP simplicity and wide tooling support)
- **Endpoints:**
  - `/api/auth/register` (POST)
  - `/api/auth/login` (POST)
  - `/api/weights` (CRUD)
  - `/api/workouts` (CRUD)
  - `/api/tasks` (CRUD)
- **Auth:** JWT-based, HTTP-only cookies for session management.
- **Error Handling:** Consistent JSON error responses, status codes, validation errors.
- **Rate Limiting:** Per-IP and per-user, e.g., 100 requests/minute.

---

## 3. Backend Tech Stack

- **Node.js** (LTS)
- **Express.js** (API routing)
- **ORM:** Prisma (TypeScript-native, PostgreSQL support, migrations, validation)
- **PostgreSQL** (managed or local)
- **Auth:** bcrypt for password hashing, jsonwebtoken for JWT
- **Validation:** Zod or Joi for request validation
- **Rate Limiting:** express-rate-limit
- **Testing:** Jest + Supertest

---

## 4. Security

- **Authentication:** JWT, password hashing (bcrypt), secure cookie storage
- **Authorization:** All tracker endpoints require valid JWT
- **Validation:** All inputs validated server-side (Zod/Joi schemas)
- **Rate Limiting:** Prevent brute-force and abuse
- **CORS:** Restrict to frontend origin
- **HTTPS:** Enforced in production
- **Sensitive Data:** Never expose password hashes or internal errors

---

## 5. Migration Strategy

### Steps
1. **Backend Launch:** Deploy API and database, test with seed data.
2. **Frontend Integration:** Add API client (e.g., Axios/Fetch), update tracker components to use backend.
3. **Data Migration:**  On first login, prompt user to import localStorage data. POST local data to backend for each tracker. Mark migration complete in localStorage.
4. **Fallback:** If offline, fallback to localStorage (optional for hybrid mode).
5. **Testing:** Validate data integrity post-migration.

---

## 6. Dev/Test Environment Setup

- **Local PostgreSQL:** Docker Compose or local install
- **Environment Variables:** `.env` for DB credentials, JWT secret, etc.
- **Prisma Migrations:** Versioned schema changes
- **Seed Scripts:** For test users/data
- **Frontend:** Vite dev server, proxy `/api` to backend
- **Testing:** Jest for backend, React Testing Library for frontend

---

## 7. Frontend Interaction

- **API Client:** Axios/Fetch wrapper with JWT token management
- **State Management:** React context or Redux for user/session state
- **Error Handling:** Show user-friendly messages for API errors
- **Optimistic UI:** Update UI before server confirmation, rollback on error
- **Data Fetching:** On login, fetch all tracker data for user

---

## 8. Code Structure & Architectural Diagram

### Backend
```
src/
  controllers/
    authController.ts
    weightController.ts
    workoutController.ts
    taskController.ts
  models/ (Prisma schema)
  routes/
    auth.ts
    weights.ts
    workouts.ts
    tasks.ts
  middleware/
    auth.ts
    validation.ts
    rateLimit.ts
  utils/
    errorHandler.ts
    jwt.ts
  app.ts
  server.ts
```

### Frontend
```
src/
  api/
    client.ts      // Axios/Fetch wrapper
    weights.ts
    workouts.ts
    tasks.ts
    auth.ts
  components/
    WeightTracker.tsx
    WorkoutLogger.tsx
    TaskTracker.tsx
    Dashboard.tsx
  context/
    AuthContext.tsx
  utils/
    localStorage.ts
    migration.ts
```

### Architectural Diagram

```
[React Frontend] <---> [Express API] <---> [PostgreSQL]
      |                     |                   |
  AuthContext         JWT Auth, Validation   Prisma ORM
  API Client          Rate Limiting          Migrations
  Migration Logic     Error Handling         Data Model
```

---

## 9. Best Practices

- **Modular Code:** Separate concerns (controllers, routes, models, middleware)
- **Type Safety:** End-to-end TypeScript
- **Validation:** Always validate user input
- **Testing:** Unit and integration tests for all layers
- **Documentation:** API docs (OpenAPI/Swagger), code comments
- **Observability:** Logging, error tracking (e.g., Sentry)
- **Scalability:** Stateless backend, horizontal scaling, connection pooling
- **Maintainability:** Use conventions from AGENTS.md and Copilot instructions (e.g., clear naming, single-responsibility, agentic error handling)

---

## References

- [AGENTS.md](../AGENTS.md) for agentic conventions
- [Prisma Docs](https://www.prisma.io/docs/)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [React 19 Docs](https://react.dev/)
- [JWT Auth Patterns](https://jwt.io/introduction/)

---

**This design enables a robust, secure, and scalable migration from localStorage to PostgreSQL, positioning pHelper for future growth and multi-device support.**
