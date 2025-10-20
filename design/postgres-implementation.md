# PostgreSQL Implementation Tasks for pHelper

This task list is derived from the architecture and migration plan in `persistence-postgres.md` and aligns with project conventions in `.github/copilot-instructions.md`. Each task is self-contained and suitable for LLM or senior developer pickup.

---

## 1. Database & ORM Setup

### 1.1. Docker Compose PostgreSQL
**Status:** Complete & Tested

### 1.2. Prisma Initialization
**Status:** Complete & Tested

### 1.3. Seed Script
**Status:** Complete & Tested

---

## 2. Backend API Implementation

### 2.1. Express App Structure
- Scaffold Express app in `server/src/` with folders: controllers, routes, middleware, utils.
- Set up TypeScript config for backend.
- **Status:** Not Started

### 2.2. Auth Endpoints
- Implement `/api/auth/register` and `/api/auth/login`:
  - Use bcrypt for password hashing.
  - Issue JWT on successful login.
  - Store JWT in HTTP-only cookie.
  - Validate email uniqueness.
  - **Status:** Not Started

### 2.3. Tracker CRUD Endpoints
- Implement RESTful endpoints for:
  - `/api/weights`
  - `/api/workouts`
  - `/api/tasks`
- Each endpoint must support create, read, update, delete for authenticated users.
- Enforce user ownership on all data operations.
- **Status:** Not Started

### 2.4. Middleware
- JWT authentication middleware.
- Input validation middleware (Zod or Joi).
- Rate limiting middleware (express-rate-limit).
- Centralized error handler.
- **Status:** Not Started

### 2.5. CORS & Security Headers
- Restrict CORS to frontend origin.
- Add security headers (CSP, HSTS, X-Frame-Options).
- **Status:** Not Started

---

## 3. Frontend Integration

### 3.1. API Client
- Create `src/api/client.ts` for Axios/Fetch wrapper.
- Implement JWT token management and error handling.
- **Status:** Not Started

### 3.2. Tracker API Modules
- Create `src/api/weights.ts`, `workouts.ts`, `tasks.ts`, `auth.ts` for API calls.
- Update `WeightTracker.tsx`, `WorkoutLogger.tsx`, `TaskTracker.tsx` to use backend API instead of localStorage.
- **Status:** Not Started

### 3.3. Migration Logic
- On first login, detect localStorage data.
- Prompt user to import local data to backend.
- POST each tracker’s data to backend.
- Mark migration complete in localStorage.
- **Status:** Not Started

### 3.4. Auth Context
- Implement `AuthContext.tsx` for session state and JWT management.
- Ensure all tracker components require authentication.
- **Status:** Not Started

---

## 4. Testing

### 4.1. Backend Tests
- Write Jest + Supertest tests for all API endpoints.
- Test authentication, authorization, validation, and CRUD operations.
- **Status:** Not Started

### 4.2. Frontend Tests
- Update/add React Testing Library tests for tracker components using API.
- Test migration logic and error handling.
- **Status:** Not Started

---

## 5. DevOps & Documentation

### 5.1. Environment Variables
- Use `.env` for DB credentials, JWT secret, etc.
- Document required variables in README.
- **Status:** Not Started

### 5.2. Proxy Setup
- Configure Vite dev server to proxy `/api` requests to backend.
- **Status:** Not Started

### 5.3. Deployment
- Document steps for deploying backend and DB on a free-tier VM.
- Ensure DB port is not exposed publicly.
- Use Docker secrets or environment variables for credentials.
- **Status:** Not Started

### 5.4. Backup & Restore
- Document manual backup/restore for Docker volume.
- Add instructions for restoring from backup.
- **Status:** Not Started

### 5.5. API Documentation
- Document all endpoints, request/response formats, and error codes.
- Optionally, generate Swagger/OpenAPI spec.
- **Status:** Not Started

---

## 6. Security & Observability

### 6.1. Password Security
- Use bcrypt for password hashing.
- Never log sensitive data.
- **Status:** Not Started

### 6.2. SQL Injection Prevention
- Use Prisma parameterized queries.
- **Status:** Not Started

### 6.3. Logging & Monitoring
- Add basic logging for errors and important events.
- Document how to access logs.
- **Status:** Not Started

---

## 7. Code Quality

### 7.1. Linting & Formatting
- Ensure ESLint and Prettier are configured for backend and frontend.
- Add lint scripts to package.json.
- **Status:** Not Started

### 7.2. Type Safety
- Use TypeScript end-to-end.
- Validate types for API requests/responses.
- **Status:** Not Started

---

## 8. Review & Validation

### 8.1. Data Integrity
- Test migration from localStorage to backend.
- Validate that all tracker data is correctly persisted and retrieved.
- **Status:** Not Started

### 8.2. User Experience
- Ensure error messages are clear and actionable.
- Test on mobile and desktop browsers.
- **Status:** Not Started

---


**Each task above is actionable and can be picked up independently. All code should follow project conventions and be documented for maintainability.**
**Update the status of each task only after successful automated testing.**