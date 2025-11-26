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
    <div className={`flex flex-col h-full bg-surface border-l border-slate-700 ${className}`}>
      {/* Safety Notice Header */}
      <div className="bg-slate-900/50 p-3 border-b border-slate-700 flex items-center gap-2 text-xs text-slate-400">
        <Shield className="w-3 h-3 text-primary" />
        <span>Chat is moderated. Be respectful.</span>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 text-sm">
            <p>You're connected!</p>
            <p>Say hi to break the ice.</p>
          </div>
        )}
        
        {messages.map((msg) => {
           const isMe = msg.sender === 'me';
           const isSystem = msg.sender === 'system';

           if (isSystem) {
             return (
               <div key={msg.id} className="flex justify-center my-2">
                 <span className="bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded-full border border-slate-700">
                   {msg.text}
                 </span>
               </div>
             )
           }

           return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                    isMe 
                    ? 'bg-primary text-white rounded-br-none' 
                    : 'bg-slate-700 text-slate-100 rounded-bl-none'
                }`}>
                    {msg.text}
                </div>
            </div>
           );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-surface border-t border-slate-700">
        <form onSubmit={handleSend} className="relative flex items-center gap-2">
          <input
            type="text"
            className="flex-1 bg-slate-900 border border-slate-700 rounded-full px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder={isDisabled ? "Searching for a partner..." : "Type a message..."}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isDisabled}
          />
          <button 
            type="submit"
            disabled={!inputText.trim() || isDisabled}
            className="p-3 bg-primary hover:bg-primaryHover text-white rounded-full transition-colors disabled:opacity-50 disabled:bg-slate-700"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};