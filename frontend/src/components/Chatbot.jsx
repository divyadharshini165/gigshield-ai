import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../utils/api';

export default function Chatbot({ userData }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hi! I\'m your ParametriX assistant. Ask me about your premium, payouts, risk score, or anything else!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages(m => [...m, { type: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const result = await sendChatMessage(userMsg, userData);
      setMessages(m => [...m, { type: 'bot', text: result.response }]);
    } catch (err) {
      setMessages(m => [...m, { type: 'bot', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickButton = async (query) => {
    setMessages(m => [...m, { type: 'user', text: query }]);
    setLoading(true);
    try {
      const result = await sendChatMessage(query, userData);
      setMessages(m => [...m, { type: 'bot', text: result.response }]);
    } catch (err) {
      setMessages(m => [...m, { type: 'bot', text: 'Sorry, I encountered an error.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg transition-all duration-300 hover:scale-110"
        style={{
          background: 'linear-gradient(135deg, #00d4ff, #0284c7)',
          boxShadow: '0 8px 24px rgba(0,212,255,0.4)'
        }}>
        {open ? '✕' : '💬'}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-40 w-96 max-h-[600px] rounded-2xl shadow-2xl flex flex-col overflow-hidden slide-up"
          style={{
            background: 'linear-gradient(135deg, rgba(15,25,35,0.95), rgba(28,47,62,0.95))',
            border: '1px solid rgba(0,212,255,0.2)',
            backdropFilter: 'blur(10px)'
          }}>
          
          {/* Header */}
          <div className="p-4 border-b border-[#243447]">
            <h3 className="font-display font-bold text-white text-lg">ParametriX Assistant</h3>
            <p className="text-xs text-[#7a9ab5] mt-0.5">Always here to help</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                    msg.type === 'user'
                      ? 'bg-[#0284c7] text-white rounded-br-none'
                      : 'bg-[#1c2f3e] text-[#7a9ab5] rounded-bl-none border border-[#243447]'
                  }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#1c2f3e] border border-[#243447] px-4 py-2 rounded-lg">
                  <span className="inline-block w-2 h-2 bg-[#00d4ff] rounded-full animate-pulse mr-2" />
                  <span className="text-xs text-[#7a9ab5]">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Buttons */}
          {messages.length === 1 && (
            <div className="px-4 py-3 border-t border-[#243447] space-y-2">
              <button
                onClick={() => handleQuickButton('Why is my premium high?')}
                className="w-full text-xs py-2 px-3 rounded-lg bg-[#1c2f3e] border border-[#243447] text-[#7a9ab5] hover:border-[#00d4ff] hover:text-[#00d4ff] transition-all">
                Explain premium
              </button>
              <button
                onClick={() => handleQuickButton('What is my risk score?')}
                className="w-full text-xs py-2 px-3 rounded-lg bg-[#1c2f3e] border border-[#243447] text-[#7a9ab5] hover:border-[#00d4ff] hover:text-[#00d4ff] transition-all">
                Show risk score
              </button>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-[#243447] flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything..."
              className="flex-1 bg-[#1c2f3e] border border-[#243447] rounded-lg px-3 py-2 text-sm text-white placeholder-[#7a9ab5] focus:outline-none focus:border-[#00d4ff]"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="px-4 py-2 rounded-lg bg-[#00d4ff] text-[#0c1e2c] font-semibold text-sm disabled:opacity-50 transition-all hover:shadow-lg">
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
