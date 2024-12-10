import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // Handle preflight request
  if (request.method === 'OPTIONS') {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
    return response.status(200).end();
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = request.headers['x-api-key'];
  if (!apiKey) {
    return response.status(400).json({ error: 'API key is required' });
  }

  try {
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey as string,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(request.body),
    });

    const data = await anthropicResponse.json();

    response.setHeader('Access-Control-Allow-Origin', '*');
    return response.status(anthropicResponse.status).json(data);
  } catch (error) {
    console.error('Error:', error);
    return response.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}