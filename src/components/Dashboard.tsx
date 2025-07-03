import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Trophy, BarChart3, Star, Flame, Award, TrendingUp, Newspaper } from 'lucide-react';
import { Game, GameStats } from '../types/game';
import { useGameStore } from '../store/gameStore';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import FinanceGameCard from './games/FinanceGameCard';

interface DashboardProps {
  games: Game[];
  userStats: GameStats;
}

const dummyHistory = [
  { name: 'Mon', score: 800 },
  { name: 'Tue', score: 967 },
  { name: 'Wed', score: 1098 },
  { name: 'Thu', score: 1200 },
  { name: 'Fri', score: 1100 },
  { name: 'Sat', score: 1400 },
  { name: 'Sun', score: 1500 },
];

const leaderboard = [
  { name: 'Alice', score: 1500, change: '+2.1%' },
  { name: 'Bob', score: 1400, change: '+1.7%' },
  { name: 'You', score: 1200, change: '+1.2%' },
  { name: 'Carol', score: 1100, change: '-0.5%' },
  { name: 'Dave', score: 900, change: '-1.1%' },
];

const newsFeed = [
  { title: 'How to Master Market Making', time: '2h ago' },
  { title: 'Probability: The Secret Weapon in Trading', time: '5h ago' },
  { title: 'Mental Math Tricks for Quants', time: '1d ago' },
  { title: 'Strategy Game: New Scenarios Added!', time: '2d ago' },
];

const gameSparkData = {
  'market-making': [
    { value: 800 },
    { value: 850 },
    { value: 900 },
    { value: 950 },
    { value: 1000 },
    { value: 1050 },
    { value: 1100 },
  ],
  probability: [
    { value: 600 },
    { value: 650 },
    { value: 700 },
    { value: 750 },
    { value: 800 },
    { value: 850 },
    { value: 900 },
  ],
  'mental-math': [
    { value: 1000 },
    { value: 1050 },
    { value: 1100 },
    { value: 1150 },
    { value: 1200 },
    { value: 1250 },
    { value: 1300 },
  ],
  strategy: [
    { value: 700 },
    { value: 750 },
    { value: 800 },
    { value: 850 },
    { value: 900 },
    { value: 950 },
    { value: 1000 },
  ],
};

// Map game IDs to GameStats keys
const gameScoreKey: Record<string, keyof GameStats> = {
  'market-making': 'marketMakingScore',
  'probability': 'probabilityScore',
  'mental-math': 'mentalMathScore',
  'strategy': 'strategyScore',
};

const Dashboard: React.FC<DashboardProps> = ({ games, userStats }) => {
  const gameHistory = useGameStore((s) => s.gameHistory);
  const achievements = useGameStore((s) => s.achievements);
  const navigate = useNavigate();

  // Prepare data for the performance chart
  const chartData = gameHistory
    .slice()
    .reverse()
    .map((session, idx) => ({
      name: `#${gameHistory.length - idx}`,
      score: session.score,
      game: session.gameType,
      date: new Date(session.timestamp).toLocaleDateString(),
    }));

  return (
    <div className="min-h-screen bg-jsbg font-sans">
      <div className="container mx-auto px-8 py-12 flex flex-col items-center justify-center min-h-[80vh] w-full gap-16 bg-white">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
          role="banner"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <Brain className="w-14 h-14 text-red-700" aria-hidden="true" />
            <h1 className="text-6xl font-extrabold text-black tracking-tight font-serif" style={{ fontFamily: 'Merriweather, serif' }}>
              Market Making Games
            </h1>
          </div>
          <p className="text-2xl text-gray-700 max-w-2xl mx-auto font-light font-sans">
            Your mental gym for quantitative careers. Train your brain with interactive exercises and challenges.
          </p>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16"
          aria-label="User statistics"
        >
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="w-7 h-7 text-red-700" aria-hidden="true" />
              <span className="text-3xl font-bold text-black font-serif">{userStats.totalScore}</span>
            </div>
            <p className="text-lg text-gray-700 font-light font-sans">Total Score</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <BarChart3 className="w-7 h-7 text-red-700" aria-hidden="true" />
              <span className="text-3xl font-bold text-black font-serif">{userStats.gamesPlayed}</span>
            </div>
            <p className="text-lg text-gray-700 font-light font-sans">Games Played</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="w-7 h-7 text-red-700" aria-hidden="true" />
              <span className="text-3xl font-bold text-black font-serif">{(userStats.winRate * 100).toFixed(0)}%</span>
            </div>
            <p className="text-lg text-gray-700 font-light font-sans">Win Rate</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Flame className="w-7 h-7 text-red-700" aria-hidden="true" />
              <span className="text-3xl font-bold text-black font-serif">{userStats.currentStreak}</span>
            </div>
            <p className="text-lg text-gray-700 font-light font-sans">Current Streak</p>
          </div>
        </motion.div>

        {/* Performance Chart & Achievements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Performance Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
            role="img"
            aria-label="Performance chart showing recent game scores"
          >
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 font-sans">
              <BarChart3 className="w-6 h-6 text-jsblue" aria-hidden="true" /> Performance
            </h2>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2e3748" />
                  <XAxis dataKey="name" tick={{ fill: '#abb2bf', fontFamily: 'Inter, IBM Plex Sans, ui-sans-serif' }} />
                  <YAxis tick={{ fill: '#abb2bf', fontFamily: 'Inter, IBM Plex Sans, ui-sans-serif' }} />
                  <Tooltip
                    contentStyle={{ background: '#232b3a', border: 'none', color: '#f8fafd', fontFamily: 'Inter, IBM Plex Sans, ui-sans-serif' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#61afef"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#e3b04b' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-jsgray text-center py-8">No game history yet</div>
            )}
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Award className="w-6 h-6 text-yellow-400" /> Achievements
            </h2>
            {achievements.length > 0 ? (
              <div className="flex flex-wrap gap-4">
                {achievements
                  .slice(-6)
                  .reverse()
                  .map((a) => (
                    <div key={a.id} className="flex flex-col items-center p-2">
                      <span className="text-3xl mb-1">{a.icon}</span>
                      <span className="text-sm font-semibold text-white">{a.title}</span>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-gray-400 text-center py-8">No achievements yet</div>
            )}
          </motion.div>
        </div>

        {/* Recent Game History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 mb-12"
        >
          <h2 className="text-xl font-bold mb-4">Recent Games</h2>
          {gameHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="text-gray-400">
                    <th className="py-2 px-4">Game</th>
                    <th className="py-2 px-4">Score</th>
                    <th className="py-2 px-4">Level</th>
                    <th className="py-2 px-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {gameHistory.slice(0, 5).map((session) => (
                    <tr key={session.id} className="hover:bg-white/10 transition">
                      <td className="py-2 px-4 font-semibold capitalize">
                        {session.gameType.replace('-', ' ')}
                      </td>
                      <td className="py-2 px-4">{session.score}</td>
                      <td className="py-2 px-4">{session.level}</td>
                      <td className="py-2 px-4">
                        {new Date(session.timestamp).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-gray-400 text-center py-8">No recent games played</div>
          )}
        </motion.div>

        {/* Games Section */}
        <div className="w-full mb-16">
          <h2 className="text-3xl font-extrabold text-black mb-8 tracking-tight font-serif" style={{ fontFamily: 'Merriweather, serif' }}>Games</h2>
          <div className="flex flex-wrap gap-10 justify-center">
            {games.map((game) => (
              <FinanceGameCard
                key={game.id}
                icon={<game.icon className="w-8 h-8" />}
                title={game.title}
                highScore={userStats[gameScoreKey[game.id]] || 0}
                change={'+0.0%'}
                sparkData={gameSparkData[game.id] || []}
                onClick={() => navigate(`/game/${game.id}`)}
              />
            ))}
          </div>
        </div>

        {/* Mini-charts/stat cards */}
        <div className="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-finance-card rounded-xl p-5 flex flex-col items-start shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-finance-green" />
              <span className="text-finance-gray text-xs">Score Trend</span>
            </div>
            <div className="text-2xl font-bold text-finance-gold mb-1">{userStats.totalScore}</div>
            <ResponsiveContainer width="100%" height={40}>
              <LineChart data={dummyHistory} margin={{ left: -20, right: 0, top: 0, bottom: 0 }}>
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#FFD700"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-finance-card rounded-xl p-5 flex flex-col items-start shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-finance-purple" />
              <span className="text-finance-gray text-xs">Current Streak</span>
            </div>
            <div className="text-2xl font-bold text-finance-green mb-1">
              {userStats.currentStreak}
            </div>
            <div className="text-xs text-finance-gray">Best: {userStats.bestScore}</div>
          </div>
          <div className="bg-finance-card rounded-xl p-5 flex flex-col items-start shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-finance-blue" />
              <span className="text-finance-gray text-xs">Level</span>
            </div>
            <div className="text-2xl font-bold text-finance-blue mb-1">{userStats.level}</div>
            <div className="text-xs text-finance-gray">Avg Score: {userStats.averageScore}</div>
          </div>
        </div>
        {/* Leaderboard */}
        <div className="bg-finance-card rounded-xl p-5 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-finance-gold" />
            <span className="font-semibold text-finance-gold">Top Movers</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-finance-gray">
                <th className="text-left font-normal">Name</th>
                <th className="text-right font-normal">Score</th>
                <th className="text-right font-normal">Change</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, idx) => (
                <tr key={entry.name} className={idx === 2 ? 'bg-finance-bg-light' : ''}>
                  <td className="py-1 font-semibold text-white">{entry.name}</td>
                  <td className="py-1 text-right text-finance-gold font-bold">{entry.score}</td>
                  <td
                    className={`py-1 text-right ${entry.change.startsWith('+') ? 'text-finance-green' : 'text-finance-red'}`}
                  >
                    {entry.change}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* News/Feed */}
        <div className="col-span-1 md:col-span-3 bg-finance-card rounded-xl p-5 shadow-md mt-6">
          <div className="flex items-center gap-2 mb-4">
            <Newspaper className="w-5 h-5 text-finance-blue" />
            <span className="font-semibold text-finance-blue">Market News & Tips</span>
          </div>
          <ul>
            {newsFeed.map((item, idx) => (
              <li
                key={idx}
                className="flex justify-between py-2 border-b border-finance-border last:border-0"
              >
                <span className="text-white font-medium">{item.title}</span>
                <span className="text-finance-gray text-xs">{item.time}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16 text-gray-400"
        >
          <p className="text-lg mb-2">Ready to train your brain?</p>
          <p className="text-sm">Select a game above to start your quantitative mental workout!</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
