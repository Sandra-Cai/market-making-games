import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Target, Trophy, BarChart3, Zap } from 'lucide-react';
import Dashboard from './components/Dashboard';
import MarketMakingGame from './components/games/MarketMakingGame';
import ProbabilityGame from './components/games/ProbabilityGame';
import MentalMathGame from './components/games/MentalMathGame';
import StrategyGame from './components/games/StrategyGame';
import { GameType, Game, GameStats } from './types/game';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | GameType>('dashboard');
  const [userStats, setUserStats] = useState<GameStats>({
    totalScore: 1250,
    gamesPlayed: 23,
    winRate: 0.78,
    currentStreak: 5,
    bestScore: 890,
    level: 3
  });

  const games: Game[] = [
    {
      id: 'market-making',
      title: 'Market Making',
      description: 'Practice market making in realistic scenarios',
      icon: TrendingUp,
      difficulty: 'Intermediate',
      category: 'Trading',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'probability',
      title: 'Probability Challenges',
      description: 'Test your understanding of risk and uncertainty',
      icon: Target,
      difficulty: 'Beginner',
      category: 'Mathematics',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'mental-math',
      title: 'Mental Math Drills',
      description: 'Speed up your quantitative thinking',
      icon: Zap,
      difficulty: 'Beginner',
      category: 'Mathematics',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'strategy',
      title: 'Strategy Games',
      description: 'Develop your strategic decision-making abilities',
      icon: Brain,
      difficulty: 'Expert',
      category: 'Strategy',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const handleGameSelect = (gameId: GameType) => {
    setCurrentView(gameId);
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  const updateStats = (newStats: Partial<GameStats>) => {
    setUserStats(prev => ({ ...prev, ...newStats }));
  };

  if (currentView === 'dashboard') {
    return (
      <Dashboard 
        games={games}
        userStats={userStats}
        onGameSelect={handleGameSelect}
      />
    );
  }

  const selectedGame = games.find(game => game.id === currentView);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={handleBackToDashboard}
          className="btn-secondary mb-6 flex items-center gap-2"
        >
          ← Back to Dashboard
        </motion.button>
        
        {selectedGame && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold mb-2">{selectedGame.title}</h1>
            <p className="text-gray-300 text-lg">{selectedGame.description}</p>
          </motion.div>
        )}

        {currentView === 'market-making' && (
          <MarketMakingGame onStatsUpdate={updateStats} />
        )}
        {currentView === 'probability' && (
          <ProbabilityGame onStatsUpdate={updateStats} />
        )}
        {currentView === 'mental-math' && (
          <MentalMathGame onStatsUpdate={updateStats} />
        )}
        {currentView === 'strategy' && (
          <StrategyGame onStatsUpdate={updateStats} />
        )}
      </div>
    </div>
  );
};

export default App; 