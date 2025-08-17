import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import VoiceInput from '../../src/components/ui/VoiceInput';

describe('VoiceInput Component', () => {
  test('renders microphone button', () => {
    render(<VoiceInput />);
    const microphoneButton = screen.getByRole('button', { name: /microphone/i });
    expect(microphoneButton).toBeInTheDocument();
  });

  test('activates voice input on button click', () => {
    render(<VoiceInput />);
    const microphoneButton = screen.getByRole('button', { name: /microphone/i });
    fireEvent.click(microphoneButton);
    // Assuming the component has a state that indicates if voice input is active
    expect(screen.getByText(/listening.../i)).toBeInTheDocument();
  });

  test('displays transcription when voice input is detected', () => {
    render(<VoiceInput />);
    const microphoneButton = screen.getByRole('button', { name: /microphone/i });
    fireEvent.click(microphoneButton);
    // Simulate receiving a transcription
    const transcription = 'Hello, I need help with my loan.';
    fireEvent.change(screen.getByRole('textbox'), { target: { value: transcription } });
    expect(screen.getByDisplayValue(transcription)).toBeInTheDocument();
  });

  test('handles errors gracefully', () => {
    render(<VoiceInput />);
    const microphoneButton = screen.getByRole('button', { name: /microphone/i });
    fireEvent.click(microphoneButton);
    // Simulate an error in voice recognition
    fireEvent.error(screen.getByRole('textbox'));
    expect(screen.getByText(/error recognizing voice/i)).toBeInTheDocument();
  });
});