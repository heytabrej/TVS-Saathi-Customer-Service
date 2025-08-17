'use client';
import { useRef, useState, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useCustomer } from './useCustomer';

interface Msg {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  agent?: string;
  streaming?: boolean;
}

export function useStreamingChat() {
  const { language } = useLanguage();
  const { customer } = useCustomer();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);
  const sessionIdRef = useRef<string>(() => crypto.randomUUID() as any as string);

  const add = useCallback((m: Partial<Msg>) => {
    setMessages(prev => [...prev, {
      id: crypto.randomUUID(),
      content: '',
      isUser: false,
      timestamp: new Date(),
      ...m
    }]);
  }, []);

  const send = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, {
      id: crypto.randomUUID(),
      content: text,
      isUser: true,
      timestamp: new Date()
    }]);

    setIsLoading(true);
    controllerRef.current?.abort();
    controllerRef.current = new AbortController();

    const res = await fetch('/api/chat/stream', {
      method: 'POST',
      body: JSON.stringify({
        message: text,
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
      }),
      headers: { 'Content-Type': 'application/json' },
      signal: controllerRef.current.signal
    });

    if (!res.body) {
      setIsLoading(false);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    const aiId = crypto.randomUUID();
    add({ id: aiId, content: '', streaming: true, agent: '...' });

    let metaParsed = false;
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        setMessages(prev => prev.map(m => m.id === aiId ? { ...m, streaming: false } : m));
        break;
      }
      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      if (!metaParsed) {
        const metaStart = buffer.indexOf('__META_START__');
        const metaEnd = buffer.indexOf('__META_END__');
        if (metaStart !== -1 && metaEnd !== -1) {
          const jsonStr = buffer.substring(metaStart + 13, metaEnd);
          buffer = buffer.slice(metaEnd + 12);
          try {
            const meta = JSON.parse(jsonStr);
            setMessages(prev => prev.map(m => m.id === aiId ? { ...m, agent: meta.agent } : m));
          } catch { /* ignore */ }
          metaParsed = true;
        } else {
          continue;
        }
      }

      if (buffer) {
        setMessages(prev => prev.map(m =>
          m.id === aiId
            ? { ...m, content: m.content + buffer }
            : m
        ));
        buffer = '';
      }
    }

    setIsLoading(false);
  }, [add, customer, language]);

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
    setMessages(prev => prev.map(m => m.streaming ? { ...m, streaming: false } : m));
    setIsLoading(false);
  }, []);

  const clear = useCallback(() => setMessages([]), []);

  return { messages, isLoading, send, cancel, clear };
}