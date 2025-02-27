'use client';

import { useState, useRef } from 'react';
import Quiz from './components/Quiz';
import LoadingFacts from './components/LoadingFacts';

interface Answer {
  points: number;
  player: string;
  team: string;
  year: string;
}

interface QuizData {
  answers: Answer[];
  timeLimit: number;
  title: string;
  description: string;
}

// Quiz prompts by difficulty level
const QUIZ_PROMPTS = {
  1: [
    "Every NBA MVP since 2010",
    "NBA champions from the last 10 years",
    "Players who scored 50+ points in a game last season",
    "Current NBA players with multiple All-Star appearances",
    "NBA Rookie of the Year winners since 2015"
  ],
  2: [
    "Every NBA Finals MVP since 2000",
    "Players who averaged 25+ points per game last season",
    "NBA Defensive Player of the Year winners since 2010",
    "Players with multiple scoring titles since 2000",
    "NBA champions from 2000-2010"
  ],
  3: [
    "Every NBA MVP since 1990",
    "Players with 60+ point games since 2000",
    "Every NBA scoring champion since 2000",
    "Players with multiple triple-doubles in a playoff series",
    "NBA Sixth Man of the Year winners since 2000"
  ],
  4: [
    "Every NBA scoring champion since 1990",
    "Players with 70+ point games in NBA history",
    "NBA players with 20+ rebounds in a game since 2015",
    "Players who have led the league in assists",
    "NBA Defensive Player of the Year winners since 1990"
  ],
  5: [
    "Top 5 leaders in Points per game each year since 2000",
    "Every player to average a triple-double for a season",
    "Players with 5+ steals in a playoff game",
    "Every player with 10+ three-pointers in a game",
    "Players who have led the league in blocks for multiple seasons"
  ]
};

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [prompt, setPrompt] = useState('');
  const [timerMinutes, setTimerMinutes] = useState(20);
  const [loadingStartTime, setLoadingStartTime] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [difficultyLevel, setDifficultyLevel] = useState<number>(3);

  // Expected duration based on prompt complexity
  const getExpectedDuration = (promptText: string): number => {
    // Yearly leaders queries take longer
    if (/leaders?.*(each|every|per|since|from|by)\s+year/i.test(promptText)) {
      return 30000; // 30 seconds
    }
    return 20000; // 20 seconds for regular queries
  };

  const startQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setQuiz(null);
    setScore(null);
    setError(null);
    
    // Record start time for the loading component
    const startTime = Date.now();
    setLoadingStartTime(startTime);

    try {
      // Calculate max questions based on the prompt
      const maxQuestions = /leaders?.*(each|every|per|since|from|by)\s+year/i.test(prompt) ? 130 : 100;

      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          topic: prompt,
          timeLimit: timerMinutes * 60, // Convert to seconds
          maxQuestions
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate quiz');
      }

      const data = await response.json();
      
      // Ensure data has the expected structure
      if (!data.answers || !Array.isArray(data.answers)) {
        throw new Error('Invalid quiz data format');
      }
      
      setQuiz(data);
    } catch (error: any) {
      console.error('Error generating quiz:', error);
      setError(error.message || 'Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuizComplete = (finalScore: number) => {
    setScore(finalScore);
  };

  // Generate a random prompt based on difficulty level
  const generateRandomPrompt = () => {
    const prompts = QUIZ_PROMPTS[difficultyLevel as keyof typeof QUIZ_PROMPTS] || QUIZ_PROMPTS[3];
    const randomIndex = Math.floor(Math.random() * prompts.length);
    setPrompt(prompts[randomIndex]);
  };

  return (
    <main className="min-h-screen bg-orange-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {!quiz && !loading ? (
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 text-center mb-8">SickoHoops</h1>
            
            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            
            <form onSubmit={startQuiz} className="space-y-6">
              {/* Main prompt input */}
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="What kind of NBA quiz would you like? (e.g., 'Every player to score 2000+ points in a season since 2000', 'All NBA Finals MVPs', 'Players with multiple scoring titles')"
                  className="w-full h-32 p-4 pr-20 text-gray-900 border rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                  required
                />
                <button
                  type="submit"
                  disabled={loading || !prompt.trim()}
                  className="absolute bottom-4 right-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-orange-300 transition-colors"
                >
                  {loading ? 'Generating...' : 'Generate'}
                </button>
              </div>

              {/* Difficulty level and timer settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Difficulty level selector */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <label className="block text-gray-700 font-medium mb-2">Sicko Level:</label>
                  <div className="flex items-center">
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={difficultyLevel}
                      onChange={(e) => setDifficultyLevel(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="ml-3 text-lg font-bold text-orange-500">{difficultyLevel}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Casual</span>
                    <span>Sicko</span>
                  </div>
                </div>

                {/* Timer setting */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <label className="block text-gray-700 font-medium mb-2">Quiz Timer:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={timerMinutes}
                      onChange={(e) => setTimerMinutes(Math.max(1, Math.min(60, parseInt(e.target.value) || 1)))}
                      className="w-20 px-3 py-2 border rounded-md text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                    <span className="text-gray-700">minutes</span>
                  </div>
                </div>
              </div>

              {/* Random prompt generator */}
              <div className="mt-6">
                <p className="text-center text-gray-700 mb-3">Don't have a quiz in mind? Get a suggestion below:</p>
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={generateRandomPrompt}
                    className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                    Random Quiz (Level {difficultyLevel})
                  </button>
                </div>
              </div>
            </form>
          </div>
        ) : loading ? (
          <LoadingFacts 
            startTime={loadingStartTime} 
            expectedDuration={getExpectedDuration(prompt)} 
          />
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-2 text-gray-900">{quiz?.title}</h1>
              <p className="text-gray-700">{quiz?.description}</p>
            </div>
            
            {quiz && (
              <Quiz 
                answers={quiz.answers}
                timeLimit={quiz.timeLimit}
                onComplete={handleQuizComplete}
              />
            )}

            {score !== null && quiz && (
              <div className="text-center p-4 bg-white rounded-lg shadow border border-orange-200">
                <h2 className="text-2xl font-semibold text-gray-900">Quiz Complete!</h2>
                <p className="text-lg text-gray-700">
                  Final Score: {score} out of {quiz.answers.length} ({Math.round((score / quiz.answers.length) * 100)}%)
                </p>
                <div className="mt-4">
                  <button
                    onClick={() => {
                      setQuiz(null);
                      setScore(null);
                    }}
                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    New Quiz
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
