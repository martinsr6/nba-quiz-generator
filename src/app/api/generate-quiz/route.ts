import { NextResponse } from 'next/server';
import OpenAI from 'openai';

interface QuizQuestion {
  points: number;
  player: string;
  team: string;
  year: string;
}

interface QuizData {
  title: string;
  description: string;
  questions: QuizQuestion[];
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Temporarily skip validation until we implement proper NBA data integration
async function validateNBAData(questions: QuizQuestion[]) {
  // For now, just return the questions as is
  return questions;
}

// Remove edge runtime for now as it might conflict with OpenAI client
// export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { topic, timeLimit } = await req.json();

    // 1. Generate quiz using OpenAI
    const prompt = `Create an NBA quiz about: ${topic}
    Return it in this JSON format:
    {
      "title": "Quiz title",
      "description": "Quiz description",
      "questions": [
        {
          "points": number,
          "player": "Player full name",
          "team": "YYYY-TTT format (year-team)",
          "year": "YYYY"
        }
      ]
    }
    
    Rules:
    - All data must be factually accurate
    - Use official team abbreviations (LAL, BOS, etc.)
    - Years should be the season end year
    - Include at least 5-10 questions
    - All stats and facts must be verifiable
    - For points, use relevant statistics (points scored, rebounds, etc.)`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an NBA statistics expert who creates accurate quizzes based on historical NBA data."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const quizData = JSON.parse(completion.choices[0].message.content || '{}') as QuizData;

    // 2. For now, skip validation but keep the structure
    const answers = quizData.questions.map((q: QuizQuestion) => ({
      points: q.points,
      player: q.player,
      team: q.team,
      year: q.year
    }));

    // 3. Return the quiz
    return NextResponse.json({
      answers,
      timeLimit: timeLimit || 1200,
      title: quizData.title,
      description: quizData.description
    });

  } catch (error) {
    console.error('Quiz generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate quiz' },
      { status: 500 }
    );
  }
} 