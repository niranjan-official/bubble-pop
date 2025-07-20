import { useEffect, useRef, useState } from 'react';

interface UseGestureRecognitionProps {
  onGestureDetected: (gesture: string) => void;
  isEnabled: boolean;
}

export function useGestureRecognition({ onGestureDetected, isEnabled }: UseGestureRecognitionProps) {
  const [isActive, setIsActive] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Check if getUserMedia is supported
    setIsSupported(!!navigator.mediaDevices?.getUserMedia);
  }, []);

  const startCamera = async () => {
    if (!isSupported) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240 }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsActive(true);
      }
    } catch (error) {
      console.log('Camera access denied:', error);
      setIsSupported(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsActive(false);
  };

  useEffect(() => {
    if (isEnabled && isSupported) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isEnabled, isSupported]);

  // Simple gesture detection based on mouse/touch movements
  const handlePointerMove = (event: PointerEvent) => {
    if (!isEnabled) return;

    // Simple gesture detection - you could enhance this with TensorFlow.js
    const gesture = detectSimpleGesture(event);
    if (gesture) {
      onGestureDetected(gesture);
    }
  };

  const detectSimpleGesture = (event: PointerEvent): string | null => {
    // This is a simplified gesture detection
    // In a production app, you'd use MediaPipe or TensorFlow.js for hand tracking
    const rect = (event.target as Element)?.getBoundingClientRect();
    if (!rect) return null;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Simple pointing gesture detection based on position
    if (x > rect.width * 0.4 && x < rect.width * 0.6 && 
        y > rect.height * 0.4 && y < rect.height * 0.6) {
      return 'point';
    }
    
    return null;
  };

  return {
    isActive,
    isSupported,
    videoRef,
    canvasRef,
    handlePointerMove
  };
}