import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, CheckCircle, XCircle, Brain, Clock } from 'lucide-react';
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
      question: "What is the probability of rolling a 6 on a fair six-sided die?",
      options: ["1/6", "1/3", "1/2", "5/6"],
      correctAnswer: 0,
      explanation: "A fair die has 6 sides, so the probability of rolling any specific number is 1/6.",
      difficulty: "easy",
      category: 'basic',
      timeLimit: 30
    },
    {
      question: "If you flip a coin 3 times, what is the probability of getting exactly 2 heads?",
      options: ["1/8", "3/8", "1/2", "5/8"],
      correctAnswer: 1,
      explanation: "There are 3 ways to get exactly 2 heads: HHT, HTH, THH. Total outcomes = 2³ = 8. So probability = 3/8.",
      difficulty: "medium",
      category: 'basic',
      timeLimit: 30
    },
    {
      question: "In a deck of 52 cards, what is the probability of drawing a face card (Jack, Queen, King)?",
      options: ["3/13", "1/4", "1/13", "12/52"],
      correctAnswer: 0,
      explanation: "There are 12 face cards (4 each of Jack, Queen, King) out of 52 cards. 12/52 = 3/13.",
      difficulty: "easy",
      category: 'basic',
      timeLimit: 30
    },
    {
      question: "What is the probability of getting a sum of 7 when rolling two dice?",
      options: ["1/6", "1/12", "1/36", "6/36"],
      correctAnswer: 0,
      explanation: "There are 6 ways to get a sum of 7: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1). Total outcomes = 36. So 6/36 = 1/6.",
      difficulty: "medium",
      category: 'basic',
      timeLimit: 30
    },
    {
      question: "If P(A) = 0.3 and P(B) = 0.4, and A and B are independent, what is P(A and B)?",
      options: ["0.12", "0.7", "0.1", "0.3"],
      correctAnswer: 0,
      explanation: "For independent events, P(A and B) = P(A) × P(B) = 0.3 × 0.4 = 0.12.",
      difficulty: "hard",
      category: 'basic',
      timeLimit: 30
    }
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
      setScore(prev => prev + 100);
    }

    setTimeout(() => {
      setSelectedAnswer(null);
      setShowResult(false);
      setProblemsAnswered(prev => prev + 1);
      
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

  const endGame = () => {
    setGameState('finished');
    onStatsUpdate({
      totalScore: score,
      gamesPlayed: 1
    });
  };

  useEffect(() => {
    if (gameState === 'playing') {
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [gameState]);

  if (gameState === 'waiting') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card p-8 text-center"
      >
        <Target className="w-16 h-16 text-purple-400 mx-auto mb-6" />
        <h2 className="text-3xl font-bold mb-4">Probability Challenges</h2>
        <p className="text-gray-300 mb-6 max-w-md mx-auto">
          Test your understanding of probability and risk. Solve probability problems under time pressure
          to develop your quantitative intuition.
        </p>
        <button onClick={startGame} className="btn-primary">
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
        className="glass-card p-8 text-center"
      >
        <CheckCircle className="w-16 h-16 text-success-400 mx-auto mb-6" />
        <h2 className="text-3xl font-bold mb-4">Challenge Complete!</h2>
        <div className="text-4xl font-bold text-purple-400 mb-4">{score}</div>
        <p className="text-gray-300 mb-6">Final Score</p>
        <button onClick={startGame} className="btn-primary">
          Try Again
        </button>
      </motion.div>
    );
  }

  if (!currentProblem) return null;

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Probability Challenge</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              <span className="text-xl font-bold">{score}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-400" />
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
      </div>

      {/* Problem */}
      <div className="glass-card p-8">
        <div className="mb-6">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            currentProblem.difficulty === 'easy' ? 'bg-success-500/20 text-success-400' :
            currentProblem.difficulty === 'medium' ? 'bg-primary-500/20 text-primary-400' :
            'bg-danger-500/20 text-danger-400'
          }`}>
            {currentProblem.difficulty.toUpperCase()}
          </span>
        </div>
        
        <h3 className="text-xl font-bold mb-6">{currentProblem.question}</h3>
        
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