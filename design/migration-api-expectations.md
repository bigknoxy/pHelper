# Migration API expectations

The migration UI calls the following endpoints:

- POST /api/tasks { title, description }
- POST /api/weights { weight, date, note }
- POST /api/workouts { type, duration, date, notes }

Each endpoint requires Authorization: Bearer <token> header.

A bulk migration endpoint would simplify client-side logic by accepting a JSON payload containing arrays of tasks, weights, and workouts. Consider adding POST /api/migrate to the server that accepts { tasks: [], weights: [], workouts: [] } and performs server-side deduplication and validation.

TODO: add server bulk endpoint if migration performance/atomicity is important.
