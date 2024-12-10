import React, { useState } from 'react';

interface ApiKeyInputProps {
  onSubmit: (apiKey: string) => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onSubmit }) => {
  const [inputKey, setInputKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputKey.trim()) {
      onSubmit(inputKey.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="api-key" className="block text-sm font-medium text-gray-700">
          Enter your Claude API Key
        </label>
        <p className="text-sm text-gray-500 mb-2">
          Your API key will be stored securely in your browser's local storage.
        </p>
        <input
          type="password"
          id="api-key"
          value={inputKey}
          onChange={(e) => setInputKey(e.target.value)}
          placeholder="sk-ant-api03-..."
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Save API Key
      </button>
    </form>
  );
};

export default ApiKeyInput;