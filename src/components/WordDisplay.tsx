import React from 'react';
import { motion } from 'framer-motion';

interface WordDisplayProps {
  word: string;
  currentIndex: number;
  settings: {
    largeText: boolean;
    reducedMotion: boolean;
  };
}

export function WordDisplay({ word, currentIndex, settings }: WordDisplayProps) {
  return (
    <div className="text-center mb-4 sm:mb-8 px-2">
      <h2 className={`font-bold text-white mb-2 sm:mb-4 ${settings.largeText ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}>
        Find the letters to spell:
      </h2>
      
      {/* Show the complete word clearly */}
      <div className="mb-4 sm:mb-6">
        <div className={`font-bold text-yellow-300 mb-2 ${settings.largeText ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'}`}>
          Target Word: {word.toUpperCase()}
        </div>
      </div>
      
      <div className="flex justify-center space-x-1 sm:space-x-2">
        {word.split('').map((letter, index) => (
          <motion.div
            key={index}
            className={`
              w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg font-bold border-2
              ${settings.largeText ? 'w-14 h-14 sm:w-16 sm:h-16 text-xl sm:text-2xl' : 'w-10 h-10 sm:w-12 sm:h-12 text-lg sm:text-xl'}
              ${index < currentIndex
                ? 'bg-green-400 text-green-900 border-green-600'
                : index === currentIndex
                ? 'bg-yellow-400 text-yellow-900 border-yellow-600'
                : 'bg-white bg-opacity-20 text-white border-white border-opacity-40'
              }
            `}
            animate={settings.reducedMotion ? {} : {
              scale: index === currentIndex ? [1, 1.1, 1] : 1,
            }}
            transition={{
              duration: 1,
              repeat: index === currentIndex ? Infinity : 0,
            }}
          >
            {index < currentIndex ? letter.toUpperCase() : '?'}
          </motion.div>
        ))}
      </div>
      
      <div className="mt-3 sm:mt-4">
        <span className={`text-white opacity-80 text-sm sm:text-base ${settings.largeText ? 'text-base sm:text-lg' : ''}`}>
          Progress: {currentIndex} / {word.length} • Next letter: {word[currentIndex]?.toUpperCase() || 'Complete!'}
        </span>
      </div>
    </div>
  );
}