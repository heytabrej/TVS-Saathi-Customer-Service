'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  agent?: string;
}

export const useChat = (customer?: any) => {
  const { language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const sessionIdRef = useRef<string>('');

  // stable session id (localStorage)
  useEffect(() => {
    const existing = localStorage.getItem('saathi_session');
    if (existing) {
      sessionIdRef.current = existing;
    } else {
      const id = 'sess_' + crypto.randomUUID();
      sessionIdRef.current = id;
      localStorage.setItem('saathi_session', id);
    }
  }, []);

  const addMessage = useCallback((content: string, isUser: boolean, agent?: string) => {
    const msg: Message = {
      id: Date.now().toString() + Math.random(),
      content,
      isUser,
      timestamp: new Date(),
      agent
    };
    setMessages(prev => [...prev, msg]);
    return msg;
  }, []);

  const clearMessages = useCallback(() => setMessages([]), []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    addMessage(content, true);
    setIsLoading(true);
    try {
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
            sessionId: sessionIdRef.current,
            language,
            customerContext: {
              customerId: customer?.id,
              name: customer?.name,
              language: customer?.language || language,
              loanStatus: customer?.loanStatus?.applicationSubmitted ? 'active' : 'new',
              emiDueDate: customer?.loanStatus?.emiSchedule?.[0]?.dueDate,
              emiAmount: customer?.loanStatus?.emiSchedule?.[0]?.amount
            }
        })
      });
      const data = await resp.json();
      addMessage(data.message, false, data.agent);
      return data;
    } catch (e) {
      console.error(e);
      addMessage('Unable to process now. Please try again.', false);
    } finally {
      setIsLoading(false);
    }
  }, [addMessage, customer, language]);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages
  };
};