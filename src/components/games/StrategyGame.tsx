import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Brain, CheckCircle, XCircle, Clock, Target, Lightbulb } from 'lucide-react';
import { StrategyScenario, GameStats } from '../../types/game';

interface StrategyGameProps {
  onStatsUpdate: (stats: Partial<GameStats>) => void;
}

const StrategyGame: React.FC<StrategyGameProps> = ({ onStatsUpdate }) => {
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'finished'>('waiting');
  const [currentScenario, setCurrentScenario] = useState<StrategyScenario | null>(null);
  const [score, setScore] = useState(0);
  const [scenariosAnswered, setScenariosAnswered] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const scenarios: StrategyScenario[] = [
    {
      id: '1',
      title: 'Market Entry Strategy',
      description: 'You are analyzing a volatile market with high uncertainty. The asset has shown 20% volatility and you have limited capital. What is your optimal entry strategy?',
      options: [
        'Enter with 100% of capital immediately',
        'Enter with 50% now, 50% if price drops 10%',
        'Wait for a clear trend to emerge',
        'Enter with 25% increments over 4 weeks'
      ],
      correctAnswer: 3,
      explanation: 'In high volatility markets, gradual entry reduces risk and allows you to average down if prices fall. This strategy balances opportunity with risk management.',
      points: 150,
      difficulty: 'medium',
      category: 'decision-making'
    },
    {
      id: '2',
      title: 'Risk Management Decision',
      description: 'Your portfolio is down 15% and you are approaching your stop-loss limit. Market conditions suggest a potential reversal. What do you do?',
      options: [
        'Hold and hope for recovery',
        'Cut losses immediately',
        'Reduce position size by 50%',
        'Double down on the position'
      ],
      correctAnswer: 2,
      explanation: 'Reducing position size allows you to stay in the trade while managing risk. This is better than either cutting losses too early or taking excessive risk.',
      points: 150,
      difficulty: 'medium',
      category: 'decision-making'
    },
    {
      id: '3',
      title: 'Portfolio Allocation',
      description: 'You have $100,000 to invest across three assets: low-risk bonds (2% return), medium-risk stocks (8% return), and high-risk crypto (25% return). How do you allocate?',
      options: [
        '100% in crypto for maximum returns',
        '50% bonds, 30% stocks, 20% crypto',
        '20% bonds, 60% stocks, 20% crypto',
        '80% bonds, 15% stocks, 5% crypto'
      ],
      correctAnswer: 2,
      explanation: 'This allocation provides good diversification with moderate risk. It captures growth potential while maintaining stability through bonds.',
      points: 150,
      difficulty: 'medium',
      category: 'decision-making'
    },
    {
      id: '4',
      title: 'Information Asymmetry',
      description: 'You have insider information that suggests a stock will move significantly. What is the ethical and legal approach?',
      options: [
        'Trade immediately to maximize profits',
        'Ignore the information completely',
        'Report it to compliance and avoid trading',
        'Share it with colleagues for collective gain'
      ],
      correctAnswer: 2,
      explanation: 'Trading on insider information is illegal and unethical. The correct approach is to report it and avoid any trading in the affected security.',
      points: 200,
      difficulty: 'medium',
      category: 'decision-making'
    },
    {
      id: '5',
      title: 'Market Timing',
      description: 'Economic indicators suggest a recession is likely within 6 months. Your portfolio is heavily weighted in cyclical stocks. What is your strategy?',
      options: [
        'Sell everything and go to cash',
        'Hold current positions',
        'Gradually shift to defensive sectors',
        'Increase leverage to maximize returns'
      ],
      correctAnswer: 2,
      explanation: 'Gradual reallocation to defensive sectors reduces risk while maintaining market exposure. This is more prudent than either panic selling or ignoring the signals.',
      points: 150,
      difficulty: 'medium',
      category: 'decision-making'
    }
  ];

  const getRandomScenario = () => {
    const randomIndex = Math.floor(Math.random() * scenarios.length);
    return scenarios[randomIndex];
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answerIndex);
    setShowResult(true);

    const isCorrect = answerIndex === currentScenario?.correctAnswer;
    if (isCorrect) {
      const timeBonus = Math.max(0, timeLeft * 2);
      setScore(prev => prev + currentScenario.points + timeBonus);
    }

    setTimeout(() => {
      setSelectedAnswer(null);
      setShowResult(false);
      setScenariosAnswered(prev => prev + 1);
      
      if (scenariosAnswered + 1 >= 5) {
        endGame();
      } else {
        setCurrentScenario(getRandomScenario());
        setTimeLeft(45);
      }
    }, 3000);
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setScenariosAnswered(0);
    setTimeLeft(45);
    setCurrentScenario(getRandomScenario());
  };

  const endGame = useCallback(() => {
    setGameState('finished');
    onStatsUpdate({
      totalScore: score,
      gamesPlayed: 1
    });
  }, [score, onStatsUpdate]);

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
  }, [gameState, endGame]);

  if (gameState === 'waiting') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card p-8 text-center"
      >
        <Brain className="w-16 h-16 text-orange-400 mx-auto mb-6" />
        <h2 className="text-3xl font-bold mb-4">Strategy Games</h2>
        <p className="text-gray-300 mb-6 max-w-md mx-auto">
          Develop your strategic decision-making abilities with real-world scenarios.
          Practice risk management, portfolio allocation, and ethical decision-making.
        </p>
        <button onClick={startGame} className="btn-primary">
          Start Strategy Training
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
        <h2 className="text-3xl font-bold mb-4">Strategy Training Complete!</h2>
        <div className="text-4xl font-bold text-orange-400 mb-4">{score}</div>
        <p className="text-gray-300 mb-6">Final Score</p>
        <button onClick={startGame} className="btn-primary">
          Train Again
        </button>
      </motion.div>
    );
  }

  if (!currentScenario) return null;

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Strategy Training</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-400" />
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
            style={{ width: `${(scenariosAnswered / 5) * 100}%` }}
          ></div>
        </div>
        <p className="text-gray-400 mt-2">Scenario {scenariosAnswered + 1} of 5</p>
      </div>

      {/* Scenario */}
      <div className="glass-card p-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-5 h-5 text-orange-400" />
            <span className="text-sm font-semibold text-orange-400">STRATEGIC DECISION</span>
          </div>
          <h3 className="text-2xl font-bold mb-4">{currentScenario.title}</h3>
          <p className="text-gray-300 text-lg leading-relaxed">{currentScenario.description}</p>
        </div>
        
        <div className="space-y-3">
          {currentScenario.options.map((option, index) => (
            <motion.button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={selectedAnswer !== null}
              className={`w-full p-4 text-left rounded-lg border transition-all ${
                selectedAnswer === index
                  ? index === currentScenario.correctAnswer
                    ? 'bg-success-500/20 border-success-400 text-success-300'
                    : 'bg-danger-500/20 border-danger-400 text-danger-300'
                  : 'bg-white/5 border-white/20 hover:bg-white/10'
              }`}
              whileHover={selectedAnswer === null ? { scale: 1.01 } : {}}
              whileTap={selectedAnswer === null ? { scale: 0.99 } : {}}
            >
              <div className="flex items-start gap-3">
                <span className="font-bold text-lg">{String.fromCharCode(65 + index)}.</span>
                <span className="text-left">{option}</span>
                {showResult && selectedAnswer === index && (
                  <div className="ml-auto">
                    {index === currentScenario.correctAnswer ? (
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
            className="mt-6 p-6 bg-white/10 rounded-lg"
          >
            <h4 className="font-bold mb-3 text-lg">Strategic Analysis:</h4>
            <p className="text-gray-300 leading-relaxed">{currentScenario.explanation}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StrategyGame; 