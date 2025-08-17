import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from '../context/LanguageContext';
import { ThemeAccessibilityProvider } from '../context/ThemeAccessibilityContext';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: 'Saathi Smart Assistant',
  manifest: '/manifest.json'
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <ThemeAccessibilityProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ThemeAccessibilityProvider>
        {process.env.NODE_ENV === 'production' && (
          <script dangerouslySetInnerHTML={{ __html: `
            if('serviceWorker' in navigator){
              window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}))
            }` }} />
        )}
      </body>
    </html>
  );
}