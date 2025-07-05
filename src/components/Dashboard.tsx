import React, { useEffect, useState } from 'react';
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

// Add MarketNewsFeed component
const NEWS_API_KEY = 'YOUR_FINNHUB_API_KEY'; // Replace with your Finnhub API key

interface NewsItem {
  headline: string;
  url: string;
  source: string;
  datetime: number;
}

const MarketNewsFeed: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNews() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`https://finnhub.io/api/v1/news?category=general&token=${NEWS_API_KEY}`);
        if (!res.ok) throw new Error('API error');
        const json = await res.json();
        setNews(json.slice(0, 8)); // Show top 8 headlines
      } catch (e) {
        setError('Failed to load news');
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
    const interval = setInterval(fetchNews, 60000); // refresh every 60s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mt-8 w-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-[#b01c2e] font-serif">Market News</h2>
      {loading && <div className="text-gray-600">Loading news...</div>}
      {error && <div className="text-red-700">{error}</div>}
      {!loading && !error && (
        <ul className="space-y-2">
          {news.map((item, idx) => (
            <li key={idx} className="flex flex-col md:flex-row md:items-center md:gap-2">
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-[#b01c2e] hover:underline font-medium">
                {item.headline}
              </a>
              <span className="text-gray-500 text-xs md:ml-2">{item.source} &middot; {new Date(item.datetime * 1000).toLocaleTimeString()}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// OnboardingModal component
const OnboardingModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="bg-white rounded-xl shadow-xl p-8 max-w-lg w-full text-center relative">
      <button
        className="absolute top-4 right-4 text-gray-400 hover:text-[#b01c2e] text-2xl font-bold"
        onClick={onClose}
        aria-label="Close welcome modal"
      >
        &times;
      </button>
      <h2 className="text-3xl font-bold mb-4 text-[#b01c2e] font-serif">Welcome to Market Making Games!</h2>
      <p className="text-lg text-gray-700 mb-4">
        This is your mental gym for quantitative careers. Play interactive games, track your stats, and follow live financial markets.
      </p>
      <ul className="text-left text-gray-700 mb-6 space-y-2">
        <li><span className="font-bold text-[#b01c2e]">•</span> <b>Live Stock Ticker:</b> See real-time prices for top stocks and indices.</li>
        <li><span className="font-bold text-[#b01c2e]">•</span> <b>Market News:</b> Stay updated with the latest financial headlines.</li>
        <li><span className="font-bold text-[#b01c2e]">•</span> <b>Games:</b> Practice market making, probability, mental math, and more!</li>
      </ul>
      <button
        className="mt-2 px-6 py-2 rounded-full bg-[#b01c2e] text-white font-bold text-lg hover:bg-[#a01a29] transition-all"
        onClick={onClose}
      >
        Get Started
      </button>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ games, userStats }) => {
  const gameHistory = useGameStore((s) => s.gameHistory);
  const achievements = useGameStore((s) => s.achievements);
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('mmg_onboarded')) {
      setShowOnboarding(true);
      localStorage.setItem('mmg_onboarded', '1');
    }
  }, []);

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
      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}
      <div className="relative container mx-auto px-8 py-12 flex flex-col items-center justify-center min-h-[80vh] w-full gap-16 section-space overflow-hidden bg-white">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="relative z-10 text-center mb-20 pt-8"
          role="banner"
        >
          <div className="flex flex-col items-center gap-6 mb-6">
            <Brain className="w-16 h-16 text-[#b01c2e] animate-bounce-slow" aria-hidden="true" />
            <h1 className="text-7xl font-extrabold tracking-tight font-serif animate-fade-in" style={{ fontFamily: 'Merriweather, serif', color: '#b01c2e' }}>
              Market Making Games
            </h1>
          </div>
          <p className="text-2xl text-gray-700 max-w-2xl mx-auto font-light font-sans animate-fade-in delay-200">
            Your mental gym for quantitative careers.<br />
            <span className="text-[#b01c2e] font-semibold">Sharpen your mind. Play. Win.</span>
          </p>
          <div className="mt-8">
            <a
              href="#games-section"
              className="inline-block px-8 py-3 rounded-full bg-[#b01c2e] text-white text-lg font-bold shadow hover:bg-[#a01a29] transition-all animate-fade-in delay-400"
            >
              Start Playing
            </a>
          </div>
        </motion.div>
        <div className="divider" />
        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16"
          aria-label="User statistics"
        >
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="w-7 h-7 text-[#b01c2e]" aria-hidden="true" />
              <span className="text-3xl font-bold text-black font-serif">{userStats.totalScore}</span>
            </div>
            <p className="text-lg text-gray-700 font-light font-sans">Total Score</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <BarChart3 className="w-7 h-7 text-[#b01c2e]" aria-hidden="true" />
              <span className="text-3xl font-bold text-black font-serif">{userStats.gamesPlayed}</span>
            </div>
            <p className="text-lg text-gray-700 font-light font-sans">Games Played</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="w-7 h-7 text-[#b01c2e]" aria-hidden="true" />
              <span className="text-3xl font-bold text-black font-serif">{(userStats.winRate * 100).toFixed(0)}%</span>
            </div>
            <p className="text-lg text-gray-700 font-light font-sans">Win Rate</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Flame className="w-7 h-7 text-[#b01c2e]" aria-hidden="true" />
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
        <div className="w-full mb-16" id="games-section">
          <h2 className="text-3xl font-extrabold mb-12 tracking-tight font-serif" style={{ fontFamily: 'Merriweather, serif', color: '#b01c2e' }}>Games</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 justify-center">
            {games.map((game, idx) => (
              <motion.button
                key={game.id}
                onClick={() => navigate(`/game/${game.id}`)}
                className="flex flex-col items-center justify-center gap-4 py-10 px-8 text-black rounded-none shadow-none border-0 hover:text-[#b01c2e] hover:underline focus:outline-none transition-all duration-200 font-serif text-left text-2xl font-bold tracking-tight"
                style={{ minWidth: '260px', background: 'transparent' }}
                aria-label={`Play ${game.title}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx, duration: 0.5, type: 'spring' }}
              >
                <span className="mb-2">{<game.icon className="w-12 h-12 text-[#b01c2e]" />}</span>
                <span>{game.title}</span>
                <span className="text-base font-sans text-gray-700 font-light">{game.description}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Mini-charts/stat cards */}
        <div className="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-5 flex flex-col items-start shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-[#b01c2e]" />
              <span className="text-gray-600 text-xs">Score Trend</span>
            </div>
            <div className="text-2xl font-bold text-[#b01c2e] mb-1">{userStats.totalScore}</div>
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
          <div className="bg-white rounded-xl p-5 flex flex-col items-start shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-yellow-400" />
              <span className="text-gray-600 text-xs">Current Streak</span>
            </div>
            <div className="text-2xl font-bold text-[#b01c2e] mb-1">
              {userStats.currentStreak}
            </div>
            <div className="text-xs text-gray-600">Best: {userStats.bestScore}</div>
          </div>
          <div className="bg-white rounded-xl p-5 flex flex-col items-start shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-jsblue" />
              <span className="text-gray-600 text-xs">Level</span>
            </div>
            <div className="text-2xl font-bold text-[#b01c2e] mb-1">{userStats.level}</div>
            <div className="text-xs text-gray-600">Avg Score: {userStats.averageScore}</div>
          </div>
        </div>
        {/* Leaderboard */}
        <div className="bg-white rounded-xl p-5 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-[#b01c2e]" />
            <span className="font-semibold text-[#b01c2e]">Top Movers</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-600">
                <th className="text-left font-normal">Name</th>
                <th className="text-right font-normal">Score</th>
                <th className="text-right font-normal">Change</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, idx) => (
                <tr key={entry.name} className={idx === 2 ? 'bg-white/10' : ''}>
                  <td className="py-1 font-semibold text-white">{entry.name}</td>
                  <td className="py-1 text-right text-[#b01c2e] font-bold">{entry.score}</td>
                  <td
                    className={`py-1 text-right ${entry.change.startsWith('+') ? 'text-[#b01c2e]' : 'text-[#b01c2e]'}`}
                  >
                    {entry.change}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* News/Feed */}
        <div className="col-span-1 md:col-span-3 bg-white rounded-xl p-5 shadow-md mt-6">
          <div className="flex items-center gap-2 mb-4">
            <Newspaper className="w-5 h-5 text-jsblue" />
            <span className="font-semibold text-jsblue">Market News & Tips</span>
          </div>
          <ul>
            {newsFeed.map((item, idx) => (
              <li
                key={idx}
                className="flex justify-between py-2 border-b border-gray-200 last:border-0"
              >
                <span className="text-white font-medium">{item.title}</span>
                <span className="text-gray-600 text-xs">{item.time}</span>
              </li>
            ))}
          </ul>
        </div>
        <MarketNewsFeed />

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
