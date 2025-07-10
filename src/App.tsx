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
import ErrorBoundary from './components/ErrorBoundary';

// Placeholder pages
const Achievements = () => (
  <div className="container mx-auto p-8 text-center text-2xl">Achievements (Coming Soon)</div>
);
const Leaderboard = () => (
  <div className="container mx-auto p-8 text-center text-2xl">Leaderboard (Coming Soon)</div>
);
const Settings = () => (
  <div className="container mx-auto p-8 text-center text-2xl">Settings (Coming Soon)</div>
);

const games: Game[] = [
  {
    id: 'market-making',
    title: 'Market Making',
    description: 'Practice market making in realistic scenarios',
    icon: TrendingUp,
    difficulty: 'Intermediate',
    category: 'Trading',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'probability',
    title: 'Probability Challenges',
    description: 'Test your understanding of risk and uncertainty',
    icon: Target,
    difficulty: 'Beginner',
    category: 'Mathematics',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'mental-math',
    title: 'Mental Math Drills',
    description: 'Speed up your quantitative thinking',
    icon: Zap,
    difficulty: 'Beginner',
    category: 'Mathematics',
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'strategy',
    title: 'Strategy Games',
    description: 'Develop your strategic decision-making abilities',
    icon: Brain,
    difficulty: 'Expert',
    category: 'Strategy',
    color: 'from-orange-500 to-red-500',
  },
];

const updateGameStats = (gameId: string, score: number) => {
  // Update leaderboard
  const leaderboardKey = 'leaderboard';
  const leaderboard = JSON.parse(localStorage.getItem(leaderboardKey) || '[]');
  const name = 'Player1'; // Replace with real user name if available
  const updatedLeaders = [...leaderboard, { name, score }]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  localStorage.setItem(leaderboardKey, JSON.stringify(updatedLeaders));

  // Update game history
  const historyKey = 'gameHistory';
  const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
  const newSession = { game: gameId, score, date: new Date().toISOString().slice(0, 10) };
  const updatedHistory = [newSession, ...history].slice(0, 20);
  localStorage.setItem(historyKey, JSON.stringify(updatedHistory));

  // Update achievements (example: unlock for first win, high score, streak)
  const achievementsKey = 'achievements';
  const allAchievements = [
    'First Win',
    'Streak',
    'High Roller',
    'Math Whiz',
    'Market Master',
  ];
  let earned = JSON.parse(localStorage.getItem(achievementsKey) || '[]');
  if (score > 0 && !earned.includes('First Win')) earned.push('First Win');
  if (score >= 1000 && !earned.includes('High Roller')) earned.push('High Roller');
  if (gameId === 'mental-math' && score >= 800 && !earned.includes('Math Whiz')) earned.push('Math Whiz');
  if (gameId === 'market-making' && score >= 900 && !earned.includes('Market Master')) earned.push('Market Master');
  localStorage.setItem(achievementsKey, JSON.stringify(earned));
};

const App: React.FC = () => {
  const userStats = useGameStore((state) => state.userStats);
  const achievements = useGameStore((state) => state.achievements);
  const currentStreak = useGameStore((state) => state.currentStreak);
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
      <ErrorBoundary>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard games={games} userStats={userStats} />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/settings" element={<Settings />} />
            {/* Game routes */}
            <Route path="/game/market-making" element={<MarketMakingGame onStatsUpdate={(stats) => updateGameStats('market-making', stats.totalScore)} />} />
            <Route path="/game/probability" element={<ProbabilityGame onStatsUpdate={(stats) => updateGameStats('probability', stats.totalScore)} />} />
            <Route path="/game/mental-math" element={<MentalMathGame onStatsUpdate={(stats) => updateGameStats('mental-math', stats.totalScore)} />} />
            <Route path="/game/strategy" element={<StrategyGame onStatsUpdate={(stats) => updateGameStats('strategy', stats.totalScore)} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </ErrorBoundary>
    </Router>
  );
};

export default App;
