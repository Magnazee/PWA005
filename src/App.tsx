import { useState, useCallback } from 'react'
import Chat from './components/Chat'
import ApiKeyInput from './components/ApiKeyInput'
import { useApiKey } from './hooks/useApiKey'

interface ChatMessage {
  role: 'user' | 'assistant' | 'error';
  content: string;
}

interface APIResponse {
  content: Array<{
    text: string;
    type: string;
  }>;
}

function App() {
  const { apiKey, setApiKey } = useApiKey()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = useCallback(async (message: string) => {
    if (!apiKey) {
      setMessages(prev => [...prev, { 
        role: 'error', 
        content: 'Please provide an API key before sending messages.' 
      }])
      return
    }

    setIsLoading(true)
    setMessages(prev => [...prev, { role: 'user', content: message }])

    try {
      const apiMessages = messages
        .filter(msg => msg.role === 'user' || msg.role === 'assistant')
        .map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }));

      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...apiMessages, { role: 'user', content: message }],
          apiKey: apiKey
        }),
      });

      const data: APIResponse = await response.json();
      
      if (!response.ok) {
        console.error('API error:', data);
        throw new Error(data.content?.[0]?.text || 'Failed to get response from Claude');
      }

      if (data?.content?.[0]?.text) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.content[0].text }]);
      } else {
        console.error('Unexpected API response format:', data);
        throw new Error('Received invalid response format from server. Check console for details.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        role: 'error', 
        content: error instanceof Error 
          ? `Error: ${error.message}` 
          : 'An unexpected error occurred. Please try again.'
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