import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import MarketMakingGame from './components/games/MarketMakingGame';
import ProbabilityGame from './components/games/ProbabilityGame';
import MentalMathGame from './components/games/MentalMathGame';
import StrategyGame from './components/games/StrategyGame';
import { useGameStore } from './store/gameStore';
import { TrendingUp, Target, Zap, Brain } from 'lucide-react';
import { Game } from './types/game';
import { Toaster, toast } from 'react-hot-toast';

// Placeholder pages
const Achievements = () => <div className="container mx-auto p-8 text-center text-2xl">Achievements (Coming Soon)</div>;
const Leaderboard = () => <div className="container mx-auto p-8 text-center text-2xl">Leaderboard (Coming Soon)</div>;
const Settings = () => <div className="container mx-auto p-8 text-center text-2xl">Settings (Coming Soon)</div>;

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

const App: React.FC = () => {
  const userStats = useGameStore(state => state.userStats);
  const achievements = useGameStore(state => state.achievements);
  const currentStreak = useGameStore(state => state.currentStreak);
  const prevAchievements = useRef(achievements);
  const prevLevel = useRef(userStats.level);
  const prevStreak = useRef(currentStreak);

  useEffect(() => {
    // Achievement unlocked
    if (achievements.length > prevAchievements.current.length) {
      const newAchievement = achievements[achievements.length - 1];
      toast.success(`Achievement unlocked: ${newAchievement.title} ${newAchievement.icon}`);
    }
    prevAchievements.current = achievements;
  }, [achievements]);

  useEffect(() => {
    // Level up
    if (userStats.level > prevLevel.current) {
      toast(`Level up! You reached level ${userStats.level} 🎉`, { icon: '🚀' });
    }
    prevLevel.current = userStats.level;
  }, [userStats.level]);

  useEffect(() => {
    // Streak milestone
    if (currentStreak > prevStreak.current && currentStreak > 0 && currentStreak % 5 === 0) {
      toast(`🔥 Hot streak! ${currentStreak} wins in a row!`);
    }
    prevStreak.current = currentStreak;
  }, [currentStreak]);

  return (
    <Router>
      <Toaster position="top-right" />
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard games={games} userStats={userStats} />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/settings" element={<Settings />} />
          {/* Game routes */}
          <Route path="/game/market-making" element={<MarketMakingGame onStatsUpdate={() => {}} />} />
          <Route path="/game/probability" element={<ProbabilityGame onStatsUpdate={() => {}} />} />
          <Route path="/game/mental-math" element={<MentalMathGame onStatsUpdate={() => {}} />} />
          <Route path="/game/strategy" element={<StrategyGame onStatsUpdate={() => {}} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App; 