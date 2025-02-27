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
    "NBA champions from the last 5 years",
    "NBA MVP winners since 2015",
    "NBA Finals MVPs since 2015",
    "NBA teams in the Eastern Conference",
    "NBA teams in the Western Conference"
  ],
  2: [
    "NBA champions from the last 10 years",
    "NBA MVP winners since 2010",
    "Players who scored 50+ points in a game last season",
    "Current NBA All-Stars",
    "NBA Rookie of the Year winners since 2010"
  ],
  3: [
    "NBA champions since 2000",
    "NBA MVPs since 2000",
    "Players who averaged 25+ points per game last season",
    "NBA Defensive Player of the Year winners since 2000",
    "Players with multiple scoring titles since 2000"
  ],
  4: [
    "NBA champions since 1990",
    "NBA MVPs since 1980",
    "Players with 60+ point games since 2000",
    "Every NBA scoring champion since 1990",
    "Players with multiple triple-doubles in a playoff series"
  ],
  5: [
    "Every player to average a triple-double for a season",
    "Players with 70+ point games in NBA history",
    "Every player with 10+ three-pointers in a game",
    "Players who have led the league in blocks for multiple seasons",
    "Players with 20+ rebounds in a playoff game since 1990"
  ]
};

// Level names for the difficulty selector
const LEVEL_NAMES = {
  1: "Centel'd",
  2: "Casual",
  3: "National TV host",
  4: "Hoops enjoyer",
  5: "Sicko"
};

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loadingStartTime, setLoadingStartTime] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [difficultyLevel, setDifficultyLevel] = useState<number>(3);

  // Calculate timer based on number of answers
  const calculateTimerMinutes = (numAnswers: number): number => {
    // Rule of thumb: max(2, numAnswers/10) minutes, always round up for decimals
    const minutesFromAnswers = Math.ceil(numAnswers / 10);
    return Math.max(2, minutesFromAnswers);
  };

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
          maxQuestions
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to generate quiz');
      }

      const data = await response.json();
      
      // Ensure data has the expected structure
      if (!data.answers || !Array.isArray(data.answers)) {
        throw new Error('Invalid quiz data format');
      }
      
      // If we got an empty quiz, show a helpful message
      if (data.answers.length === 0) {
        setError(`We couldn't generate a quiz about "${prompt}". Please try a different topic or be more specific.`);
        setLoading(false);
        return;
      }
      
      // Calculate timer based on number of answers
      const timerMinutes = calculateTimerMinutes(data.answers.length);
      data.timeLimit = timerMinutes * 60; // Convert to seconds
      
      setQuiz(data);
    } catch (error: any) {
      console.error('Error generating quiz:', error);
      setError(error.message || 'Failed to generate quiz. Please try a different topic or be more specific.');
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
            <h1 className="text-4xl font-bold text-gray-900 text-center mb-2">SickoHoops</h1>
            <p className="text-center text-gray-700 mb-8">Create, play, and challenge your friends with custom NBA quizzes</p>
            
            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
                <p className="font-medium mb-2">Error:</p>
                <p>{error}</p>
                <p className="mt-2 text-sm">
                  Suggestions:
                  <ul className="list-disc pl-5 mt-1">
                    <li>Try a more specific topic (e.g., "NBA scoring leaders since 2010" instead of just "scoring leaders")</li>
                    <li>Check for typos in your query</li>
                    <li>Try a different topic altogether</li>
                    <li>Use the random quiz generator below</li>
                  </ul>
                </p>
              </div>
            )}
            
            <form onSubmit={startQuiz} className="space-y-6">
              {/* Main prompt input with integrated timer */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="relative mb-4">
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
                    {loading ? 'Generating...' : 'Play'}
                  </button>
                </div>
              </div>

              {/* Random prompt generator section */}
              <div className="mt-6">
                <p className="text-center text-gray-700 mb-4">Don't have an idea? Generate one below:</p>
                
                {/* Difficulty level selector */}
                <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                  <div className="flex items-center mb-2">
                    <span className="text-gray-700 font-medium">Sicko Level:</span>
                  </div>
                  <div className="w-full">
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={difficultyLevel}
                      onChange={(e) => setDifficultyLevel(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Centel'd</span>
                    <span>Casual</span>
                    <span>National TV host</span>
                    <span>Hoops enjoyer</span>
                    <span>Sicko</span>
                  </div>
                </div>
                
                {/* Random quiz button */}
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={generateRandomPrompt}
                    className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                    Random Quiz ({LEVEL_NAMES[difficultyLevel as keyof typeof LEVEL_NAMES]})
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
                quiz_title={quiz.title}
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
