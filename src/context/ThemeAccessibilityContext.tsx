'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeAccessibilityCtx {
  highContrast: boolean;
  toggleHighContrast: () => void;
  fontScale: 'normal' | 'large' | 'xlarge';
  setFontScale: (s: 'normal' | 'large' | 'xlarge') => void;
}

const Ctx = createContext<ThemeAccessibilityCtx | null>(null);

export const ThemeAccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [highContrast, setHighContrast] = useState(false);
  const [fontScale, setFontScaleState] = useState<'normal' | 'large' | 'xlarge'>('normal');

  useEffect(() => {
    const hc = localStorage.getItem('saathi_high_contrast') === '1';
    const fs = (localStorage.getItem('saathi_font_scale') as any) || 'normal';
    setHighContrast(hc);
    setFontScaleState(fs);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast', highContrast);
    localStorage.setItem('saathi_high_contrast', highContrast ? '1' : '0');
  }, [highContrast]);

  useEffect(() => {
    document.documentElement.dataset.font = fontScale === 'normal' ? '' : fontScale;
    localStorage.setItem('saathi_font_scale', fontScale);
  }, [fontScale]);

  return (
    <Ctx.Provider value={{
      highContrast,
      toggleHighContrast: () => setHighContrast(v => !v),
      fontScale,
      setFontScale: setFontScaleState
    }}>
      {children}
    </Ctx.Provider>
  );
};

export const useThemeAccessibility = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error('useThemeAccessibility must be used within provider');
  return v;
};