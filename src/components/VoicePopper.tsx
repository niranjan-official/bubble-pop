import React, { useRef, useState } from 'react';

interface VoicePopperProps {
  onPop: () => void;
}

const VoicePopper: React.FC<VoicePopperProps> = ({ onPop }) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const startListening = () => {
    setError(null);
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Web Speech API not supported in this browser.');
      console.log('[VoicePopper] Web Speech API not supported');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onstart = () => {
      setIsListening(true);
      console.log('[VoicePopper] Speech recognition started');
    };
    recognition.onend = () => {
      setIsListening(false);
      console.log('[VoicePopper] Speech recognition ended');
    };
    recognition.onerror = (e: any) => {
      if (e.error === 'aborted') {
        console.log('[VoicePopper] Speech recognition aborted');
        setIsListening(false);
        return;
      }
      setError('Speech recognition error: ' + e.error);
      setIsListening(false);
      console.error('[VoicePopper] Speech recognition error:', e);
    };
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join(' ')
        .toLowerCase();
      console.log('[VoicePopper] Transcript:', transcript);
      if (transcript.includes('pop')) {
        console.log('[VoicePopper] Detected "pop" - triggering onPop');
        onPop();
      }
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      console.log('[VoicePopper] Speech recognition stopped by user');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 12 }}>
      <button
        type="button"
        onClick={isListening ? stopListening : startListening}
        style={{
          background: isListening ? '#22c55e' : '#6366f1',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '8px 18px',
          fontWeight: 600,
          fontSize: 16,
          cursor: 'pointer',
          marginBottom: 6,
        }}
      >
        {isListening ? 'Listening... (say "pop")' : 'Voice Pop'}
      </button>
      {error && <div style={{ color: '#f87171', fontSize: 13 }}>{error}</div>}
    </div>
  );
};

export default VoicePopper; 