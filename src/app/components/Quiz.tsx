'use client';

import { useState, useEffect } from 'react';

interface Answer {
  points: number;
  player: string;
  team: string;
  year: string;
}

interface QuizProps {
  answers: Answer[];
  timeLimit: number;
  onComplete: (score: number) => void;
}

export default function Quiz({ answers = [], timeLimit = 1200, onComplete }: QuizProps) {
  const [input, setInput] = useState('');
  const [foundAnswers, setFoundAnswers] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isComplete, setIsComplete] = useState(false);

  // Sort answers by year in descending order
  const sortedAnswers = [...answers].sort((a, b) => {
    // Handle cases where year might be missing or not a valid number
    const yearA = a.year ? parseInt(a.year) : 0;
    const yearB = b.year ? parseInt(b.year) : 0;
    return yearB - yearA;
  });

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !isComplete) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isComplete) {
      handleComplete();
    }
  }, [timeLeft, isComplete]);

  // Helper function to normalize text for comparison
  const normalizeText = (text: string | undefined | null): string => {
    if (!text) return '';
    
    return text
      .toLowerCase()
      .normalize('NFKD') // Normalize special characters
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .trim();
  };

  // Check input against answers
  const checkAnswer = (value: string) => {
    if (!value.trim()) return;
    
    const normalizedInput = normalizeText(value);
    let foundNew = false;
    let foundIndices = new Set<number>();
    
    // First pass: find all matching answers
    sortedAnswers.forEach((answer, index) => {
      if (foundAnswers.has(index)) return;
      if (!answer.player) return; // Skip if player name is missing

      try {
        const fullName = answer.player;
        const nameParts = fullName.split(' ').filter(part => part.trim().length > 0);
        const firstName = nameParts.length > 0 ? nameParts[0] : '';
        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
        
        // Check for full name match, last name match, or first name match if unique
        if (
          normalizeText(fullName) === normalizedInput || 
          (lastName && normalizeText(lastName) === normalizedInput) ||
          (firstName && normalizeText(firstName) === normalizedInput && isUniqueFirstName(firstName, index))
        ) {
          foundIndices.add(index);
          foundNew = true;
        }
      } catch (error) {
        console.error("Error checking answer:", error, answer);
      }
    });

    // If we found any matches, add them all
    if (foundNew) {
      const newFoundAnswers = new Set(foundAnswers);
      foundIndices.forEach(index => newFoundAnswers.add(index));
      setFoundAnswers(newFoundAnswers);
      setInput('');

      // Check if all answers are found
      if (newFoundAnswers.size === sortedAnswers.length) {
        handleComplete();
      }
    }
  };

  // Check if a first name is unique among all answers
  const isUniqueFirstName = (firstName: string, currentIndex: number): boolean => {
    if (!firstName) return false;
    
    const normalizedFirstName = normalizeText(firstName);
    let count = 0;
    
    for (let i = 0; i < sortedAnswers.length; i++) {
      if (i === currentIndex) continue;
      if (!sortedAnswers[i].player) continue;
      
      try {
        const otherNameParts = sortedAnswers[i].player.split(' ').filter(part => part.trim().length > 0);
        const otherFirstName = otherNameParts.length > 0 ? otherNameParts[0] : '';
        
        if (normalizeText(otherFirstName) === normalizedFirstName) {
          count++;
        }
      } catch (error) {
        console.error("Error in isUniqueFirstName:", error, sortedAnswers[i]);
      }
    }
    
    return count === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      checkAnswer(input);
    }
  };

  const handleComplete = () => {
    setIsComplete(true);
    onComplete(foundAnswers.size);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Format team abbreviation properly
  const formatTeam = (team: string | undefined): string => {
    if (!team) return '';
    
    // Handle cases where team might be N/A
    if (team.includes('-N/A') || team.includes('-undefined')) {
      // Extract just the year part
      const parts = team.split('-');
      const year = parts[0];
      return year ? `${year}-NBA` : '';
    }
    
    return team;
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header with score and timer */}
      <div className="flex justify-between items-center mb-6 text-xl font-bold text-gray-900">
        <div>
          Score: {foundAnswers.size}/{sortedAnswers.length}
        </div>
        <div className={timeLeft < 30 ? 'text-red-600' : 'text-gray-900'}>
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Answer input */}
      {!isComplete && (
        <div className="mb-8">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
            placeholder="Type a player name or surname..."
            autoFocus
          />
        </div>
      )}

      {/* Grid of answers */}
      <div className="grid grid-cols-3 gap-4">
        {sortedAnswers.map((answer, index) => (
          <div
            key={index}
            className={`border rounded-lg p-3 ${
              foundAnswers.has(index) ? 'bg-orange-100 border-orange-300' : 'bg-white'
            }`}
          >
            <div className="grid grid-cols-4 gap-2 text-sm">
              {answer.points > 0 && (
                <div className="font-bold text-gray-900">{answer.points.toFixed(1)}</div>
              )}
              <div className={`${answer.points > 0 ? 'col-span-2' : 'col-span-3'} text-gray-900`}>
                {foundAnswers.has(index) || isComplete ? answer.player : ''}
              </div>
              <div className="text-right text-gray-900">
                {formatTeam(answer.team)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Give up button */}
      {!isComplete && (
        <button
          onClick={handleComplete}
          className="mt-6 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          Give Up
        </button>
      )}
    </div>
  );
} 