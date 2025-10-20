# Auth UI Spec

This document describes the UI expectations for authentication and migration flows.

- Login and Register forms are simple, accessible, and keyboard-friendly.
- Login form includes "remember me" checkbox. When checked, token is persisted to localStorage via token helper.
- After successful login/register the app prompts to migrate local data to backend.
- Data migration UI allows exporting a JSON backup and migrating tasks/weights/workouts individually. Conflicts are detected by duplicate title or date and displayed to the user.
- Backend API expectations:
  - POST /auth/register -> { token }
  - POST /auth/login -> { token }
  - POST /tasks -> created task
  - POST /weights -> created weight
  - POST /workouts -> created workout

