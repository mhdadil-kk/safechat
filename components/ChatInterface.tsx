import React, { useRef, useEffect, useState } from 'react';
import { Send, Shield } from 'lucide-react';
import { Message } from '../types';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isDisabled?: boolean;
  className?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isDisabled = false,
  className = ''
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isDisabled) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 scrollbar-hide">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs text-center px-4">
            <Shield className="w-8 h-8 mb-2 opacity-20" />
            <p>Chat is moderated.</p>
            <p>Be respectful & kind.</p>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.sender === 'me';
          const isSystem = msg.sender === 'system';

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center my-2">
                <span className="bg-white/5 backdrop-blur-sm text-slate-400 text-[10px] px-2 py-1 rounded-full border border-white/5">
                  {msg.text}
                </span>
              </div>
            )
          }

          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm backdrop-blur-sm border ${isMe
                ? 'bg-[#D4F932]/20 border-[#D4F932]/30 text-white rounded-br-none'
                : 'bg-white/10 border-white/5 text-slate-100 rounded-bl-none'
                }`}>
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-white/5 bg-black/60 backdrop-blur-md">
        <form onSubmit={handleSend} className="relative flex items-center gap-2">
          <input
            type="text"
            className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#D4F932]/50 focus:bg-white/10 transition-all disabled:opacity-50"
            placeholder={isDisabled ? "Searching..." : "Type a message..."}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isDisabled}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isDisabled}
            className="p-2.5 bg-[#D4F932] text-black rounded-full hover:bg-[#B8D92C] transition-colors disabled:opacity-50 disabled:bg-slate-700 disabled:text-slate-500"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};