'use client';
import React, { useState } from 'react';
import { Mic } from 'lucide-react';
import { User, Bot } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ChatBubbleProps {
  role: 'user' | 'ai';
  text: string;
  timestamp: Date;
  agent?: string;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ role, text, timestamp, agent }) => {
  const isUser = role === 'user';
  const speak = () => {
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-IN';
      u.rate = 1;
      speechSynthesis.speak(u);
    } catch {}
  };
  return (
    <div className={cn('flex w-full mb-3', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'relative px-4 py-3 rounded-2xl max-w-xs md:max-w-md whitespace-pre-wrap shadow-sm transition-colors',
          'gradient-border',
          isUser
            ? 'bg-blue-600 text-white rounded-br-sm'
            : 'bg-gray-100 text-gray-800 rounded-bl-sm'
        )}
      >
        {!isUser && agent && (
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase tracking-wide text-gray-500 font-medium">{agent}</span>
            <button
              aria-label="Play voice"
              onClick={speak}
              className="ml-2 text-gray-500 hover:text-blue-600 text-[10px] font-semibold"
            >
              Listen
            </button>
          </div>
        )}
        <p className="text-sm leading-relaxed">{text}</p>
        <span className="text-[10px] opacity-70 mt-1 block">
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

interface VoiceInputProps {
  onVoiceInput: (text: string) => void;
  language?: string;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onVoiceInput, language = 'hi' }) => {
  const [isListening, setIsListening] = useState(false);

  const handleToggleListening = () => {
    // Mocking voice input for demonstration
    if (!isListening) {
      setIsListening(true);
      setTimeout(() => {
        const mockTranscript = language === 'hi' ? 'मेरा EMI कब है?' : 'When is my EMI due?';
        onVoiceInput(mockTranscript);
        setIsListening(false);
      }, 2000);
    } else {
      setIsListening(false);
    }
  };

  return (
    <button
      onClick={handleToggleListening}
      className={`p-2 rounded-full transition-colors ${
        isListening
          ? 'bg-red-500 text-white animate-pulse'
          : 'text-muted-foreground hover:text-primary hover:bg-secondary'
      }`}
    >
      <Mic className="w-5 h-5" />
    </button>
  );
};

export default function App() {
  const [messages, setMessages] = useState<
    { text: string; isUser: boolean; timestamp: Date }[]
  >([]);

  const handleVoiceInput = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { text, isUser: true, timestamp: new Date() },
    ]);
  };

  return (
    <div className="p-4">
      <div className="flex flex-col-reverse">
        {messages.map((msg, index) => (
          <ChatBubble
            key={index}
            role={msg.isUser ? 'user' : 'ai'}
            text={msg.text}
            timestamp={msg.timestamp}
            agent={msg.isUser ? undefined : 'AI'}
          />
        ))}
      </div>
      <div className="fixed bottom-4 right-4">
        <VoiceInput onVoiceInput={handleVoiceInput} />
      </div>
    </div>
  );
}