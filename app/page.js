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
    <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-sm border-b border-gray-700/50 shadow-2xl">
        <div className="px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-white">EvoAI Commerce Assistant</h1>
                <p className="text-gray-400 text-xs lg:text-sm">Powered by Groq LLM • Intelligent Commerce AI</p>
              </div>
            </div>
            <div className="hidden lg:flex items-center space-x-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-4">
            {messages.length === 0 && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-2xl">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto flex items-center justify-center mb-6 shadow-2xl">
                    <span className="text-white text-3xl">🤖</span>
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">Hi! I'm your AI commerce assistant</h2>
                  <p className="text-gray-400 mb-8">I use advanced LLM to help you with products and orders</p>
                  
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
              <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-2xl rounded-2xl px-4 py-3 shadow-lg ${
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
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  )}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl px-4 py-3 shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-400"></div>
                    <span className="text-gray-300">AI is processing...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 lg:p-8 bg-black/20 backdrop-blur-sm border-t border-gray-700/50">
            <div className="max-w-4xl mx-auto">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Ask about products or orders..."
                  className="flex-1 px-6 py-4 bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all text-lg"
                  disabled={loading}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-lg text-lg"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Hidden on mobile, visible on desktop */}
        <div className="hidden xl:block w-80 bg-black/30 backdrop-blur-sm border-l border-gray-700/50 p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Quick Actions */}
            <div>
              <h3 className="font-semibold text-gray-200 mb-4 flex items-center">
                <span className="mr-2">⚡</span>
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button 
                  onClick={() => setInput("Wedding guest, midi, under $120 — I'm between M/L. ETA to 560001?")}
                  className="w-full text-left p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl text-sm text-gray-300 hover:text-white transition-all border border-gray-600/50 hover:border-purple-500/50"
                >
                  🛍️ Product Search Example
                </button>
                <button 
                  onClick={() => setInput("Cancel order A1003 — email mira@example.com")}
                  className="w-full text-left p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl text-sm text-gray-300 hover:text-white transition-all border border-gray-600/50 hover:border-pink-500/50"
                >
                  📦 Order Cancellation
                </button>
              </div>
            </div>
            
            {/* Policies */}
            <div>
              <h3 className="font-semibold text-gray-200 mb-4 flex items-center">
                <span className="mr-2">📋</span>
                AI Policies
              </h3>
              <div className="space-y-3">
                <div className="flex items-start p-3 bg-red-900/20 rounded-xl border border-red-600/30">
                  <span className="text-red-400 mr-3 mt-0.5">⏰</span>
                  <div>
                    <div className="text-red-300 font-medium text-sm">60-Minute Rule</div>
                    <div className="text-red-400 text-xs">Cancellations only within 60 minutes</div>
                  </div>
                </div>
                <div className="flex items-start p-3 bg-yellow-900/20 rounded-xl border border-yellow-600/30">
                  <span className="text-yellow-400 mr-3 mt-0.5">🎯</span>
                  <div>
                    <div className="text-yellow-300 font-medium text-sm">Smart Recommendations</div>
                    <div className="text-yellow-400 text-xs">Max 2 products, price-aware</div>
                  </div>
                </div>
                <div className="flex items-start p-3 bg-green-900/20 rounded-xl border border-green-600/30">
                  <span className="text-green-400 mr-3 mt-0.5">🤖</span>
                  <div>
                    <div className="text-green-300 font-medium text-sm">LLM Powered</div>
                    <div className="text-green-400 text-xs">Groq Llama-3.3-70B model</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div>
              <h3 className="font-semibold text-gray-200 mb-4 flex items-center">
                <span className="mr-2">📊</span>
                Session Stats
              </h3>
              <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                <div className="text-2xl font-bold text-white">{messages.filter(m => m.type === 'user').length}</div>
                <div className="text-gray-400 text-sm">Messages sent</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
