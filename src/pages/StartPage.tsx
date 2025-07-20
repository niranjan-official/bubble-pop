import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Volume2, Hand, Eye, Settings } from 'lucide-react';
import { AccessibilityControls } from '../components/AccessibilityControls';
import { AccessibilitySettings } from '../types/game';
import { getRandomWord } from '../utils/gameLogic';
import { audioManager } from '../utils/audio';

export function StartPage() {
  const navigate = useNavigate();
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    reducedMotion: false,
    largeText: false,
    voiceEnabled: true,
    gestureEnabled: false,
  });

  useEffect(() => {
    // Load saved settings
    const savedSettings = localStorage.getItem('accessibility-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    // Announce the page
    setTimeout(() => {
      audioManager.speakInstruction(
        'Welcome to the accessible letter game. Click the start button to begin, or open accessibility controls to customize your experience.'
      );
    }, 1000);
  }, []);

  useEffect(() => {
    // Apply settings to document
    document.documentElement.classList.toggle('high-contrast', settings.highContrast);
    document.documentElement.classList.toggle('reduced-motion', settings.reducedMotion);
    
    // Save settings
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
    
    // Update audio manager
    audioManager.setEnabled(settings.voiceEnabled);
  }, [settings]);

  const startGame = () => {
    const word = getRandomWord();
    const isMobile = window.innerWidth < 640;
    navigate(`/game/${word}`, { state: isMobile ? { fullscreen: true } : undefined });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      startGame();
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-[#a536ff] via-[#622cc5] to-[#7c3aed] flex items-center justify-center p-2 sm:p-4 ${settings.largeText ? 'text-lg' : ''}`}>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      <AccessibilityControls
        settings={settings}
        onSettingsChange={setSettings}
        isOpen={showAccessibility}
        onToggle={() => setShowAccessibility(!showAccessibility)}
      />

      <main id="main-content" className="text-center w-full max-w-2xl flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full"
        >
          <h1 className={`font-bold text-white mb-2 sm:mb-6 letter-shadow ${settings.largeText ? 'text-4xl sm:text-6xl' : 'text-2xl sm:text-5xl'}`}>
            🎯 Letter Pop Game
          </h1>
          
          <motion.p 
            className={`text-white text-opacity-90 mb-4 sm:mb-8 leading-relaxed ${settings.largeText ? 'text-base sm:text-xl' : 'text-sm sm:text-lg'} sm:block hidden`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            An inclusive and accessible word game designed for everyone. 
            Catch falling letters to spell words using clicks, voice commands, or gestures!
          </motion.p>

          {/* Feature cards: only show one on mobile, all on desktop */}
          <motion.div
            className="mb-4 sm:mb-8 w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 px-4">
              <FeatureCard
                icon={<Hand size={28} className="sm:w-8 sm:h-8" />}
                title="Multiple Controls"
                description="Use mouse, keyboard, voice, or gestures"
                largeText={settings.largeText}
                cardColor="#ede7f6"
                borderColor="#b39ddb"
                textColor="#2d133b"
              />
              <div className="hidden sm:block">
                <FeatureCard
                  icon={<Eye size={28} className="sm:w-8 sm:h-8" />}
                  title="Accessible Design"
                  description="High contrast, screen reader support, OpenDyslexic font"
                  largeText={settings.largeText}
                  cardColor="#ede7f6"
                  borderColor="#b39ddb"
                  textColor="#2d133b"
                />
              </div>
              <div className="hidden sm:block">
                <FeatureCard
                  icon={<Volume2 size={28} className="sm:w-8 sm:h-8" />}
                  title="Audio Feedback"
                  description="Voice instructions and sound cues"
                  largeText={settings.largeText}
                  cardColor="#ede7f6"
                  borderColor="#b39ddb"
                  textColor="#2d133b"
                />
              </div>
            </div>
          </motion.div>

          {/* Start button - always visible and prominent */}
          <motion.button
            onClick={startGame}
            onKeyDown={handleKeyDown}
            className={`
              large-target bg-[#ffe066] hover:bg-[#ffd600] text-[#2d133b] 
              font-bold rounded-full transition-all duration-200
              focus-visible:focus flex items-center justify-center mx-auto
              w-full max-w-xs sm:max-w-md
              ${settings.largeText ? 'px-10 py-5 text-xl sm:px-12 sm:py-6 sm:text-2xl' : 'px-8 py-4 text-lg sm:px-10 sm:py-4 sm:text-xl'}
            `}
            whileHover={settings.reducedMotion ? {} : { scale: 1.05 }}
            whileTap={settings.reducedMotion ? {} : { scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, duration: 0.4 }}
            aria-label="Start the letter pop game"
            style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}
          >
            <Play size={settings.largeText ? 28 : 22} className="mr-2 sm:mr-3" />
            Start Game
          </motion.button>
          {/* Minimal instructions on mobile */}
          <motion.div
            className="mt-2 sm:mt-8 text-white text-opacity-70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            <p className={`${settings.largeText ? 'text-base sm:text-lg' : 'text-xs sm:text-base'} sm:block`}>Press Enter or Space to start • <span className="hidden sm:inline">Click the settings icon for accessibility options</span></p>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  largeText: boolean;
  cardColor: string;
  borderColor: string;
  textColor: string;
}

function FeatureCard({ icon, title, description, largeText, cardColor, borderColor, textColor }: FeatureCardProps) {
  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 text-white">
      <div className="text-yellow-400 mb-4 flex justify-center">
        {icon}
      </div>
      <h3 className={`font-bold mb-2 ${largeText ? 'text-xl' : 'text-lg'}`}>
        {title}
      </h3>
      <p className={`text-white text-opacity-80 ${largeText ? 'text-base' : 'text-sm'}`}>
        {description}
      </p>
    </div>
  );
}