import { useEffect, useRef, useState } from 'react';

// Type definitions for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
  var SpeechRecognition: {
    prototype: SpeechRecognition;
    new (): SpeechRecognition;
  };
}
// If SpeechRecognition is not defined, define a minimal type for TS
type SpeechRecognition = any;

interface UseVoiceCommandsProps {
  onLetterRecognized: (letter: string) => void;
  isEnabled: boolean;
  onBubbleCommand?: () => void; // Add this line
}

export function useVoiceCommands({ onLetterRecognized, isEnabled, onBubbleCommand }: UseVoiceCommandsProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
      // Restart recognition if it's still enabled
      if (isEnabled) {
        setTimeout(() => {
          try {
            recognition.start();
          } catch (error) {
            console.log('Recognition restart failed:', error);
          }
        }, 100);
      }
    };

    recognition.onresult = (event: any) => {
      const results = Array.from(event.results);
      const transcript = results
        .map((result: any) => result[0].transcript)
        .join('')
        .toLowerCase()
        .trim();

      console.log('[VoiceCommands] Transcript received:', transcript);

      // Check for the word 'bubble' and trigger the callback if present
      if (onBubbleCommand && /\b(bubble|pop)\b/.test(transcript)) {
        console.log('[VoiceCommands] "bubble" command detected!');
        onBubbleCommand();
      }
    };

    recognition.onerror = (event: any) => {
      console.log('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setIsSupported(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onLetterRecognized, onBubbleCommand]);

  useEffect(() => {
    if (!isSupported || !recognitionRef.current) return;

    if (isEnabled) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.log('Recognition start failed:', error);
      }
    } else {
      recognitionRef.current.stop();
    }
  }, [isEnabled, isSupported]);

  return {
    isListening,
    isSupported,
    startListening: () => {
      if (recognitionRef.current && !isListening) {
        try {
          recognitionRef.current.start();
        } catch (error) {
          console.log('Manual start failed:', error);
        }
      }
    },
    stopListening: () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  };
}