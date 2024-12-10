import { useState, useCallback } from 'react'
import Chat from './components/Chat'
import ApiKeyInput from './components/ApiKeyInput'
import { useApiKey } from './hooks/useApiKey'

interface ChatMessage {
  role: 'user' | 'assistant' | 'error';
  content: string;
}

// Replace this with your Vercel deployment URL in production
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://pwa005.vercel.app/api/chat'  // We'll update this once deployed
  : '/api/chat';

function App() {
  const { apiKey, setApiKey } = useApiKey()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = useCallback(async (message: string) => {
    if (!apiKey) return

    setIsLoading(true)
    setMessages(prev => [...prev, { role: 'user', content: message }])

    try {
      const apiMessages = messages
        .filter(msg => msg.role === 'user' || msg.role === 'assistant')
        .map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }));

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          model: "claude-3-sonnet-20241022",
          max_tokens: 1024,
          messages: [...apiMessages, { role: 'user', content: message }],
          temperature: 0.7,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      if (data?.content?.[0]?.text) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.content[0].text }]);
      } else {
        throw new Error('Unexpected API response format');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      let errorMessage = 'Error sending message. Please try again.';
      if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`;
      }
      setMessages(prev => [...prev, { 
        role: 'error', 
        content: errorMessage
      }]);
    } finally {
      setIsLoading(false)
    }
  }, [apiKey, messages])

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h1 className="text-2xl font-bold mb-8 text-center text-gray-900">Claude Chat Interface</h1>
                {!apiKey ? (
                  <ApiKeyInput onSubmit={setApiKey} />
                ) : (
                  <Chat messages={messages} onSendMessage={handleSendMessage} isLoading={isLoading} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App