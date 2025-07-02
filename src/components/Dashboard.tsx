import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Trophy, BarChart3, Star, Flame, Award, TrendingUp, Newspaper } from 'lucide-react';
import { Game } from '../types/game';
import { useGameStore } from '../store/gameStore';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useNavigate } from 'react-router-dom';

interface DashboardProps {
  games: Game[];
  userStats: any;
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

const Dashboard: React.FC<DashboardProps> = ({ games, userStats }) => {
  const gameHistory = useGameStore(s => s.gameHistory);
  const achievements = useGameStore(s => s.achievements);
  const navigate = useNavigate();

  // Prepare data for the performance chart
  const chartData = gameHistory.slice().reverse().map((session, idx) => ({
    name: `#${gameHistory.length - idx}`,
    score: session.score,
    game: session.gameType,
    date: new Date(session.timestamp).toLocaleDateString()
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-12 h-12 text-primary-400" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-400 to-cyan-400 bg-clip-text text-transparent">
              Market Making Games
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Your mental gym for quantitative careers. Train your brain with interactive exercises and challenges.
          </p>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          <div className="stat-card">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <span className="text-2xl font-bold">{userStats.totalScore}</span>
            </div>
            <p className="text-gray-400">Total Score</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-center gap-2 mb-2">
              <BarChart3 className="w-6 h-6 text-primary-400" />
              <span className="text-2xl font-bold">{userStats.gamesPlayed}</span>
            </div>
            <p className="text-gray-400">Games Played</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="w-6 h-6 text-success-400" />
              <span className="text-2xl font-bold">{(userStats.winRate * 100).toFixed(0)}%</span>
            </div>
            <p className="text-gray-400">Win Rate</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Flame className="w-6 h-6 text-orange-400" />
              <span className="text-2xl font-bold">{userStats.currentStreak}</span>
            </div>
            <p className="text-gray-400">Current Streak</p>
          </div>
        </motion.div>

        {/* Performance Chart & Achievements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Performance Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-primary-400" /> Performance
            </h2>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8' }} />
                  <YAxis tick={{ fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: 'none', color: '#fff' }} />
                  <Line type="monotone" dataKey="score" stroke="#60a5fa" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-gray-400 text-center py-8">No game history yet</div>
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
                {achievements.slice(-6).reverse().map(a => (
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
                  {gameHistory.slice(0, 5).map(session => (
                    <tr key={session.id} className="hover:bg-white/10 transition">
                      <td className="py-2 px-4 font-semibold capitalize">{session.gameType.replace('-', ' ')}</td>
                      <td className="py-2 px-4">{session.score}</td>
                      <td className="py-2 px-4">{session.level}</td>
                      <td className="py-2 px-4">{new Date(session.timestamp).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-gray-400 text-center py-8">No recent games played</div>
          )}
        </motion.div>

        {/* Games Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/game/${game.id}`)}
              className={`game-card relative overflow-hidden group cursor-pointer`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${game.color}`}>
                    <game.icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{game.title}</h3>
                    <p className="text-gray-400">{game.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      game.difficulty === 'Beginner' ? 'bg-success-500/20 text-success-400' :
                      game.difficulty === 'Intermediate' ? 'bg-primary-500/20 text-primary-400' :
                      'bg-danger-500/20 text-danger-400'
                    }`}>
                      {game.difficulty}
                    </span>
                    <span className="text-gray-400 text-sm">{game.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary-400">
                      {index === 0 ? '🎯' : index === 1 ? '🎲' : index === 2 ? '⚡' : '🧠'}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

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
                <Line type="monotone" dataKey="score" stroke="#FFD700" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-finance-card rounded-xl p-5 flex flex-col items-start shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-finance-purple" />
              <span className="text-finance-gray text-xs">Current Streak</span>
            </div>
            <div className="text-2xl font-bold text-finance-green mb-1">{userStats.currentStreak}</div>
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
                  <td className={`py-1 text-right ${entry.change.startsWith('+') ? 'text-finance-green' : 'text-finance-red'}`}>{entry.change}</td>
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
              <li key={idx} className="flex justify-between py-2 border-b border-finance-border last:border-0">
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