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

export default function Quiz({ answers, timeLimit, onComplete }: QuizProps) {
  const [input, setInput] = useState('');
  const [foundAnswers, setFoundAnswers] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isComplete, setIsComplete] = useState(false);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !isComplete) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isComplete) {
      handleComplete();
    }
  }, [timeLeft, isComplete]);

  // Check input against answers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().trim();
    setInput(value);

    // Check if input matches any player name
    answers.forEach((answer, index) => {
      if (answer.player.toLowerCase() === value && !foundAnswers.has(index)) {
        const newFoundAnswers = new Set(foundAnswers);
        newFoundAnswers.add(index);
        setFoundAnswers(newFoundAnswers);
        setInput('');

        // Check if all answers are found
        if (newFoundAnswers.size === answers.length) {
          handleComplete();
        }
      }
    });
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

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header with score and timer */}
      <div className="flex justify-between items-center mb-6 text-xl font-bold text-gray-900">
        <div>
          Score: {foundAnswers.size}/{answers.length}
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
            className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
            placeholder="Type a player name..."
            autoFocus
          />
        </div>
      )}

      {/* Grid of answers */}
      <div className="grid grid-cols-3 gap-4">
        {answers.map((answer, index) => (
          <div
            key={index}
            className={`border rounded-lg p-3 ${
              foundAnswers.has(index) ? 'bg-orange-100 border-orange-300' : 'bg-white'
            }`}
          >
            <div className="grid grid-cols-4 gap-2 text-sm">
              <div className="font-bold text-gray-900">{answer.points}</div>
              <div className="col-span-2 text-gray-900">
                {foundAnswers.has(index) || isComplete ? answer.player : '________'}
              </div>
              <div className="text-right text-gray-900">{answer.team}</div>
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