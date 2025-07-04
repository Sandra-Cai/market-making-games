import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Target, CheckCircle, XCircle, Clock } from 'lucide-react';
import { ProbabilityProblem, GameStats } from '../../types/game';

interface ProbabilityGameProps {
  onStatsUpdate: (stats: Partial<GameStats>) => void;
}

const ProbabilityGame: React.FC<ProbabilityGameProps> = ({ onStatsUpdate }) => {
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'finished'>('waiting');
  const [currentProblem, setCurrentProblem] = useState<ProbabilityProblem | null>(null);
  const [score, setScore] = useState(0);
  const [problemsAnswered, setProblemsAnswered] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const problems: ProbabilityProblem[] = [
    {
      question: 'What is the probability of rolling a 6 on a fair six-sided die?',
      options: ['1/6', '1/3', '1/2', '5/6'],
      correctAnswer: 0,
      explanation:
        'A fair die has 6 sides, so the probability of rolling any specific number is 1/6.',
      difficulty: 'easy',
      category: 'basic',
      timeLimit: 30,
    },
    {
      question: 'If you flip a coin 3 times, what is the probability of getting exactly 2 heads?',
      options: ['1/8', '3/8', '1/2', '5/8'],
      correctAnswer: 1,
      explanation:
        'There are 3 ways to get exactly 2 heads: HHT, HTH, THH. Total outcomes = 2³ = 8. So probability = 3/8.',
      difficulty: 'medium',
      category: 'basic',
      timeLimit: 30,
    },
    {
      question:
        'In a deck of 52 cards, what is the probability of drawing a face card (Jack, Queen, King)?',
      options: ['3/13', '1/4', '1/13', '12/52'],
      correctAnswer: 0,
      explanation:
        'There are 12 face cards (4 each of Jack, Queen, King) out of 52 cards. 12/52 = 3/13.',
      difficulty: 'easy',
      category: 'basic',
      timeLimit: 30,
    },
    {
      question: 'What is the probability of getting a sum of 7 when rolling two dice?',
      options: ['1/6', '1/12', '1/36', '6/36'],
      correctAnswer: 0,
      explanation:
        'There are 6 ways to get a sum of 7: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1). Total outcomes = 36. So 6/36 = 1/6.',
      difficulty: 'medium',
      category: 'basic',
      timeLimit: 30,
    },
    {
      question: 'If P(A) = 0.3 and P(B) = 0.4, and A and B are independent, what is P(A and B)?',
      options: ['0.12', '0.7', '0.1', '0.3'],
      correctAnswer: 0,
      explanation: 'For independent events, P(A and B) = P(A) × P(B) = 0.3 × 0.4 = 0.12.',
      difficulty: 'hard',
      category: 'basic',
      timeLimit: 30,
    },
  ];

  const getRandomProblem = () => {
    const randomIndex = Math.floor(Math.random() * problems.length);
    return problems[randomIndex];
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null) return; // Prevent multiple selections

    setSelectedAnswer(answerIndex);
    setShowResult(true);

    const isCorrect = answerIndex === currentProblem?.correctAnswer;
    if (isCorrect) {
      setScore((prev) => prev + 100);
    }

    setTimeout(() => {
      setSelectedAnswer(null);
      setShowResult(false);
      setProblemsAnswered((prev) => prev + 1);

      if (problemsAnswered + 1 >= 5) {
        endGame();
      } else {
        setCurrentProblem(getRandomProblem());
      }
    }, 2000);
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setProblemsAnswered(0);
    setTimeLeft(30);
    setCurrentProblem(getRandomProblem());
  };

  const endGame = useCallback(() => {
    setGameState('finished');
    onStatsUpdate({
      totalScore: score,
      gamesPlayed: 1,
    });
  }, [score, onStatsUpdate]);

  useEffect(() => {
    if (gameState === 'playing') {
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [gameState, endGame]);

  if (gameState === 'waiting') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center text-center py-20 max-w-2xl mx-auto bg-white"
      >
        <Target className="w-16 h-16 text-[#b01c2e] mx-auto mb-8" />
        <h2 className="text-5xl font-extrabold mb-8 tracking-tight font-serif text-[#b01c2e]">Probability Challenges</h2>
        <p className="text-2xl text-gray-700 mb-12 max-w-xl mx-auto font-light font-sans">
          Test your understanding of probability and risk. Solve probability problems under time
          pressure to develop your quantitative intuition.
        </p>
        <button onClick={startGame} className="px-8 py-2 rounded bg-white border border-[#b01c2e] text-[#b01c2e] font-bold text-lg hover:bg-[#b01c2e] hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-[#b01c2e]">
          Start Challenge
        </button>
      </motion.div>
    );
  }

  if (gameState === 'finished') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center text-center py-20 max-w-2xl mx-auto bg-white"
      >
        <CheckCircle className="w-16 h-16 text-[#b01c2e] mx-auto mb-8" />
        <h2 className="text-5xl font-extrabold mb-8 tracking-tight font-serif text-[#b01c2e]">Challenge Complete!</h2>
        <div className="text-6xl font-bold text-[#b01c2e] mb-8 font-serif">{score}</div>
        <p className="text-2xl text-gray-700 mb-12 font-light font-sans">Final Score</p>
        <button onClick={startGame} className="px-8 py-2 rounded bg-white border border-[#b01c2e] text-[#b01c2e] font-bold text-lg hover:bg-[#b01c2e] hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-[#b01c2e]">
          Try Again
        </button>
      </motion.div>
    );
  }

  if (!currentProblem) return null;

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Probability Challenge</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[#b01c2e]" />
            <span className="text-xl font-bold">{score}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#b01c2e]" />
            <span className="text-xl font-bold">{timeLeft}s</span>
          </div>
        </div>
      </div>
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${(problemsAnswered / 5) * 100}%` }}
        ></div>
      </div>
      <p className="text-gray-400 mt-2">Problem {problemsAnswered + 1} of 5</p>

      {/* Problem */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="font-bold">{String.fromCharCode(65 + problemsAnswered)}.</span>
          <span className="text-xl font-bold">{currentProblem.question}</span>
        </div>

        <div className="space-y-3">
          {currentProblem.options.map((option, index) => (
            <motion.button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={selectedAnswer !== null}
              className={`w-full p-4 text-left rounded-lg border transition-all ${
                selectedAnswer === index
                  ? index === currentProblem.correctAnswer
                    ? 'bg-success-500/20 border-success-400 text-success-300'
                    : 'bg-danger-500/20 border-danger-400 text-danger-300'
                  : 'bg-white/5 border-white/20 hover:bg-white/10'
              }`}
              whileHover={selectedAnswer === null ? { scale: 1.02 } : {}}
              whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
            >
              <div className="flex items-center gap-3">
                <span className="font-bold">{String.fromCharCode(65 + index)}.</span>
                <span>{option}</span>
                {showResult && selectedAnswer === index && (
                  <div className="ml-auto">
                    {index === currentProblem.correctAnswer ? (
                      <CheckCircle className="w-5 h-5 text-success-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-danger-400" />
                    )}
                  </div>
                )}
              </div>
            </motion.button>
          ))}
        </div>

        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-white/10 rounded-lg"
          >
            <h4 className="font-bold mb-2">Explanation:</h4>
            <p className="text-gray-300">{currentProblem.explanation}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProbabilityGame;
