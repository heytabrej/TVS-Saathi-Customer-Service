'use client';
import React from 'react';
import { useThemeAccessibility } from '../../context/ThemeAccessibilityContext';

export const AccessibilityControls: React.FC = () => {
  const { highContrast, toggleHighContrast, fontScale, setFontScale } = useThemeAccessibility();
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={toggleHighContrast}
        className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
          highContrast ? 'bg-black text-white border-gray-700' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
        }`}
        aria-pressed={highContrast}
      >
        Contrast
      </button>
      <select
        aria-label="Font size"
        value={fontScale}
        onChange={e => setFontScale(e.target.value as any)}
        className="text-xs border border-gray-300 rounded-md px-2 py-1 bg-white"
      >
        <option value="normal">A</option>
        <option value="large">A+</option>
        <option value="xlarge">A++</option>
      </select>
    </div>
  );
};