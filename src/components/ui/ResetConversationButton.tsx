'use client';
import React from 'react';

export const ResetConversationButton: React.FC = () => {
  return (
    <button
      onClick={() => {
        localStorage.removeItem('saathi_session');
        location.reload();
      }}
      className="text-xs text-gray-500 hover:text-gray-700 underline"
    >
      Reset Conversation
    </button>
  );
};