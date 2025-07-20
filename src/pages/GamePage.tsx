import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, RotateCcw, Lightbulb, Volume2, Mic, Settings } from 'lucide-react';
import { FallingLetter } from '../components/FallingLetter';
import { DropZone } from '../components/DropZone';
import { WordDisplay } from '../components/WordDisplay';
import { AccessibilityControls } from '../components/AccessibilityControls';
import { useVoiceCommands } from '../hooks/useVoiceCommands';
import { useFistDetection } from '../hooks/useFistDetection';
import { 
  createFallingLetter, 
  updateFallingLetters, 
  checkLetterInDropZone,
  isCorrectLetter,
  getNextWord
} from '../utils/gameLogic';
import { audioManager } from '../utils/audio';
import { GameState, AccessibilitySettings, FallingLetter as FallingLetterType } from '../types/game';
import CameraFeed from '../components/detection/CameraFeed';
import DetectionStatus from '../components/detection/DetectionStatus';

export function GamePage() {
  const { word } = useParams<{ word: string }>();
  const navigate = useNavigate();
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const [showAccessibility, setShowAccessibility] = useState(false);
  
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem('accessibility-settings');
    return saved ? JSON.parse(saved) : {
      highContrast: false,
      reducedMotion: false,
      largeText: false,
      voiceEnabled: true,
    };
  });

  const [gameState, setGameState] = useState<GameState>({
    currentWord: word?.toLowerCase() || 'apple',
    targetLetters: (word?.toLowerCase() || 'apple').split(''),
    currentLetterIndex: 0,
    score: 0,
    isComplete: false,
    fallingLetters: []
  });

  const [dropZone, setDropZone] = useState({
    x: 0,
    y: 0,
    width: 0, // Will be set to screen width
    height: 300 // Keep height at 300
  });

  const fistVideoRef = useRef<HTMLVideoElement>(null);
  const fistDetection = useFistDetection(fistVideoRef);
  const [fistPopped, setFistPopped] = useState(false);

  // Voice commands hook
  const { isListening, isSupported: voiceSupported } = useVoiceCommands({
    onLetterRecognized: handleVoiceInput,
    isEnabled: settings.voiceEnabled
  });

  // Update drop zone position when component mounts
  useEffect(() => {
    const updateDropZone = () => {
      if (gameAreaRef.current) {
        const rect = gameAreaRef.current.getBoundingClientRect();
        setDropZone({
          x: 0, // Start from left edge
          y: rect.height / 2 - 150, // Center vertically
          width: rect.width, // Full screen width
          height: 300
        });
      }
    };

    updateDropZone();
    window.addEventListener('resize', updateDropZone);
    return () => window.removeEventListener('resize', updateDropZone);
  }, []);

  // Apply accessibility settings
  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast', settings.highContrast);
    document.documentElement.classList.toggle('reduced-motion', settings.reducedMotion);
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
    audioManager.setEnabled(settings.voiceEnabled);
  }, [settings]);

  // Game loop
  useEffect(() => {
    if (gameState.isComplete) return;

    const interval = setInterval(() => {
      setGameState(prev => {
        if (!gameAreaRef.current) return prev;
        
        const rect = gameAreaRef.current.getBoundingClientRect();
        let newLetters = [...prev.fallingLetters];

        // Add new letter occasionally (reduced frequency and only one at a time)
        if (Math.random() < 0.015 && newLetters.length < 1) {
          newLetters.push(createFallingLetter(rect.width, prev.currentWord, newLetters, prev.currentLetterIndex));
        }

        // Update existing letters
        newLetters = updateFallingLetters(newLetters, rect.height, dropZone);

        // Update drop zone status
        newLetters = newLetters.map(letter => ({
          ...letter,
          inDropZone: checkLetterInDropZone(letter, {
            x: dropZone.x,
            y: dropZone.y,
            width: dropZone.width,
            height: dropZone.height
          })
        }));

        return {
          ...prev,
          fallingLetters: newLetters
        };
      });
    }, 16); // 60fps

    return () => clearInterval(interval);
  }, [gameState.isComplete, dropZone]);

  // Update game state when word parameter changes
  useEffect(() => {
    if (word) {
      const newWord = word.toLowerCase();
      setGameState({
        currentWord: newWord,
        targetLetters: newWord.split(''),
        currentLetterIndex: 0,
        score: 0,
        isComplete: false,
        fallingLetters: []
      });
      
      // Announce the new word
      setTimeout(() => {
        audioManager.speakInstruction(`New word: ${word}. Catch the letters to spell it out!`);
      }, 500);
    }
  }, [word]);

  // On mobile, scroll to bottom on mount
  useEffect(() => {
    if (window.innerWidth < 640) {
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 200);
    }
  }, []);

  // Move popLetter above the fist pop effect
  const popLetter = useCallback((letter: FallingLetterType) => {
    const currentLetter = gameState.targetLetters[gameState.currentLetterIndex];
    const correct = isCorrectLetter(letter.letter, gameState.currentWord, gameState.currentLetterIndex);

    if (correct) {
      audioManager.playSound('correct');
      audioManager.speakLetter(letter.letter);
      const newIndex = gameState.currentLetterIndex + 1;
      const isWordComplete = newIndex >= gameState.targetLetters.length;
      if (isWordComplete) {
        audioManager.playSound('complete');
        audioManager.speakInstruction(`Congratulations! You spelled ${gameState.currentWord}!`);
      }
      setGameState(prev => ({
        ...prev,
        currentLetterIndex: newIndex,
        score: prev.score + 10,
        isComplete: isWordComplete,
        fallingLetters: prev.fallingLetters.filter(l => l.id !== letter.id)
      }));
    } else {
      audioManager.playSound('incorrect');
      audioManager.speakInstruction(`Wrong letter. Looking for ${currentLetter?.toUpperCase()}`);
      setGameState(prev => ({
        ...prev,
        fallingLetters: prev.fallingLetters.filter(l => l.id !== letter.id)
      }));
    }
  }, [gameState.currentLetterIndex, gameState.targetLetters, gameState.currentWord]);

  // Fist pop effect
  useEffect(() => {
    if (fistDetection.detected && !fistPopped) {
      const letterInZone = gameState.fallingLetters.find(l => l.inDropZone);
      if (letterInZone) {
        popLetter(letterInZone);
        setFistPopped(true);
      }
    }
    if (!fistDetection.detected && fistPopped) {
      setFistPopped(false);
    }
  }, [fistDetection.detected, gameState.fallingLetters, popLetter, fistPopped]);

  const popLetterInZone = () => {
    const letterInZone = gameState.fallingLetters.find(l => 
      checkLetterInDropZone(l, dropZone)
    );
    if (letterInZone) {
      popLetter(letterInZone);
    }
  };

  const giveHint = () => {
    const nextLetter = gameState.targetLetters[gameState.currentLetterIndex];
    if (nextLetter) {
      audioManager.speakInstruction(`The next letter is ${nextLetter.toUpperCase()}`);
    }
  };

  const resetGame = () => {
    setGameState(prev => ({
      ...prev,
      currentLetterIndex: 0,
      score: 0,
      isComplete: false,
      fallingLetters: []
    }));
  };

  const nextWord = () => {
    const newWord = getNextWord(gameState.currentWord);
    navigate(`/game/${newWord}`);
  };

  const goHome = () => {
    navigate('/');
  };

  const hasLetterInZone = gameState.fallingLetters.some(l => l.inDropZone);

  // Restore handleVoiceInput
  function handleVoiceInput(letter: string) {
    const lettersInZone = gameState.fallingLetters.filter(l => l.inDropZone);
    const targetLetter = lettersInZone.find(l => l.letter === letter);
    if (targetLetter) {
      popLetter(targetLetter);
    }
  }

  // Restore handleGestureInput
  function handleGestureInput(gesture: string) {
    if (gesture === 'point') {
      const letterInZone = gameState.fallingLetters.find(l => l.inDropZone);
      if (letterInZone) {
        popLetter(letterInZone);
      }
    }
  }

  return (
    <div 
      className={`min-h-screen game-container relative overflow-hidden ${settings.largeText ? 'text-lg' : ''}`}
    >
      <a href="#game-area" className="skip-link">
        Skip to game area
      </a>
      
      <div className="hidden sm:block">
        <AccessibilityControls
          settings={settings}
          onSettingsChange={setSettings}
          isOpen={showAccessibility}
          onToggle={() => setShowAccessibility(!showAccessibility)}
        />
      </div>

      {/* Top UI */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/20 to-transparent pb-2">
        <div className="px-2 sm:px-4 pt-2 sm:pt-4">
        <div className="flex justify-between items-center gap-3 sm:gap-0">
          {/* Left side - Game controls */}
          <div className="flex items-center space-x-2 sm:space-x-2">
            <button
              onClick={goHome}
              className="large-target bg-white bg-opacity-20 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full hover:bg-opacity-30 transition-colors focus-visible:focus flex items-center justify-center"
              aria-label="Go to home page"
              title="Home"
            >
              <Home size={18} className="sm:w-5 sm:h-5" />
            </button>
            
            <button
              onClick={resetGame}
              className="large-target bg-white bg-opacity-20 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full hover:bg-opacity-30 transition-colors focus-visible:focus flex items-center justify-center"
              aria-label="Reset current word"
              title="Reset"
            >
              <RotateCcw size={18} className="sm:w-5 sm:h-5" />
            </button>
            
            <button
              onClick={giveHint}
              className="large-target bg-white bg-opacity-20 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full hover:bg-opacity-30 transition-colors focus-visible:focus flex items-center justify-center"
              aria-label="Get hint for next letter"
              title="Hint"
            >
              <Lightbulb size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Center - Score (mobile) / Right side - Status indicators (desktop) */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Voice indicator - hidden on very small screens */}
            {settings.voiceEnabled && voiceSupported && (
              <div className={`hidden sm:flex items-center space-x-2 px-2 sm:px-3 py-1 sm:py-2 rounded-full text-xs sm:text-sm ${
                isListening ? 'bg-green-500 text-white' : 'bg-white bg-opacity-20 text-white'
              }`}>
                <Mic size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{isListening ? 'Listening...' : 'Voice Ready'}</span>
              </div>
            )}

            {/* Score */}
            <div className="bg-white bg-opacity-20 backdrop-blur-sm text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full">
              <span className={`font-bold text-sm sm:text-base ${settings.largeText ? 'text-base sm:text-lg' : ''}`}>
                Score: {gameState.score}
              </span>
            </div>
          </div>

          {/* Right side - Settings button (mobile only) */}
          <div className="sm:hidden">
            <button
              onClick={() => setShowAccessibility(!showAccessibility)}
              className="large-target bg-white bg-opacity-20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-opacity-30 transition-colors focus-visible:focus flex items-center justify-center"
              aria-label="Open accessibility controls"
              title="Settings"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>
        </div>
      </div>

      {/* Main game area */}
      <div 
        ref={gameAreaRef}
        id="game-area"
        className={`relative w-full min-h-[100svh] h-screen pt-24 sm:pt-28 pb-4 sm:pb-8 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-500`} // modern dark blue-indigo gradient, full mobile height
        role="main"
        aria-label="Game playing area"
      >
        <div className="w-full h-full flex flex-col">
          <WordDisplay 
            word={gameState.currentWord}
            currentIndex={gameState.currentLetterIndex}
            settings={settings}
          />

          <div className="flex-1 relative">
            {/* Falling letters */}
            <AnimatePresence>
              {gameState.fallingLetters.map(letter => (
                <FallingLetter
                  key={letter.id}
                  letter={letter}
                  onClick={() => popLetter(letter)}
                  settings={settings}
                />
              ))}
            </AnimatePresence>

            {/* Drop zone spanning full width */}
            <div 
              className="absolute left-0 right-0 transform -translate-y-1/2 z-10"
              style={{
                top: '50%',
              }}
            >
              <DropZone
                hasLetterInZone={hasLetterInZone}
                onPop={popLetterInZone}
                settings={settings}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Completion modal */}
      <AnimatePresence>
        {gameState.isComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl p-8 text-center max-w-md mx-4 shadow-2xl"
            >
              <div className="text-6xl mb-4">🎉</div>
              <h2 className={`font-bold text-gray-800 mb-4 ${settings.largeText ? 'text-3xl' : 'text-2xl'}`}>
                Congratulations!
              </h2>
              <p className={`text-gray-600 mb-6 ${settings.largeText ? 'text-lg' : ''}`}>
                You spelled "{gameState.currentWord}" correctly!<br />
                Score: {gameState.score} points
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={nextWord}
                  className={`
                    large-target bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full
                    transition-colors focus-visible:focus
                    ${settings.largeText ? 'px-8 py-4 text-lg' : 'px-6 py-3'}
                  `}
                  aria-label="Continue to next word"
                >
                  Next Word
                </button>
                
                <button
                  onClick={goHome}
                  className={`
                    large-target bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-full
                    transition-colors focus-visible:focus
                    ${settings.largeText ? 'px-8 py-4 text-lg' : 'px-6 py-3'}
                  `}
                  aria-label="Return to home page"
                >
                  Home
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions overlay for screen readers */}
      <div className="sr-only" aria-live="polite" role="status">
        {gameState.isComplete 
          ? `Word completed! You spelled ${gameState.currentWord} with a score of ${gameState.score} points.`
          : `Current word: ${gameState.currentWord}. Looking for letter ${gameState.targetLetters[gameState.currentLetterIndex]?.toUpperCase()}. ${gameState.fallingLetters.length} letters falling. ${hasLetterInZone ? 'Letter in drop zone, ready to pop!' : 'No letter in drop zone.'}`
        }
      </div>

      {/* Visible camera feed for fist detection (for development) */}
      <div style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 50, border: '2px solid #fff', borderRadius: 12, overflow: 'hidden', background: '#111', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', width: 200 }}>
        <CameraFeed ref={fistVideoRef} width={180} height={135} />
        <DetectionStatus detected={fistDetection.detected} confidence={fistDetection.confidence} />
      </div>
    </div>
  );
}