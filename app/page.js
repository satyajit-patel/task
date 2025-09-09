'use client';

import { useState } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { type: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });

      const data = await response.json();
      
      setMessages(prev => [...prev, 
        { type: 'assistant', content: data.message },
        { type: 'trace', content: data.trace }
      ]);
    } catch (error) {
      setMessages(prev => [...prev, 
        { type: 'error', content: 'Sorry, something went wrong.' }
      ]);
    }

    setInput('');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">EvoAI Commerce Assistant</h1>
          <p className="text-gray-600">Get help with products and orders</p>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border h-96 mb-4 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-gray-500 text-center py-8">
              <p>👋 Hi! I can help you with:</p>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Product recommendations and sizing</li>
                <li>• Order cancellations (within 60 minutes)</li>
                <li>• Shipping estimates</li>
              </ul>
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <div key={idx} className={`${
              msg.type === 'user' ? 'ml-auto bg-blue-500 text-white' :
              msg.type === 'assistant' ? 'mr-auto bg-gray-100' :
              msg.type === 'trace' ? 'mr-auto bg-yellow-50 border border-yellow-200' :
              'mr-auto bg-red-50 border border-red-200'
            } max-w-xs rounded-lg px-3 py-2`}>
              {msg.type === 'trace' ? (
                <details className="text-xs">
                  <summary className="cursor-pointer font-medium text-yellow-700">
                    Debug Trace
                  </summary>
                  <pre className="mt-2 whitespace-pre-wrap text-yellow-800">
                    {JSON.stringify(msg.content, null, 2)}
                  </pre>
                </details>
              ) : (
                <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
              )}
            </div>
          ))}
          
          {loading && (
            <div className="mr-auto bg-gray-100 max-w-xs rounded-lg px-3 py-2">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                <span className="text-sm text-gray-600">Thinking...</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about products or orders..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="font-medium text-gray-900 mb-2">Try these examples:</h3>
            <ul className="space-y-1 text-gray-600">
              <li>• "Wedding guest, midi, under $120 — I'm between M/L. ETA to 560001?"</li>
              <li>• "Cancel order A1003 — email mira@example.com"</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="font-medium text-gray-900 mb-2">Policies:</h3>
            <ul className="space-y-1 text-gray-600">
              <li>• Cancellations within 60 minutes only</li>
              <li>• Max 2 product recommendations</li>
              <li>• Authentic product information only</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
