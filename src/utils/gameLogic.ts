import { GameState, FallingLetter } from '../types/game';

export const WORD_LIST = [
  'apple', 'mango', 'banana', 'orange', 'grape', 'lemon',
  'cherry', 'peach', 'berry', 'melon', 'kiwi', 'plum'
];

export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function getRandomWord(): string {
  return WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
}

export function createFallingLetter(
  gameWidth: number,
  currentWord: string,
  existingLetters: FallingLetter[],
  currentLetterIndex: number
): FallingLetter {
  const targetLetter = currentWord[currentLetterIndex]?.toUpperCase();
  const wordLetters = currentWord.toUpperCase().split('');
  
  // 60% chance for correct letter, 40% for random letter from word or alphabet
  let letter: string;
  if (Math.random() < 0.6 && targetLetter) {
    letter = targetLetter;
  } else {
    // Mix of word letters and random alphabet letters
    const otherLetters = [...wordLetters, ...ALPHABET.slice(0, 10)];
    letter = otherLetters[Math.floor(Math.random() * otherLetters.length)];
  }
  
  return {
    id: `letter-${Date.now()}-${Math.random()}`,
    letter,
    x: Math.random() * (gameWidth - 80) + 40,
    y: -60,
    speed: Math.random() * 1 + 0.8, // Slower speed: 0.8-1.8 instead of 1.5-3.5
    isCorrect: wordLetters.includes(letter),
    inDropZone: false
  };
}

export function updateFallingLetters(
  letters: FallingLetter[],
  gameHeight: number,
  dropZone: { x: number; y: number; width: number; height: number }
): FallingLetter[] {
  return letters
    .map(letter => {
      const newY = letter.y + letter.speed;
      const letterWidth = 64;
      const letterHeight = 64;
      
      // Corrected overlap logic with buffer zone for better UX
      const bufferZone = 0; // 20px buffer above and below the drop zone
      const inDropZone = 
        letter.x < dropZone.x + dropZone.width &&    // Letter right > Zone left
        letter.x + letterWidth > dropZone.x &&       // Letter left < Zone right
        newY < dropZone.y + dropZone.height + bufferZone &&     // Letter top < Zone bottom + buffer
        newY + letterHeight > dropZone.y - bufferZone;          // Letter bottom > Zone top - buffer

      return {
        ...letter,
        y: newY,
        inDropZone
      };
    })
    .filter(letter => letter.y < gameHeight + 60);
}

export function checkLetterInDropZone(
  letter: FallingLetter,
  dropZone: { x: number; y: number; width: number; height: number }
): boolean {
  const letterWidth = 64;
  const letterHeight = 64;
  
  // Corrected overlap logic with buffer zone for better UX
  const bufferZone = 20; // 20px buffer above and below the drop zone
  return (
    letter.x < dropZone.x + dropZone.width &&    // Letter right > Zone left
    letter.x + letterWidth > dropZone.x &&       // Letter left < Zone right
    letter.y < dropZone.y + dropZone.height + bufferZone &&     // Letter top < Zone bottom + buffer
    letter.y + letterHeight > dropZone.y - bufferZone          // Letter bottom > Zone top - buffer
  );
}

export function isCorrectLetter(
  letter: string,
  currentWord: string,
  currentIndex: number
): boolean {
  return letter.toLowerCase() === currentWord[currentIndex]?.toLowerCase();
}

export function getNextWord(currentWord: string): string {
  const availableWords = WORD_LIST.filter(word => word !== currentWord);
  return availableWords[Math.floor(Math.random() * availableWords.length)];
}