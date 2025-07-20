import React from 'react';
import { motion } from 'framer-motion';
import { Target } from 'lucide-react';

interface DropZoneProps {
  hasLetterInZone: boolean;
  onPop: () => void;
  settings: {
    reducedMotion: boolean;
    largeText: boolean;
  };
}

export function DropZone({ hasLetterInZone, onPop, settings }: DropZoneProps) {
  return (
    <div className="flex flex-col-reverse items-center space-y-4 px-4 gap-5">
      <motion.div
        className={`
          relative w-full h-72 rounded-2xl border-4
          flex items-center justify-center transition-all duration-300
          ${hasLetterInZone 
            ? 'border-yellow-400 bg-yellow-100 shadow-lg' 
            : 'border-white border-opacity-60 bg-white bg-opacity-20  border-dashed'
          }
        `}
        animate={settings.reducedMotion ? {} : {
          scale: hasLetterInZone ? [1, 1.05, 1] : 1,
        }}
        transition={{
          duration: 0.6,
          repeat: hasLetterInZone ? Infinity : 0,
        }}
      >
        <Target 
          size={64} 
          className={`
            transition-colors duration-300
            ${hasLetterInZone ? 'text-yellow-600' : 'text-white text-opacity-60'}
          `} 
        />
        
        {hasLetterInZone && (
          <motion.div
            className="absolute inset-0 rounded-2xl border-4 border-yellow-400"
            animate={settings.reducedMotion ? {} : {
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
            }}
          />
        )}
      </motion.div>

      <motion.button
        onClick={onPop}
        disabled={!hasLetterInZone}
        className={`
          large-target px-12 py-6 rounded-full font-bold text-2xl
          transition-all duration-200 focus-visible:focus min-h-20
          ${settings.largeText ? 'text-3xl px-16 py-8 min-h-24' : ''}
          ${hasLetterInZone
            ? 'bg-yellow-400 text-yellow-900 hover:bg-yellow-300 shadow-lg transform hover:scale-105'
            : 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50'
          }
        `}
        whileTap={settings.reducedMotion ? {} : { scale: 0.95 }}
        aria-label={hasLetterInZone ? 'Pop the letter in the drop zone' : 'No letter in drop zone'}
        title={hasLetterInZone ? 'Click to pop the letter!' : 'Wait for a letter to enter the zone'}
      >
        {hasLetterInZone ? '🎯 POP!' : 'Wait...'}
      </motion.button>
    </div>
  );
}