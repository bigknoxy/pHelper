// Swagger/OpenAPI stub for pHelper API
// Extend this file with full endpoint documentation as the API evolves

export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'pHelper API',
    version: '1.0.0',
    description: 'API for persistent tracker storage (weights, workouts, tasks)'
  },
  paths: {
    '/api/health': {
      get: {
        summary: 'Health check',
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: { type: 'object', properties: { status: { type: 'string' } } }
              }
            }
          }
        }
      }
    },
    // Add more endpoints here as needed
  }
}
