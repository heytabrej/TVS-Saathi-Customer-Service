'use client';
import React from 'react';

export const ChatSkeleton: React.FC = () => (
  <div className="flex justify-start mb-3">
    <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 max-w-xs md:max-w-md w-56 animate-pulse">
      <div className="h-3 bg-gray-300/70 rounded mb-2" />
      <div className="h-3 bg-gray-300/60 rounded w-5/6 mb-2" />
      <div className="h-3 bg-gray-300/50 rounded w-1/3" />
    </div>
  </div>
);