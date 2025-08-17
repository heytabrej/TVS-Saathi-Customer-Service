'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, MessageCircle, Paperclip, Loader2, Sun, Moon, Sparkles, FileText, X } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { useCustomer } from '@/hooks/useCustomer';
import { useLanguage } from '@/context/LanguageContext';
import { LanguageSelector } from '../ui/LanguageSelector';
import { AccessibilityControls } from '../ui/AccessibilityControls';
import { QuickActions } from '../ui/QuickActions';
import JourneyTracker from './JourneyTracker';
import CustomerProfile from './CustomerProfile';
import { ResetConversationButton } from '../ui/ResetConversationButton';
import { ChatBubble } from '../ui/ChatBubble';
import { FloatingVoiceButton } from '../ui/FloatingVoiceButton';
import EmiCalculator from './EmiCalculator';
import { useStreamingChat } from '@/hooks/useStreamingChat';

export const MainDashboard: React.FC = () => {
  const { customer } = useCustomer();
  const { language } = useLanguage();

  const [inputText, setInputText] = useState('');
  const [currentAgent, setCurrentAgent] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [useStream, setUseStream] = useState(true);
  const [dark, setDark] = useState(false);
  const [expandedInput, setExpandedInput] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Standard chat hook
  const classic = useChat(customer);
  // Streaming chat hook
  const streaming = useStreamingChat();

  const messages = useStream ? streaming.messages : classic.messages;
  const isLoading = useStream ? streaming.isLoading : classic.isLoading;
  const sendMessage = useStream ? streaming.send : classic.sendMessage;

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const formatDate = (d: Date) =>
    d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

  const nextEmi = customer?.loanStatus?.emiSchedule?.[0];
  const docsPending = customer?.loanStatus?.documentsPending ? 1 : 0;

  const contextualSuggestions = (() => {
    if (!showSuggestions) return [];
    if (currentAgent.includes('Payment')) return ['When is my EMI due?', 'How do I pay?', 'Show EMI breakdown'];
    if (currentAgent.includes('Onboarding')) return ['My monthly income is 25000', 'I want 60000 loan', 'Tenure 24 months'];
    if (currentAgent.includes('Grievance')) return ['I have an issue', 'Log a complaint', 'Talk to support'];
    return ['Check EMI', 'Apply for loan', 'Upload documents', 'Calculate EMI'];
  })();

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;
    setSending(true);
    const r = await sendMessage(inputText.trim());
    if (r?.agent) setCurrentAgent(r.agent);
    setInputText('');
    setExpandedInput(false);
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key === 'Escape') {
      setExpandedInput(false);
    }
  };

  const handleQuickAction = async (q: string) => {
    const r = await sendMessage(q);
    if (r?.agent) setCurrentAgent(r.agent);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(prev => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const removeAttachment = (i: number) =>
    setAttachments(prev => prev.filter((_, idx) => idx !== i));

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden main-mesh-bg">
      {/* Header */}
      <header className="shrink-0 bg-white/70 dark:bg-black/40 backdrop-blur-xl border-b border-gray-200/70 dark:border-gray-700/60 px-5 py-3 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-4">
          {/* Replaced old PNG + Beta badge with adjustable SVG logo */}
          <div className="relative group">
            <img
              src="/icons/tvs-logo.png"
              alt="TVS Credit Logo"
              className="h-10 w-auto md:h-12 object-contain transition-transform duration-200 group-hover:scale-[1.03]"
            />
            {/* Optional size tweak handle (uncomment to adjust quickly)
            <style jsx>{`
              @media (max-width: 640px){
                .logo-adjust { height: 40px; }
              }
            `}</style>
            */}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              Saathi Assistant <Sparkles className="w-4 h-4 text-amber-400" />
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Smart help for your financial journey
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs bg-white/60 dark:bg-white/10 border border-gray-200 dark:border-gray-600 rounded-md px-2 py-1">
            <span className="font-medium text-gray-600 dark:text-gray-300">Streaming</span>
            <button
              onClick={() => setUseStream(s => !s)}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                useStream
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
              }`}
            >
              {useStream ? 'ON' : 'OFF'}
            </button>
          </div>
          <button
            onClick={() => setDark(d => !d)}
            className="p-2 rounded-md bg-white/70 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:shadow-sm transition"
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} className="text-gray-600" />}
          </button>
          <AccessibilityControls />
          <LanguageSelector />
          <div className="hidden md:block text-sm text-gray-600 dark:text-gray-300">
            {customer?.name ? `Hi, ${customer.name.split('(')[0]}` : 'Guest'}
          </div>
          <ResetConversationButton />
        </div>
      </header>

      {/* Body Grid */}
      <main className="flex-1 grid lg:grid-cols-3 overflow-hidden relative">
        {/* Left / Chat Column */}
        <section className="lg:col-span-2 flex flex-col overflow-hidden relative">
          {/* Hero / Stats */}
            <div className="shrink-0 px-6 pt-6 pb-4 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/85 via-blue-500/80 to-emerald-500/80 rounded-br-3xl rounded-bl-3xl blur-[1px]" />
              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {customer?.name ? `Hello ${customer.name.split('(')[0]}` : 'Welcome'}
                    </h2>
                    <p className="text-sm text-blue-50">
                      {currentAgent
                        ? `You are with ${currentAgent.replace('Agent', '')} support`
                        : 'Ask about loans, EMI, documents or any issue'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="stat-tile">
                    <p className="stat-label">Next EMI</p>
                    <p className="stat-value">
                      {nextEmi ? `₹${nextEmi.amount}` : '--'}
                    </p>
                    <p className="stat-sub">
                      {nextEmi ? nextEmi.dueDate : 'No schedule'}
                    </p>
                  </div>
                  <div className="stat-tile">
                    <p className="stat-label">Loan Status</p>
                    <p className="stat-value">
                      {customer?.loanStatus?.loanApproved
                        ? 'Approved'
                        : customer?.loanStatus?.applicationSubmitted
                        ? 'In Review'
                        : 'New'}
                    </p>
                    <p className="stat-sub">
                      {customer?.loanStatus?.applicationSubmitted
                        ? 'Tracking'
                        : 'Start now'}
                    </p>
                  </div>
                  <div className="stat-tile">
                    <p className="stat-label">Docs Pending</p>
                    <p className="stat-value">
                      {docsPending ? docsPending : '0'}
                    </p>
                    <p className="stat-sub">
                      {docsPending ? 'Action needed' : 'All good'}
                    </p>
                  </div>
                  <div className="stat-tile">
                    <p className="stat-label">Agent</p>
                    <p className="stat-value">
                      {currentAgent ? currentAgent.replace('Agent', '') : 'Auto'}
                    </p>
                    <p className="stat-sub">
                      Smart Routing
                    </p>
                  </div>
                </div>
              </div>
            </div>

          {/* Chat Container */}
          <div className="flex-1 overflow-hidden flex flex-col relative">
            <div className="chat-fade-top pointer-events-none" />
            <div className="flex-1 overflow-y-auto chat-scroll px-5 py-6 space-y-2 relative">
              {messages.length === 0 && !isLoading && (
                <div className="text-center text-gray-500 mt-10">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Start a conversation...</p>
                  <p className="text-sm">Try one of these:</p>
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    {['What is my next EMI?', 'Apply for a loan', 'Upload documents', 'Log a complaint'].map(s => (
                      <button
                        key={s}
                        onClick={() => handleQuickAction(s)}
                        className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-full text-xs font-medium text-gray-700 transition"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages with date separators */}
              {messages.map((m, idx) => {
                const prev = messages[idx - 1];
                const showDate = !prev || formatDate(prev.timestamp) !== formatDate(m.timestamp);
                return (
                  <React.Fragment key={m.id}>
                    {showDate && (
                      <div className="my-4 flex items-center gap-3">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                        <span className="text-[11px] uppercase tracking-wide text-gray-500 bg-white/70 dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-600 shadow-sm">
                          {formatDate(m.timestamp)}
                        </span>
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                      </div>
                    )}
                    <ChatBubble
                      role={m.isUser ? 'user' : 'ai'}
                      text={m.content}
                      timestamp={m.timestamp}
                      agent={m.agent}
                    />
                  </React.Fragment>
                );
              })}

              {isLoading && (
                <div className="flex items-center gap-3 mt-4">
                  <div className="flex gap-1">
                    <span className="typing-indicator-dot" />
                    <span className="typing-indicator-dot" />
                    <span className="typing-indicator-dot" />
                  </div>
                  <span className="text-xs text-gray-500">Saathi is responding...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="chat-fade-bottom pointer-events-none" />
            {/* Suggestions Bar */}
            {contextualSuggestions.length > 0 && (
              <div className="shrink-0 px-4 pb-1 pt-2 bg-gradient-to-t from-white/90 dark:from-gray-900/90 via-white/70 dark:via-gray-900/70 backdrop-blur">
                <div className="flex flex-wrap gap-2">
                  {contextualSuggestions.map(s => (
                    <button
                      key={s}
                      onClick={() => handleQuickAction(s)}
                      className="suggestion-chip"
                    >
                      {s}
                    </button>
                  ))}
                  <button
                    onClick={() => setShowSuggestions(false)}
                    className="suggestion-chip opacity-70 hover:opacity-100"
                  >
                    Hide
                  </button>
                </div>
              </div>
            )}
            {/* Input Bar */}
            <div className="shrink-0 border-t border-gray-200 dark:border-gray-700 px-4 py-3 bg-white/90 dark:bg-gray-900/85 backdrop-blur-xl">
              <div className="flex items-end gap-3">
                <button
                  onClick={() => setIsVoiceMode(!isVoiceMode)}
                  className={`p-3 rounded-xl border transition-all ${
                    isVoiceMode
                      ? 'bg-red-500 border-red-600 text-white shadow'
                      : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                  title={isVoiceMode ? 'Stop voice input' : 'Voice input'}
                >
                  {isVoiceMode ? <MicOff size={18} /> : <Mic size={18} />}
                </button>

                {!isVoiceMode && (
                  <div className="flex-1 flex flex-col gap-2">
                    {attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {attachments.map((f, i) => (
                          <div key={i} className="attachment-pill">
                            <FileText size={12} />
                            <span className="truncate max-w-[120px]">{f.name}</span>
                            <button
                              onClick={() => removeAttachment(i)}
                              className="opacity-60 hover:opacity-100"
                              aria-label="Remove attachment"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div
                      className={`flex items-end gap-2 rounded-2xl px-3 py-2 border shadow-sm transition focus-within:ring-2 focus-within:ring-blue-500 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 relative ${
                        expandedInput ? 'min-h-[92px]' : 'min-h-[56px]'
                      }`}
                    >
                      <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onFocus={() => setExpandedInput(true)}
                        onBlur={() => { if (!inputText.trim()) setExpandedInput(false); }}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message... (Enter to send, Shift+Enter new line)"
                        rows={expandedInput ? 3 : 1}
                        className="flex-1 resize-none bg-transparent outline-none text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 leading-relaxed"
                        disabled={isLoading || sending}
                      />
                      <div className="flex items-center gap-2">
                        <label className="icon-btn cursor-pointer">
                          <input
                            type="file"
                            multiple
                            className="hidden"
                            onChange={handleFile}
                            aria-label="Attach files"
                          />
                          <Paperclip size={16} />
                        </label>
                        {inputText && (
                          <button
                            onClick={() => setInputText('')}
                            className="icon-btn"
                            title="Clear"
                          >
                            <X size={14} />
                          </button>
                        )}
                        <button
                          onClick={handleSendMessage}
                          disabled={!inputText.trim() || isLoading || sending}
                          className="send-btn"
                          title="Send"
                        >
                          {sending || isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {isVoiceMode && (
                  <div className="flex-1 flex items-center gap-3">
                    <div className="flex-1 h-14 rounded-2xl border border-dashed border-blue-400 bg-blue-50/60 dark:bg-blue-950/30 flex items-center justify-center text-xs text-blue-600 dark:text-blue-300 font-medium tracking-wide voice-visual">
                      Listening... (voice-to-text placeholder)
                    </div>
                    <button
                      onClick={() => setIsVoiceMode(false)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow transition"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Right Sidebar */}
        <aside className="hidden lg:flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-950/60 border-l border-gray-200 dark:border-gray-700">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 sidebar-scroll">
            <div className="elevate-card p-5">
              <EmiCalculator />
            </div>
            <div className="elevate-card p-5">
              <JourneyTracker />
            </div>
            <div className="elevate-card p-5">
              <QuickActions onAction={handleQuickAction} />
            </div>
            <div className="elevate-card p-5">
              <CustomerProfile />
            </div>
            <div className="elevate-card p-5">
              <h3 className="section-title">Proactive Alerts</h3>
              <p className="empty-text">No alerts right now.</p>
            </div>
            <div className="elevate-card p-5">
              <h3 className="section-title">Upcoming</h3>
              <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <li>Doc Upload + OCR</li>
                <li>Offline FAQ Pack</li>
                <li>Cross-sell Recommender</li>
              </ul>
            </div>
          </div>
        </aside>
      </main>

      {/* Floating Voice (mobile only) */}
      <FloatingVoiceButton
        active={isVoiceMode}
        onClick={() => setIsVoiceMode(!isVoiceMode)}
      />
    </div>
  );
};

export default MainDashboard;
