import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Vercel Serverless Function - Catch-all API Proxy
 *
 * This function handles all requests to /api/* and forwards them to the
 * actual API backend, solving CORS issues in production.
 *
 * Examples:
 * - /api/projects -> https://your-api.com/projects
 * - /api/projects/1/tasks -> https://your-api.com/projects/1/tasks
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Get the API base URL from environment variable
  const API_BASE_URL = process.env.VITE_API_BASE_URL || 'https://897d77d8e056.ngrok-free.app';

  // Get the path from the request
  // For catch-all routes, the path will be in req.query.path as a string or array
  let path = '';
  if (req.query.path) {
    // Handle both string and array cases
    if (Array.isArray(req.query.path)) {
      path = `/${req.query.path.join('/')}`;
    } else {
      path = `/${req.query.path}`;
    }
  }

  // Construct the full target URL with query parameters
  // Remove the 'path' query parameter as it's already been processed
  const url = new URL(req.url || '', 'http://localhost');
  const pathParam = url.searchParams.get('path');
  if (pathParam) {
    url.searchParams.delete('path');
  }
  const queryString = url.search;
  const targetUrl = `${API_BASE_URL}${path}${queryString}`;

  try {
    // Prepare request headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };

    // Forward authorization headers if present
    if (req.headers.authorization) {
      headers['authorization'] = req.headers.authorization as string;
    }

    // Prepare request options
    const requestOptions: RequestInit = {
      method: req.method,
      headers,
    };

    // Add body for POST, PUT, PATCH requests
    if (req.body && ['POST', 'PUT', 'PATCH'].includes(req.method || '')) {
      requestOptions.body = JSON.stringify(req.body);
    }

    // Forward the request to the actual API
    const response = await fetch(targetUrl, requestOptions);

    // Get response data (handle empty responses)
    let data = null;
    if (response.status !== 204) {
      const text = await response.text();
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
      }
    }

    // Set CORS headers to allow requests from any origin
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

    // Handle preflight OPTIONS requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Return the proxied response
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);

    return res.status(500).json({
      error: 'Proxy request failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
