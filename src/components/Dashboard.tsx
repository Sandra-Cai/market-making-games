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
      } catch {
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

// Add StockSearch component
const STOCK_API_KEY = 'YOUR_FINNHUB_API_KEY'; // Replace with your Finnhub API key

interface StockSummary {
  symbol: string;
  name: string;
  price: number;
  change: number;
  percent: number;
}

// Add StockDetails modal
interface StockDetailsProps {
  symbol: string;
  name: string;
  onClose: () => void;
}

const StockDetails: React.FC<StockDetailsProps> = ({ symbol, name, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prices, setPrices] = useState<{ date: string; close: number }[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    async function fetchDetails() {
      setLoading(true);
      setError(null);
      try {
        // Get historical prices (last 30 days)
        const now = Math.floor(Date.now() / 1000);
        const monthAgo = now - 60 * 60 * 24 * 30;
        const priceRes = await fetch(`https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=D&from=${monthAgo}&to=${now}&token=${STOCK_API_KEY}`);
        if (!priceRes.ok) throw new Error('API error');
        const priceJson = await priceRes.json();
        if (priceJson.s !== 'ok') throw new Error('No price data');
        const prices = priceJson.c.map((close: number, i: number) => ({
          date: new Date(priceJson.t[i] * 1000).toLocaleDateString(),
          close,
        }));
        setPrices(prices);
        // Get news
        const newsRes = await fetch(`https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${new Date(monthAgo * 1000).toISOString().slice(0,10)}&to=${new Date(now * 1000).toISOString().slice(0,10)}&token=${STOCK_API_KEY}`);
        if (!newsRes.ok) throw new Error('API error');
        const newsJson = await newsRes.json();
        setNews(newsJson.slice(0, 5));
      } catch {
        setError('Failed to load stock details');
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [symbol]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-xl w-full relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-[#b01c2e] text-2xl font-bold"
          onClick={onClose}
          aria-label="Close stock details"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-2 text-[#b01c2e] font-serif">{symbol} <span className="text-gray-700 font-normal">{name}</span></h2>
        {loading && <div className="text-gray-600">Loading...</div>}
        {error && <div className="text-red-700">{error}</div>}
        {!loading && !error && (
          <>
            <div className="mb-4">
              <h3 className="text-lg font-bold mb-1 text-[#b01c2e]">Price (Last 30 Days)</h3>
              <div className="w-full h-32 bg-gray-50 rounded flex items-end overflow-x-auto">
                {prices.length > 1 ? (
                  <svg width="100%" height="100%" viewBox={`0 0 ${prices.length * 10} 100`} preserveAspectRatio="none">
                    <polyline
                      fill="none"
                      stroke="#b01c2e"
                      strokeWidth="3"
                      points={prices.map((p, i) => `${i * 10},${100 - (p.close / Math.max(...prices.map(x => x.close))) * 90}`).join(' ')}
                    />
                  </svg>
                ) : (
                  <div className="text-gray-500">No chart data</div>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-1 text-[#b01c2e]">Recent News</h3>
              {news.length === 0 && <div className="text-gray-500">No recent news</div>}
              <ul className="space-y-1">
                {news.map((item, idx) => (
                  <li key={idx}>
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-[#b01c2e] hover:underline font-medium">
                      {item.headline}
                    </a>
                    <span className="text-gray-500 text-xs ml-2">{item.source} &middot; {new Date(item.datetime * 1000).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const StockSearch: React.FC<{ onShowDetails: (symbol: string, name: string) => void }> = ({ onShowDetails }) => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<StockSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      // Search for symbol
      const symRes = await fetch(`https://finnhub.io/api/v1/search?q=${query}&token=${STOCK_API_KEY}`);
      if (!symRes.ok) throw new Error('API error');
      const symJson = await symRes.json();
      if (!symJson.result || symJson.result.length === 0) throw new Error('No results');
      const symbol = symJson.result[0].symbol;
      const name = symJson.result[0].description;
      onShowDetails(symbol, name);
      // Get quote
      const quoteRes = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${STOCK_API_KEY}`);
      if (!quoteRes.ok) throw new Error('API error');
      const quoteJson = await quoteRes.json();
      setResult({
        symbol,
        name,
        price: quoteJson.c,
        change: quoteJson.d,
        percent: quoteJson.dp,
      });
    } catch (err) {
      setError('Stock not found or API error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 w-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-[#b01c2e] font-serif">Stock Search</h2>
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value.toUpperCase())}
          placeholder="Enter symbol (e.g. AAPL, TSLA)"
          className="flex-1 border border-gray-300 rounded px-3 py-2 text-lg focus:outline-none focus:border-[#b01c2e]"
        />
        <button type="submit" className="px-6 py-2 rounded bg-[#b01c2e] text-white font-bold text-lg hover:bg-[#a01a29] transition-all">
          Search
        </button>
      </form>
      {loading && <div className="text-gray-600">Loading...</div>}
      {error && <div className="text-red-700">{error}</div>}
      {result && (
        <div className="mt-4 p-4 rounded border border-gray-200 bg-white">
          <div className="text-xl font-bold text-[#b01c2e]">{result.symbol} <span className="text-gray-700 font-normal">{result.name}</span></div>
          <div className="text-lg text-gray-700">Price: <span className="font-bold">${result.price?.toFixed(2)}</span></div>
          <div className={result.percent >= 0 ? 'text-green-600' : 'text-red-600'}>
            Change: {result.change?.toFixed(2)} ({result.percent?.toFixed(2)}%)
          </div>
        </div>
      )}
    </div>
  );
};

// Watchlist utilities
function getWatchlist(): string[] {
  return JSON.parse(localStorage.getItem('mmg_watchlist') || '[]');
}
function setWatchlist(list: string[]) {
  localStorage.setItem('mmg_watchlist', JSON.stringify(list));
}

// Watchlist component
const Watchlist: React.FC<{ onSelect: (symbol: string, name: string) => void }> = ({ onSelect }) => {
  const [symbols, setSymbols] = useState<string[]>(getWatchlist());
  const [data, setData] = useState<StockSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSymbols(getWatchlist());
  }, []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      if (symbols.length === 0) { setData([]); setLoading(false); return; }
      try {
        const results = await Promise.all(symbols.map(async (symbol) => {
          const quoteRes = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${STOCK_API_KEY}`);
          const quoteJson = await quoteRes.json();
          const profileRes = await fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${STOCK_API_KEY}`);
          const profileJson = await profileRes.json();
          return {
            symbol,
            name: profileJson.name || symbol,
            price: quoteJson.c,
            change: quoteJson.d,
            percent: quoteJson.dp,
          };
        }));
        setData(results);
      } catch {
        setData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [symbols]);

  if (symbols.length === 0) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 w-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-[#b01c2e] font-serif">Your Watchlist</h2>
      {loading && <div className="text-gray-600">Loading...</div>}
      <ul className="divide-y divide-gray-200">
        {data.map((item) => (
          <li key={item.symbol} className="flex items-center justify-between py-2">
            <button onClick={() => onSelect(item.symbol, item.name)} className="text-[#b01c2e] font-bold hover:underline">
              {item.symbol} <span className="text-gray-700 font-normal">{item.name}</span>
            </button>
            <span className="text-lg font-bold">${item.price?.toFixed(2)}</span>
            <span className={item.percent >= 0 ? 'text-green-600' : 'text-red-600'}>
              {item.change?.toFixed(2)} ({item.percent?.toFixed(2)}%)
            </span>
            <button
              className="ml-4 text-gray-400 hover:text-[#b01c2e] text-xl font-bold"
              onClick={() => {
                const updated = symbols.filter(s => s !== item.symbol);
                setWatchlist(updated);
                setSymbols(updated);
              }}
              aria-label="Remove from watchlist"
            >
              &times;
            </button>
          </li>
        ))}
      </ul>
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
  // Move StockDetails modal state up
  const [showDetails, setShowDetails] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [selectedName, setSelectedName] = useState('');

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
    <div className="min-h-screen bg-white font-sans">
      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}
      <div className="relative container mx-auto px-8 py-12 flex flex-col items-center justify-center min-h-[80vh] w-full gap-16 section-space overflow-hidden bg-white">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="relative z-10 text-center mb-20 pt-8 bg-white"
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
        <Watchlist onSelect={(symbol, name) => {
          setSelectedSymbol(symbol);
          setSelectedName(name);
          setShowDetails(true);
        }} />
        <StockSearch
          onShowDetails={(symbol, name) => {
            setSelectedSymbol(symbol);
            setSelectedName(name);
            setShowDetails(true);
          }}
        />
        {showDetails && selectedSymbol && selectedName && (
          <StockDetails
            symbol={selectedSymbol}
            name={selectedName}
            onClose={() => setShowDetails(false)}
          />
        )}
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
