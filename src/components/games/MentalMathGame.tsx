import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, CheckCircle, XCircle, Clock, Target } from 'lucide-react';
import { MathProblem, GameStats } from '../../types/game';

interface MentalMathGameProps {
  onStatsUpdate: (stats: Partial<GameStats>) => void;
}

const MentalMathGame: React.FC<MentalMathGameProps> = ({ onStatsUpdate }) => {
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'finished'>('waiting');
  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(null);
  const [score, setScore] = useState(0);
  const [problemsAnswered, setProblemsAnswered] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [streak, setStreak] = useState(0);

  const generateProblem = (): MathProblem => {
    const operations = ['+', '-', '*', '/'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let num1, num2, answer;
    
    switch (operation) {
      case '+':
        num1 = Math.floor(Math.random() * 100) + 1;
        num2 = Math.floor(Math.random() * 100) + 1;
        answer = num1 + num2;
        break;
      case '-':
        num1 = Math.floor(Math.random() * 100) + 50;
        num2 = Math.floor(Math.random() * num1);
        answer = num1 - num2;
        break;
      case '*':
        num1 = Math.floor(Math.random() * 12) + 1;
        num2 = Math.floor(Math.random() * 12) + 1;
        answer = num1 * num2;
        break;
      case '/':
        num2 = Math.floor(Math.random() * 12) + 1;
        answer = Math.floor(Math.random() * 12) + 1;
        num1 = num2 * answer;
        break;
      default:
        num1 = 1;
        num2 = 1;
        answer = 2;
    }

    return {
      question: `${num1} ${operation} ${num2} = ?`,
      answer,
      timeLimit: 10,
      difficulty: 'medium'
    };
  };

  const handleSubmit = () => {
    if (!currentProblem || !userAnswer.trim()) return;

    const isCorrect = parseInt(userAnswer) === currentProblem.answer;
    
    if (isCorrect) {
      const timeBonus = Math.max(0, timeLeft * 10);
      const streakBonus = streak * 5;
      const totalPoints = 100 + timeBonus + streakBonus;
      
      setScore(prev => prev + totalPoints);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }

    setShowResult(true);
    setUserAnswer('');

    setTimeout(() => {
      setShowResult(false);
      setProblemsAnswered(prev => prev + 1);
      
      if (problemsAnswered + 1 >= 10) {
        endGame();
      } else {
        setCurrentProblem(generateProblem());
        setTimeLeft(10);
      }
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setProblemsAnswered(0);
    setStreak(0);
    setCurrentProblem(generateProblem());
    setTimeLeft(10);
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
            // Time's up - count as wrong answer
            setStreak(0);
            setShowResult(true);
            setUserAnswer('');
            
            setTimeout(() => {
              setShowResult(false);
              setProblemsAnswered(prev => prev + 1);
              
              if (problemsAnswered + 1 >= 10) {
                endGame();
              } else {
                setCurrentProblem(generateProblem());
                setTimeLeft(10);
              }
            }, 1500);
            
            return 10;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [gameState, problemsAnswered]);

  if (gameState === 'waiting') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card p-8 text-center"
      >
        <Zap className="w-16 h-16 text-green-400 mx-auto mb-6" />
        <h2 className="text-3xl font-bold mb-4">Mental Math Drills</h2>
        <p className="text-gray-300 mb-6 max-w-md mx-auto">
          Speed up your quantitative thinking with fast-paced arithmetic challenges.
          Solve problems quickly to earn bonus points and build your streak!
        </p>
        <button onClick={startGame} className="btn-primary">
          Start Drills
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
        <h2 className="text-3xl font-bold mb-4">Drills Complete!</h2>
        <div className="text-4xl font-bold text-green-400 mb-4">{score}</div>
        <p className="text-gray-300 mb-6">Final Score</p>
        <button onClick={startGame} className="btn-primary">
          Practice More
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
          <h2 className="text-2xl font-bold">Mental Math</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-400" />
              <span className="text-xl font-bold">{score}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-400" />
              <span className="text-xl font-bold">{timeLeft}s</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="progress-bar flex-1 mr-4">
            <div 
              className="progress-fill" 
              style={{ width: `${(problemsAnswered / 10) * 100}%` }}
            ></div>
          </div>
          <span className="text-sm text-gray-400">Problem {problemsAnswered + 1}/10</span>
        </div>
        
        {streak > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-2 text-center"
          >
            <span className="text-orange-400 font-bold">🔥 Streak: {streak}</span>
          </motion.div>
        )}
      </div>

      {/* Problem */}
      <div className="glass-card p-8 text-center">
        <h3 className="text-4xl font-bold mb-8">{currentProblem.question}</h3>
        
        <div className="max-w-xs mx-auto">
          <input
            type="number"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={showResult}
            className="w-full text-center text-3xl font-bold bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-400"
            placeholder="?"
            autoFocus
          />
          
          <button
            onClick={handleSubmit}
            disabled={showResult || !userAnswer.trim()}
            className="w-full mt-4 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit
          </button>
        </div>

        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 rounded-lg"
          >
            {parseInt(userAnswer) === currentProblem.answer ? (
              <div className="text-success-400">
                <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                <p className="font-bold">Correct!</p>
              </div>
            ) : (
              <div className="text-danger-400">
                <XCircle className="w-8 h-8 mx-auto mb-2" />
                <p className="font-bold">Incorrect</p>
                <p className="text-sm">Answer: {currentProblem.answer}</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MentalMathGame; 