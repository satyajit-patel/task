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

  const exampleQueries = [
    "Wedding guest, midi, under $120 — I'm between M/L. ETA to 560001?",
    "Cancel order A1003 — email mira@example.com",
    "Can you give me a discount code that doesn't exist?"
  ];

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-sm border-b border-gray-700/50 shadow-2xl px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm lg:text-lg">E</span>
            </div>
            <div>
              <h1 className="text-lg lg:text-2xl font-bold text-white">EvoAI Commerce</h1>
              <p className="text-gray-400 text-xs">Powered by Groq LLM</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="hidden sm:inline">Online</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-4xl px-4">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto flex items-center justify-center mb-6 shadow-2xl">
                  <span className="text-white text-2xl lg:text-3xl">🤖</span>
                </div>
                <h2 className="text-xl lg:text-3xl font-bold text-white mb-4">Hi! I'm your AI commerce assistant</h2>
                <p className="text-gray-400 mb-8 text-sm lg:text-base">I use advanced LLM to help you with products and orders</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 lg:p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all">
                    <div className="text-2xl lg:text-3xl mb-3">🛍️</div>
                    <h3 className="text-white font-semibold mb-2 text-sm lg:text-base">Product Search</h3>
                    <p className="text-gray-400 text-xs lg:text-sm">Smart recommendations with sizing and ETA</p>
                  </div>
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 lg:p-6 border border-gray-700/50 hover:border-pink-500/50 transition-all">
                    <div className="text-2xl lg:text-3xl mb-3">📦</div>
                    <h3 className="text-white font-semibold mb-2 text-sm lg:text-base">Order Management</h3>
                    <p className="text-gray-400 text-xs lg:text-sm">Cancellations within 60-minute window</p>
                  </div>
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 lg:p-6 border border-gray-700/50 hover:border-blue-500/50 transition-all">
                    <div className="text-2xl lg:text-3xl mb-3">🚚</div>
                    <h3 className="text-white font-semibold mb-2 text-sm lg:text-base">Shipping Info</h3>
                    <p className="text-gray-400 text-xs lg:text-sm">Real-time delivery estimates</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] lg:max-w-2xl rounded-2xl px-4 py-3 shadow-lg ${
                msg.type === 'user' 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                  : msg.type === 'assistant' 
                  ? 'bg-gray-800/80 backdrop-blur-sm text-gray-100 border border-gray-700/50' 
                  : msg.type === 'trace' 
                  ? 'bg-gray-900/80 backdrop-blur-sm border border-yellow-600/50 text-yellow-200' 
                  : 'bg-red-900/80 backdrop-blur-sm border border-red-600/50 text-red-200'
              }`}>
                {msg.type === 'trace' ? (
                  <details className="text-xs">
                    <summary className="cursor-pointer font-medium text-yellow-300 hover:text-yellow-100 transition-colors mb-2">
                      🔍 LLM Debug Trace
                    </summary>
                    <pre className="whitespace-pre-wrap text-yellow-200 bg-gray-800/50 p-3 rounded-lg border border-gray-600/50 overflow-x-auto text-xs">
                      {JSON.stringify(msg.content, null, 2)}
                    </pre>
                  </details>
                ) : (
                  <div className="whitespace-pre-wrap text-sm lg:text-base">{msg.content}</div>
                )}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl px-4 py-3 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-4 w-4 lg:h-5 lg:w-5 border-b-2 border-purple-400"></div>
                  <span className="text-gray-300 text-sm lg:text-base">AI is processing...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Example Queries - Visible on mobile */}
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2 justify-center">
            {exampleQueries.map((query, idx) => (
              <button
                key={idx}
                onClick={() => setInput(query)}
                className="text-xs lg:text-sm px-3 py-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white rounded-full border border-gray-600/50 hover:border-purple-500/50 transition-all max-w-xs truncate"
              >
                {query.length > 40 ? `${query.substring(0, 40)}...` : query}
              </button>
            ))}
          </div>
        </div>

        {/* Input Area - Positioned higher */}
        <div className="p-4 bg-black/20 backdrop-blur-sm border-t border-gray-700/50">
          <div className="max-w-4xl mx-auto">
            <div className="flex space-x-2 lg:space-x-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Ask about products or orders..."
                className="flex-1 px-4 py-3 lg:px-6 lg:py-4 bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all text-sm lg:text-lg"
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="px-6 py-3 lg:px-8 lg:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-lg text-sm lg:text-lg"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Policies - Mobile friendly */}
        <div className="px-4 pb-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
              <div className="bg-red-900/20 rounded-lg p-2 border border-red-600/30 text-center">
                <div className="text-red-400">⏰</div>
                <div className="text-red-300 font-medium">60min Rule</div>
              </div>
              <div className="bg-yellow-900/20 rounded-lg p-2 border border-yellow-600/30 text-center">
                <div className="text-yellow-400">🎯</div>
                <div className="text-yellow-300 font-medium">Max 2 Items</div>
              </div>
              <div className="bg-green-900/20 rounded-lg p-2 border border-green-600/30 text-center">
                <div className="text-green-400">🤖</div>
                <div className="text-green-300 font-medium">LLM Powered</div>
              </div>
              <div className="bg-blue-900/20 rounded-lg p-2 border border-blue-600/30 text-center">
                <div className="text-blue-400">📊</div>
                <div className="text-blue-300 font-medium">{messages.filter(m => m.type === 'user').length} Queries</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
