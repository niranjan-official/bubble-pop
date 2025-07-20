import { useEffect, useRef, useState } from 'react';

interface UseVoiceCommandsProps {
  onLetterRecognized: (letter: string) => void;
  isEnabled: boolean;
}

export function useVoiceCommands({ onLetterRecognized, isEnabled }: UseVoiceCommandsProps) {
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

    recognition.onresult = (event) => {
      const results = Array.from(event.results);
      const transcript = results
        .map(result => result[0].transcript)
        .join('')
        .toLowerCase()
        .trim();

      // Extract single letters from speech
      const letterMatch = transcript.match(/\b([a-z])\b/);
      if (letterMatch) {
        onLetterRecognized(letterMatch[1].toUpperCase());
      }
    };

    recognition.onerror = (event) => {
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
  }, [onLetterRecognized]);

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