'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';

interface VoiceInputProps {
  onTranscript: (transcript: string) => void;
  language?: string;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const VoiceInput: React.FC<VoiceInputProps> = ({ 
  onTranscript, 
  language = 'hi-IN' 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 
        (window.SpeechRecognition || window.webkitSpeechRecognition)) {
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = language;

        recognitionRef.current.onstart = () => {
          setIsListening(true);
          setError(null);
        };

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          const currentTranscript = finalTranscript || interimTranscript;
          setTranscript(currentTranscript);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
          if (transcript.trim()) {
            onTranscript(transcript);
            setTranscript('');
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setError(`Voice recognition error: ${event.error}`);
          setIsListening(false);
        };
      }
    } else {
      setError('Voice recognition not supported in this browser');
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language, transcript, onTranscript]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setError(null);
      
      try {
        recognitionRef.current.start();
        
        // Auto-stop after 10 seconds
        timeoutRef.current = setTimeout(() => {
          if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
          }
        }, 10000);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
        setError('Failed to start voice recognition');
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center p-4 bg-red-50 rounded-lg border border-red-200">
        <p className="text-red-600 text-sm">{error}</p>
        <button 
          onClick={() => setError(null)}
          className="ml-2 text-red-400 hover:text-red-600"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border-2 border-dashed border-gray-300">
      <button
        onClick={isListening ? stopListening : startListening}
        className={`p-4 rounded-full transition-colors ${
          isListening 
            ? 'bg-red-500 text-white animate-pulse' 
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        {isListening ? <MicOff size={24} /> : <Mic size={24} />}
      </button>
      
      <div className="flex-1">
        {isListening ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">
              🎤 Listening... (speak now)
            </p>
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i}
                  className={`w-2 bg-blue-400 rounded animate-pulse`}
                  style={{ 
                    height: `${16 + Math.random() * 16}px`,
                    animationDelay: `${i * 100}ms`
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-600 text-sm">
            <Volume2 className="inline w-4 h-4 mr-2" />
            Click microphone to speak in Hindi or English
          </p>
        )}
        
        {transcript && (
          <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
            <strong>You said:</strong> {transcript}
          </div>
        )}
      </div>
    </div>
  );
};