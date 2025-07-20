import React from 'react';
import { motion } from 'framer-motion';
import { FallingLetter as FallingLetterType } from '../types/game';

interface FallingLetterProps {
  letter: FallingLetterType;
  onClick: () => void;
  settings: {
    reducedMotion: boolean;
    largeText: boolean;
  };
}

export function FallingLetter({ letter, onClick, settings }: FallingLetterProps) {
  return (
    <motion.div
      key={letter.id}
      className={`
        falling-letter absolute cursor-pointer large-target z-20
        ${settings.largeText ? 'text-4xl' : 'text-3xl'}
      `}
      style={{
        left: letter.x,
        top: letter.y,
      }}
      onClick={onClick}
      whileHover={settings.reducedMotion ? {} : { scale: 1.1 }}
      whileTap={settings.reducedMotion ? {} : { scale: 0.95 }}
      role="button"
      tabIndex={0}
      aria-label={`Letter ${letter.letter}${letter.inDropZone ? ' - in drop zone' : ''}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div
        className={`
          w-16 h-16 flex items-center justify-center rounded-full font-bold
          transition-all duration-200 focus-visible:focus relative
          ${letter.isCorrect 
            ? 'bg-[#ffe066] text-[#2d133b]' 
            : 'bg-[#b39ddb] text-[#1e044d]'
          }
          ${letter.inDropZone 
            ? 'shadow-lg transform scale-110' 
            : 'shadow-md'
          }
        `}
        style={{
          boxShadow: letter.inDropZone 
            ? '0 10px 25px rgba(124,58,237,0.18), 0 0 0 4px #ffe066' 
            : '0 8px 20px rgba(124,58,237,0.12), inset 0 2px 4px #b39ddb'
        }}
      >
        <div 
          className="absolute top-1 left-1 w-4 h-4 rounded-full opacity-30"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.1) 100%)'
          }}
        />
        
        <span className="relative z-10 text-2xl font-bold">
          {letter.letter}
        </span>
        
        <div 
          className="absolute top-2 left-2 w-2 h-2 rounded-full opacity-50"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 100%)'
          }}
        />
      </div>
    </motion.div>
  );
}