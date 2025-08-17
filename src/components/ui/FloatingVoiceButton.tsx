'use client';
import React from 'react';

interface Props {
  active: boolean;
  onClick: () => void;
}

export const FloatingVoiceButton: React.FC<Props> = ({ active, onClick }) => (
  <button
    onClick={onClick}
    aria-label="Toggle voice input"
    className={`fixed bottom-5 right-5 z-50 rounded-full shadow-lg transition-all
      ${active ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}
      text-white h-16 w-16 flex items-center justify-center text-2xl`}
  >
    {active ? '◼' : '🎤'}
  </button>
);