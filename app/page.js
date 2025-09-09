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
    <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black flex flex-col">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">EvoAI Commerce</h1>
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
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto flex items-center justify-center mb-6 shadow-2xl">
                  <span className="text-white text-3xl">🤖</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Hi! I'm your AI commerce assistant</h2>
                <p className="text-gray-400 mb-8 text-base">I use advanced LLM to help you with products and orders</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all">
                    <div className="text-3xl mb-3">🛍️</div>
                    <h3 className="text-white font-semibold mb-2">Product Search</h3>
                    <p className="text-gray-400 text-sm">Smart recommendations with sizing and ETA</p>
                  </div>
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-pink-500/50 transition-all">
                    <div className="text-3xl mb-3">📦</div>
                    <h3 className="text-white font-semibold mb-2">Order Management</h3>
                    <p className="text-gray-400 text-sm">Cancellations within 60-minute window</p>
                  </div>
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-blue-500/50 transition-all">
                    <div className="text-3xl mb-3">🚚</div>
                    <h3 className="text-white font-semibold mb-2">Shipping Info</h3>
                    <p className="text-gray-400 text-sm">Real-time delivery estimates</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex transition-all duration-300 ease-in-out ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] lg:max-w-2xl rounded-3xl px-5 py-3 shadow-lg ${
                msg.type === 'user'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : msg.type === 'assistant'
                  ? 'bg-gray-800/70 backdrop-blur-md text-gray-100 border border-gray-700/40'
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
              <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-3xl px-4 py-3 shadow-lg">
                <div className="flex space-x-2">
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-150"></span>
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-300"></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Example Queries */}
        <div className="px-6 pb-4">
          <div className="max-w-3xl mx-auto flex flex-wrap gap-3 justify-center">
            {exampleQueries.map((query, idx) => (
              <button
                key={idx}
                onClick={() => setInput(query)}
                className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-full text-sm transition-all border border-gray-600/30 hover:border-purple-500/50"
              >
                {query.length > 35 ? `${query.substring(0, 35)}...` : query}
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-6 lg:p-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl shadow-2xl focus-within:border-purple-500/60 transition-all">
              <div className="flex gap-4 items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Ask about products or orders..."
                  className="flex-1 px-6 py-4 bg-transparent text-white placeholder-gray-400 focus:outline-none text-lg"
                  disabled={loading}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="w-12 h-12 flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg hover:scale-105 transition-transform disabled:opacity-50"
                >
                  🚀
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Policies */}
        <div className="px-4 pb-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap gap-3 justify-center text-sm">
              <span className="px-4 py-2 rounded-full bg-red-500/10 text-red-400 border border-red-500/30">⏰ 60min Rule</span>
              <span className="px-4 py-2 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">🎯 Max 2 Items</span>
              <span className="px-4 py-2 rounded-full bg-green-500/10 text-green-400 border border-green-500/30">🤖 LLM Powered</span>
              <span className="px-4 py-2 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">📊 {messages.filter(m => m.type === 'user').length} Queries</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
