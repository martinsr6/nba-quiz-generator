'use client';

import { useState } from 'react';
import Quiz from './components/Quiz';

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

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [prompt, setPrompt] = useState('');
  const [timerMinutes, setTimerMinutes] = useState(20);

  const startQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setQuiz(null);
    setScore(null);

    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          topic: prompt,
          timeLimit: timerMinutes * 60 // Convert to seconds
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate quiz');
      }

      const data = await response.json();
      setQuiz(data);
    } catch (error) {
      console.error('Error generating quiz:', error);
      alert('Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuizComplete = (finalScore: number) => {
    setScore(finalScore);
  };

  return (
    <main className="min-h-screen bg-orange-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {!quiz ? (
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 text-center mb-8">NBA Quiz Generator</h1>
            
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

              {/* Timer setting */}
              <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-gray-200">
                <label className="text-gray-700 font-medium">Quiz Timer:</label>
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

              {/* Examples and suggestions */}
              <div className="mt-8 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Example prompts:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "Every NBA MVP since 1990",
                    "Players with 70+ point games",
                    "All NBA champions since 2000",
                    "Players with multiple triple-double seasons"
                  ].map((example, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPrompt(example)}
                      className="text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors text-gray-700"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-2 text-gray-900">{quiz.title}</h1>
              <p className="text-gray-700">{quiz.description}</p>
            </div>
            
            <Quiz 
              answers={quiz.answers}
              timeLimit={quiz.timeLimit}
              onComplete={handleQuizComplete}
            />

            {score !== null && (
              <div className="text-center p-4 bg-white rounded-lg shadow border border-orange-200">
                <h2 className="text-2xl font-semibold text-gray-900">Quiz Complete!</h2>
                <p className="text-lg text-gray-700">
                  Final Score: {score} out of {quiz.answers.length} ({Math.round((score / quiz.answers.length) * 100)}%)
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
