import type { VercelRequest, VercelResponse } from '@vercel/node';
import Cors from 'cors';
import { promisify } from 'util';

// Initialize CORS middleware
const cors = promisify(
  Cors({
    origin: ['https://magnazee.github.io', 'http://localhost:5173', 'http://localhost:4173'],
    methods: ['POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'x-api-key', 'anthropic-version'],
    credentials: true,
    maxAge: 86400,  // Cache preflight requests for 24 hours
  })
);

// Wrap the handler in a try-catch to ensure CORS headers are always set
export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  try {
    // Run the CORS middleware
    await cors(request, response);

    // Handle actual request
    if (request.method === 'OPTIONS') {
      return response.status(200).end();
    }

    if (request.method !== 'POST') {
      return response.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = request.headers['x-api-key'];
    if (!apiKey) {
      return response.status(400).json({ error: 'API key is required' });
    }

    // Make the request to Anthropic's API
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey as string,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        ...request.body,
        model: 'claude-3-sonnet-20240229'  // Override model to ensure correct version
      })
    });

    const data = await anthropicResponse.json();

    // If there's an error, format it properly
    if (!anthropicResponse.ok) {
      console.error('Anthropic API error:', data);
      return response.status(anthropicResponse.status).json({
        type: 'error',
        error: data.error || { type: 'api_error', message: 'Unknown API error' }
      });
    }

    return response.status(200).json(data);

  } catch (error) {
    console.error('Server error:', error);
    return response.status(500).json({ 
      type: 'error',
      error: {
        type: 'server_error',
        message: error instanceof Error ? error.message : 'Internal server error'
      }
    });
  }
}