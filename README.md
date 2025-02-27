# NBA Quiz Generator

An interactive web application that generates NBA-themed quizzes using AI. Test your NBA knowledge with Sporcle-style quizzes about various NBA topics, players, and statistics.

## Features

- AI-powered quiz generation using OpenAI's GPT-4
- Dynamic scoring system
- Customizable quiz timer
- Real-time answer validation
- Mobile-responsive design
- Beautiful UI with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ installed
- An OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/martinsr6/nba-quiz-generator.git
cd nba-quiz-generator
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory and add your OpenAI API key:
```
OPENAI_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3002](http://localhost:3002) in your browser.

## Usage

1. Enter an NBA-related topic or choose from the example prompts
2. Set your desired quiz duration
3. Click "Generate" to create your quiz
4. Type player names to answer the questions
5. Try to get the highest score before time runs out!

## Built With

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- OpenAI GPT-4

## Security Note

Never commit your `.env.local` file or share your API keys. The `.env.local` file is listed in `.gitignore` to prevent accidental commits.