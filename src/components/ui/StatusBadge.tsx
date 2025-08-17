'use client';
import React from 'react';
export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const normalized = status.toLowerCase();
  const style =
    normalized.includes('due') ? 'bg-amber-100 text-amber-700'
    : normalized.includes('paid') ? 'bg-green-100 text-green-700'
    : 'bg-gray-200 text-gray-700';
  return (
    <span className={`text-[10px] px-2 py-1 rounded-full font-medium tracking-wide ${style}`}>
      {status}
    </span>
  );
};