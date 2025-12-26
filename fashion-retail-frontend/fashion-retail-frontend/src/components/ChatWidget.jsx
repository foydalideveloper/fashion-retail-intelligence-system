import React, { useState, useRef, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { MessageCircle, X, Send, Loader2, Bot, User, Sparkles } from 'lucide-react';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m your AI fashion assistant. Ask me about products, styles, or inventory.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    // Keep last 6 messages for context (3 user, 3 assistant)
    const contextWindow = [...messages, userMsg].slice(-6); 
    const newMessages = [...messages, userMsg]; // For display

    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      // Send context window to backend
      const response = await axiosClient.post('/api/chat/', {
        messages: contextWindow
      });
      
      setMessages(prev => [...prev, { role: 'assistant', content: response.data.reply }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Connection error. Please ensure backend is running." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 font-sans">
      {/* Chat Window */}
      {isOpen ? (
        <div className="glass-card w-96 h-[600px] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up border-2 border-fashion-gold/20">
          {/* Header */}
          <div className="bg-gradient-to-r from-fashion-gold to-fashion-rose p-5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <div className="text-white font-display font-bold text-lg">AI Stylist</div>
                <div className="text-white/70 text-xs">Fashion Intelligence</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-fashion-obsidian/50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 bg-fashion-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot size={16} className="text-fashion-gold" />
                  </div>
                )}
                <div className={`max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-fashion-gold text-fashion-obsidian font-medium' : 'bg-white/5 text-fashion-cream border border-white/10'}`}>
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 bg-fashion-rose/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-fashion-rose" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex justify-center">
                <Loader2 className="animate-spin text-fashion-gold" size={24} />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 bg-fashion-charcoal/50 border-t border-white/10 flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about fashion..."
              className="flex-1 bg-white/5 text-fashion-cream text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-fashion-gold border border-white/10 placeholder:text-fashion-cream/30"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-fashion-gold text-fashion-obsidian p-3 rounded-xl hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      ) : (
        // Floating Button
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-gradient-to-br from-fashion-gold to-fashion-rose rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-white/20"
        >
          <MessageCircle size={32} className="text-white" />
        </button>
      )}
    </div>
  );
};
export default ChatWidget;