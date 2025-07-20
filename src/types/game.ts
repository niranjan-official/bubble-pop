export interface GameState {
  currentWord: string;
  targetLetters: string[];
  currentLetterIndex: number;
  score: number;
  isComplete: boolean;
  fallingLetters: FallingLetter[];
}

export interface FallingLetter {
  id: string;
  letter: string;
  x: number;
  y: number;
  speed: number;
  isCorrect: boolean;
  inDropZone: boolean;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  reducedMotion: boolean;
  largeText: boolean;
  voiceEnabled: boolean;
  gestureEnabled: boolean;
}

export interface Position {
  x: number;
  y: number;
}