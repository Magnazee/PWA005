import React, { useState, useRef, useEffect } from 'react';

interface ChatProps {
  messages: Array<{ role: string; content: string }>;
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

const Chat: React.FC<ChatProps> = ({ messages, onSendMessage, isLoading = false }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg ${
              message.role === 'user'
                ? 'bg-blue-100 ml-8'
                : message.role === 'error'
                ? 'bg-red-100'
                : 'bg-gray-100 mr-8'
            }`}
          >
            <div className="text-sm text-gray-500 mb-1">
              {message.role === 'user' ? 'You' : message.role === 'error' ? 'Error' : 'Claude'}
            </div>
            <div className="text-gray-800 whitespace-pre-wrap">
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-center py-4">
            <div className="animate-pulse text-gray-500">Claude is thinking...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
            ${isLoading 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          disabled={isLoading}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;