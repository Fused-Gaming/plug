/**
 * Vite middleware for API routes
 * Routes API requests to handler scripts for local development
 */

export async function apiMiddleware(req, res, next) {
  // Only handle POST requests to /api/*
  if (req.method !== 'POST' || !req.url.startsWith('/api/')) {
    return next();
  }

  // Lazy-load handlers to avoid loading during build
  const { submitVenue } = await import('./scripts/api/submit-venue.mjs');
  const { confirmSubmission } = await import('./scripts/api/confirm-submission.mjs');

  // Set JSON content type
  res.setHeader('Content-Type', 'application/json');

  // Handle submission
  if (req.url === '/api/submit-venue') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const formData = JSON.parse(body);
        const result = await submitVenue(formData);
        res.statusCode = 200;
        res.end(JSON.stringify(result));
      } catch (error) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: error.message }));
      }
    });

    return;
  }

  // Handle confirmation
  if (req.url === '/api/confirm-submission') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const { token } = JSON.parse(body);
        const result = await confirmSubmission(token);
        res.statusCode = 200;
        res.end(JSON.stringify(result));
      } catch (error) {
        res.statusCode = 400;
        res.end(
          JSON.stringify({
            code: error.code || 'ERROR',
            message: error.message,
          })
        );
      }
    });

    return;
  }

  next();
}
