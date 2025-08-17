'use client';

import React from 'react';
import { cn } from '../../lib/utils';

interface QA {
  title: string;
  query: string;
  icon: React.ReactNode;
  colorFrom: string;
  colorTo: string;
}

const actions: QA[] = [
  { title: 'Check EMI', query: 'What is my next EMI?', icon: <span>📅</span>, colorFrom: 'from-blue-500', colorTo: 'to-green-500' },
  { title: 'Make Payment', query: 'How can I pay my EMI?', icon: <span>💳</span>, colorFrom: 'from-indigo-500', colorTo: 'to-blue-500' },
  { title: 'Upload Docs', query: 'Which documents must I upload?', icon: <span>📤</span>, colorFrom: 'from-purple-500', colorTo: 'to-indigo-500' },
  { title: 'Track Application', query: 'Show my loan application status.', icon: <span>🛰️</span>, colorFrom: 'from-orange-500', colorTo: 'to-yellow-500' },
  { title: 'Support', query: 'I have an issue. Help.', icon: <span>🛠️</span>, colorFrom: 'from-red-500', colorTo: 'to-pink-500' },
  { title: 'Calculate EMI', query: 'Help me calculate loan EMI.', icon: <span>🧮</span>, colorFrom: 'from-green-500', colorTo: 'to-emerald-500' }
];

export const QuickActions: React.FC<{ onAction: (q: string) => void }> = ({ onAction }) => {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-3 tracking-wide">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map(a => (
          <button
            key={a.title}
            onClick={() => onAction(a.query)}
            className={cn(
              'relative group rounded-xl p-4 text-left bg-white shadow-sm hover:shadow-md transition-all',
              'border border-gray-200 hover:border-transparent',
              'overflow-hidden'
            )}
          >
            <div className={cn('absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity',
              'bg-gradient-to-br', a.colorFrom, a.colorTo, 'mix-blend-multiply')} />
            <div className="relative z-10">
              <div className="text-xl mb-2">{a.icon}</div>
              <p className="font-medium text-sm text-gray-800 group-hover:text-white">{a.title}</p>
            </div>
            <div className="absolute right-3 top-3 w-2 h-2 rounded-full bg-gradient-to-r from-white to-gray-200 opacity-70 group-hover:scale-150 transition-transform" />
          </button>
        ))}
      </div>
    </div>
  );
};