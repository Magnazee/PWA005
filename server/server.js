import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';

const app = express();

app.use(cors());
app.use(express.json());

function validateMessages(messages) {
  if (!Array.isArray(messages)) {
    throw new Error('Messages must be an array');
  }
  
  return messages.every(msg => 
    msg && 
    typeof msg === 'object' &&
    ['user', 'assistant'].includes(msg.role) &&
    typeof msg.content === 'string'
  );
}

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, apiKey } = req.body;

    // Input validation
    if (!apiKey) {
      return res.status(400).json({ 
        content: [{ text: 'API key is required', type: 'error' }] 
      });
    }

    if (!messages || !validateMessages(messages)) {
      return res.status(400).json({ 
        content: [{ text: 'Invalid message format', type: 'error' }] 
      });
    }

    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    try {
      const response = await anthropic.messages.create({
        model: "claude-3-sonnet-20240229",
        max_tokens: 1024,
        messages: messages,
        temperature: 0.7,
      });

      res.json(response);
    } catch (apiError) {
      console.error('Claude API error:', apiError);
      res.status(500).json({ 
        content: [{ 
          text: apiError.message || 'Error communicating with Claude API',
          type: 'error'
        }] 
      });
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      content: [{ 
        text: 'An unexpected server error occurred',
        type: 'error'
      }] 
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});