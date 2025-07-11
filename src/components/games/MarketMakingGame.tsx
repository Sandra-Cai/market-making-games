import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, Target, CheckCircle, Info } from 'lucide-react';
import { MarketState, MarketOrder, GameStats } from '../../types/game';
import { XAxis, YAxis, ResponsiveContainer, AreaChart, Area } from 'recharts';
import Confetti from 'react-confetti';
import useSound from 'use-sound';
import { useGameStore } from '../../store/gameStore';

// Move these type definitions above the component
// 1. Update MarketOrder type to include 'filled' and 'fillQty'
type UserOrder = MarketOrder & { filled?: boolean; fillQty?: number; expiry?: number; remainingQty?: number; expired?: boolean; autoLiquidation?: boolean };
type UserOrdersState = UserOrder[];

interface MarketMakingGameProps {
  onStatsUpdate: (stats: Partial<GameStats>) => void;
}

const InstructionsSection = () => (
  <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 max-w-2xl mx-auto">
    <h2 className="text-2xl font-bold mb-2 text-[#b01c2e] font-serif flex items-center gap-2">
      <Info className="w-6 h-6 text-[#b01c2e]" /> How to Play Market Making
    </h2>
    <ul className="text-gray-700 text-base list-disc pl-6 space-y-1">
      <li>
        Place <span className="font-semibold text-[#b01c2e]">buy</span> and <span className="font-semibold text-[#b01c2e]">sell</span> orders to make a market.
      </li>
      <li>
        Your goal: <span className="font-semibold text-[#b01c2e]">balance your book</span> and profit from the <span className="underline cursor-help" title="The difference between the best ask and best bid prices. Lower spread = more competitive market.">spread</span>.
      </li>
      <li>
        Watch the <span className="underline cursor-help" title="A list of all buy and sell orders in the market, showing price and quantity.">order book</span> and react to market moves.
      </li>
      <li>
        Try to maximize your profit while minimizing risk!
      </li>
    </ul>
  </div>
);

const MarketMakingGame: React.FC<MarketMakingGameProps> = ({ onStatsUpdate }) => {
  const [marketState, setMarketState] = useState<MarketState>({
    currentPrice: 100,
    spread: 0.5,
    volume: 1000,
    volatility: 0.02,
    orders: [],
    priceHistory: [{ timestamp: Date.now(), price: 100 }],
    volumeHistory: [{ timestamp: Date.now(), volume: 1000 }],
  });
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'finished'>('waiting');
  const [timeLeft, setTimeLeft] = useState(60);
  const [userOrders, setUserOrders] = useState<UserOrdersState>([]);
  const [gameMessage, setGameMessage] = useState('');
  const [priceHistory, setPriceHistory] = useState<{ timestamp: number; price: number }[]>([]);
  const [tradeHistory, setTradeHistory] = useState<
    { timestamp: number; price: number; quantity: number; side: 'buy' | 'sell' }[]
  >([]);

  // Add state for controlled price and quantity inputs
  const [orderPrice, setOrderPrice] = useState(marketState.currentPrice);
  const [orderQty, setOrderQty] = useState(100);

  // Add state for help modal
  const [showHelp, setShowHelp] = useState(false);

  // Add state for order type
  const [orderType, setOrderType] = useState<'limit' | 'market'>('limit');

  // Add state for order expiry
  const [orderExpiry, setOrderExpiry] = useState(10); // default 10 seconds

  // 1. Add Framer Motion animated score: animate the score number (scale up and fade in) when it increases.
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  // 1. Add local leaderboard state and helpers
  const [leaderboard, setLeaderboard] = useState<number[]>(() => {
    const stored = localStorage.getItem('mmg_leaderboard');
    return stored ? JSON.parse(stored) : [];
  });
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  // 1. Add difficulty state
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');

  // Add state for inventory and P&L
  const [inventory, setInventory] = useState(0); // positive = long, negative = short
  const [realizedPnL, setRealizedPnL] = useState(0);
  const [unrealizedPnL, setUnrealizedPnL] = useState(0);

  // Add state for risk warning
  const INVENTORY_LIMIT = 500;
  const [showRiskWarning, setShowRiskWarning] = useState(false);

  // 2. Add sound effect files (place in public/sounds/ or use a CDN for demo)
  // Example: order.mp3, game-end.mp3

  // 3. Use useSound for order and game end
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const [playOrder] = useSound('/sounds/order.mp3', { soundEnabled });
  const [playGameEnd] = useSound('/sounds/game-end.mp3', { soundEnabled });

  // 4. Play sound on order placement and game end
  const placeOrder = (side: 'buy' | 'sell', price: number, quantity: number) => {
    if (orderType === 'market') {
      const order: UserOrder = {
        id: Date.now().toString(),
        side,
        price: marketState.currentPrice,
        quantity,
        timestamp: Date.now(),
        filled: true,
        fillQty: quantity,
      };
      setUserOrders((prev) => [...prev, order]);
      setLastOrderId(order.id);
      // Score for market order: less than limit, encourage limit making
      const scoreGain = Math.round(50 * (difficulty === 'easy' ? 0.7 : difficulty === 'hard' ? 1.3 : 1));
      setScore((prev) => prev + scoreGain);
      setGameMessage(`Market order filled: ${side} ${quantity} @ $${marketState.currentPrice.toFixed(2)}`);
      setTimeout(() => setGameMessage(''), 2000);
      if (soundEnabled) playOrder();
      return;
    }
    const now = Date.now();
    const order: UserOrder = {
      id: now.toString(),
      side,
      price,
      quantity,
      timestamp: now,
      expiry: now + orderExpiry * 1000,
      remainingQty: quantity,
      filled: false,
      fillQty: 0,
    };

    setUserOrders((prev) => [...prev, order]);
    setLastOrderId(order.id); // 2. Add lastOrderId state and highlight new orders in 'Your Orders' and order book with a yellow flash (using a CSS class and setTimeout to remove highlight).

    // Calculate score based on order placement and difficulty
    const priceDiff = Math.abs(price - marketState.currentPrice);
    let baseScore = Math.max(0, 100 - priceDiff * 100);
    const multiplier = difficulty === 'easy' ? 0.7 : difficulty === 'hard' ? 1.3 : 1;
    const scoreGain = Math.round(baseScore * multiplier);
    setScore((prev) => prev + scoreGain);

    setGameMessage(`Limit order placed: ${side} ${quantity} @ $${price.toFixed(2)}`);
    setTimeout(() => setGameMessage(''), 2000);
    if (soundEnabled) playOrder();
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(difficulty === 'easy' ? 90 : difficulty === 'hard' ? 45 : 60);
    setUserOrders([]);
    setGameMessage('Game started! Place orders to make markets.');
    setMarketState((prev) => ({
      ...prev,
      volatility: difficulty === 'easy' ? 0.01 : difficulty === 'hard' ? 0.04 : 0.02,
    }));
  };

  // Update inventory and P&L when orders are filled
  useEffect(() => {
    let inv = 0;
    let realized = 0;
    userOrders.forEach(order => {
      if (order.filled && order.fillQty && order.fillQty > 0) {
        if (order.side === 'buy') {
          inv += order.fillQty;
          realized -= order.fillQty * order.price;
        } else if (order.side === 'sell') {
          inv -= order.fillQty;
          realized += order.fillQty * order.price;
        }
      }
    });
    setInventory(inv);
    setRealizedPnL(realized);
    // Unrealized PnL: value of current inventory at market price
    setUnrealizedPnL(inv * marketState.currentPrice + realized);
  }, [userOrders, marketState.currentPrice]);

  // Show warning if inventory approaches threshold
  useEffect(() => {
    if (Math.abs(inventory) >= INVENTORY_LIMIT * 0.8 && Math.abs(inventory) < INVENTORY_LIMIT) {
      setShowRiskWarning(true);
    } else {
      setShowRiskWarning(false);
    }
    // Auto-liquidate if over limit
    if (Math.abs(inventory) >= INVENTORY_LIMIT) {
      // Auto-liquidate: execute a market order to flatten
      const side = inventory > 0 ? 'sell' : 'buy';
      const qty = Math.abs(inventory);
      const order: UserOrder = {
        id: Date.now().toString() + '-auto',
        side,
        price: marketState.currentPrice,
        quantity: qty,
        timestamp: Date.now(),
        filled: true,
        fillQty: qty,
        autoLiquidation: true,
      };
      setUserOrders((prev) => [...prev, order]);
      setLastOrderId(order.id);
      setGameMessage(`Auto-liquidation: ${side.toUpperCase()} ${qty} @ $${marketState.currentPrice.toFixed(2)} (Inventory exceeded limit)`);
      // Escalating penalty: $5 per share/contract
      setScore((prev) => prev - qty * 5);
      setInventory(0);
    }
  }, [inventory, marketState.currentPrice]);

  const endGame = useCallback(() => {
    let penalty = 0;
    if (inventory !== 0) {
      penalty = Math.abs(inventory) * 2; // $2 penalty per share/contract
      setGameMessage(`Inventory penalty: -${penalty} points for holding ${inventory}`);
    }
    setScore((prev) => prev - penalty);
    setGameState('finished');
    onStatsUpdate({
      totalScore: score - penalty,
      gamesPlayed: 1,
    });
    if (soundEnabled) playGameEnd();
  }, [score, onStatsUpdate, soundEnabled, playGameEnd, inventory]);

  // Restore updateMarket function
  const generateMarketEvent = useCallback(() => {
    const events = [
      { type: 'price_up', magnitude: 0.01, probability: 0.3 },
      { type: 'price_down', magnitude: 0.01, probability: 0.3 },
      { type: 'volatility_up', magnitude: 0.005, probability: 0.2 },
      { type: 'volume_spike', magnitude: 500, probability: 0.2 },
    ];
    const random = Math.random();
    let cumulative = 0;
    for (const event of events) {
      cumulative += event.probability;
      if (random <= cumulative) {
        return event;
      }
    }
    return null;
  }, []);
  const updateMarket = useCallback(() => {
    setMarketState((prev) => {
      let eventName: string | null = null;
      let eventEffect = null;
      // 10% chance for a market event
      if (Math.random() < 0.1) {
        if (Math.random() < 0.5) {
          eventName = 'Volatility Spike!';
          eventEffect = (state: MarketState) => ({ ...state, volatility: Math.min(0.1, state.volatility * 2) });
        } else {
          eventName = 'Breaking News!';
          eventEffect = (state: MarketState) => ({ ...state, currentPrice: state.currentPrice * (1 + (Math.random() - 0.5) * 0.1) });
        }
        // setMarketEvent(eventName); // This line was removed from the new_code, so it's removed here.
        // setShowMarketEvent(true); // This line was removed from the new_code, so it's removed here.
        // setTimeout(() => setShowMarketEvent(false), 3500); // This line was removed from the new_code, so it's removed here.
      }
      const event = generateMarketEvent();
      let newPrice = prev.currentPrice;
      let newVolatility = prev.volatility;
      let newVolume = prev.volume;
      if (event) {
        switch (event.type) {
          case 'price_up':
            newPrice *= 1 + event.magnitude;
            break;
          case 'price_down':
            newPrice *= 1 - event.magnitude;
            break;
          case 'volatility_up':
            newVolatility += event.magnitude;
            break;
          case 'volume_spike':
            newVolume += event.magnitude;
            break;
        }
      }
      // Apply market event effect if any
      let nextState = { ...prev, currentPrice: newPrice, volatility: newVolatility, volume: newVolume };
      if (eventEffect) {
        nextState = eventEffect(nextState);
      }
      // Add some random noise
      const noise = (Math.random() - 0.5) * nextState.volatility;
      nextState.currentPrice *= 1 + noise;
      const finalPrice = Math.max(50, Math.min(200, nextState.currentPrice));
      // Update price history
      setPriceHistory((prev) => [...prev.slice(-19), { timestamp: Date.now(), price: finalPrice }]);
      // Simulate some trades
      if (Math.random() > 0.7) {
        const trade = {
          timestamp: Date.now(),
          price: finalPrice + (Math.random() - 0.5) * 2,
          quantity: Math.floor(Math.random() * 100) + 50,
          side: Math.random() > 0.5 ? ('buy' as const) : ('sell' as const),
        };
        setTradeHistory((prev) => [trade, ...prev.slice(0, 9)]);
        // Simulate order matching: fill user orders if price crosses
        setUserOrders((orders) =>
          orders.map((order) => {
            if (order.filled) return order;
            if (
              (order.side === 'buy' && trade.side === 'sell' && trade.price <= order.price) ||
              (order.side === 'sell' && trade.side === 'buy' && trade.price >= order.price)
            ) {
              return { ...order, filled: true, fillQty: trade.quantity };
            }
            return order;
          })
        );
      }
      return {
        ...nextState,
        currentPrice: finalPrice,
        volatility: Math.max(0.005, Math.min(0.1, nextState.volatility)),
        volume: Math.max(100, Math.min(5000, nextState.volume)),
        spread: nextState.spread + (Math.random() - 0.5) * 0.1,
      };
    });
  }, [generateMarketEvent]);

  useEffect(() => {
    if (gameState === 'playing') {
      const marketInterval = setInterval(updateMarket, 2000);
      const timeInterval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(marketInterval);
        clearInterval(timeInterval);
      };
    }
  }, [gameState, updateMarket, endGame]);

  // 2. On game end, update leaderboard
  useEffect(() => {
    if (gameState === 'finished') {
      setLeaderboard(prev => {
        const updated = [...prev, score].sort((a, b) => b - a).slice(0, 5);
        localStorage.setItem('mmg_leaderboard', JSON.stringify(updated));
        setIsNewHighScore(score > Math.max(0, ...prev));
        return updated;
      });
    }
  }, [gameState, score]);

  // 5. Confetti for high score
  const userStats = useGameStore((s) => s.userStats);
  const [showConfetti, setShowConfetti] = useState(false);
  useEffect(() => {
    if (gameState === 'finished' && score > (userStats.bestScore || 0)) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  }, [gameState, score, userStats.bestScore]);

  if (gameState === 'waiting') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center text-center py-20 max-w-2xl mx-auto bg-white"
      >
        <TrendingUp className="w-16 h-16 text-[#b01c2e] mx-auto mb-8" />
        <h2 className="text-5xl font-extrabold mb-8 tracking-tight font-serif text-black">Market Making Challenge</h2>
        <div className="mb-8">
          <label className="block mb-2 text-lg font-semibold text-[#b01c2e]">Select Difficulty:</label>
          <div className="flex gap-4 justify-center">
            {['easy', 'normal', 'hard'].map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level as 'easy' | 'normal' | 'hard')}
                className={`px-6 py-2 rounded-full border-2 font-bold text-lg transition-all focus:outline-none ${difficulty === level ? 'bg-[#b01c2e] text-white border-[#b01c2e]' : 'bg-white text-[#b01c2e] border-[#b01c2e]'}`}
                aria-pressed={difficulty === level}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <p className="text-2xl text-gray-700 mb-12 max-w-xl mx-auto font-light font-sans">
          Practice market making by placing buy and sell orders. Your goal is to maintain a balanced
          book while profiting from the spread. Watch the market move and react quickly!
        </p>
        <button onClick={startGame} className="px-8 py-2 rounded bg-white border border-[#b01c2e] text-[#b01c2e] font-bold text-lg hover:bg-[#b01c2e] hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-[#b01c2e]">
          Start Game
        </button>
      </motion.div>
    );
  }

  if (gameState === 'finished') {
    // Calculate analytics
    const totalOrders = userOrders.length;
    const orderAccuracies = userOrders.map(o => 100 - Math.abs(o.price - marketState.currentPrice) * 100);
    const avgAccuracy = orderAccuracies.length ? (orderAccuracies.reduce((a, b) => a + b, 0) / orderAccuracies.length) : 0;
    const bestOrder = userOrders.reduce((best, o) => (!best || Math.abs(o.price - marketState.currentPrice) < Math.abs(best.price - marketState.currentPrice)) ? o : best, null as MarketOrder | null);
    const worstOrder = userOrders.reduce((worst, o) => (!worst || Math.abs(o.price - marketState.currentPrice) > Math.abs(worst.price - marketState.currentPrice)) ? o : worst, null as MarketOrder | null);
    // For spread, use marketState.spread at end (could be improved with history)
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center text-center py-20 max-w-2xl mx-auto bg-white"
      >
        <CheckCircle className="w-16 h-16 text-[#b01c2e] mx-auto mb-8" />
        <h2 className="text-5xl font-extrabold mb-4 tracking-tight font-serif text-black">Game Complete!</h2>
        <div className="text-6xl font-bold text-[#b01c2e] mb-2 font-serif">{score}</div>
        <p className="text-2xl text-gray-700 mb-8 font-light font-sans">Final Score</p>
        <div className="w-full max-w-md mx-auto bg-gray-50 rounded-xl shadow p-6 mb-8 text-left">
          <h3 className="text-xl font-bold mb-4 text-[#b01c2e]">Your Analytics</h3>
          <div className="space-y-2">
            <div className="flex justify-between"><span>Orders Placed:</span><span className="font-bold">{totalOrders}</span></div>
            <div className="flex justify-between"><span>Avg. Order Accuracy:</span><span className="font-bold">{avgAccuracy.toFixed(1)}%</span></div>
            <div className="flex justify-between"><span>Avg. Spread Captured:</span><span className="font-bold">${marketState.spread.toFixed(2)}</span></div>
            {bestOrder && <div className="flex justify-between"><span>Best Order:</span><span className="font-mono">{bestOrder.side.toUpperCase()} {bestOrder.quantity} @ ${bestOrder.price.toFixed(2)}</span></div>}
            {worstOrder && <div className="flex justify-between"><span>Worst Order:</span><span className="font-mono">{worstOrder.side.toUpperCase()} {worstOrder.quantity} @ ${worstOrder.price.toFixed(2)}</span></div>}
          </div>
          <div className="mt-6">
            <h4 className="font-bold text-[#b01c2e] mb-2">Personal Bests</h4>
            <ol className="bg-white rounded shadow p-3 space-y-1">
              {leaderboard.map((s, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="font-bold text-[#b01c2e]">#{i + 1}</span>
                  <span className="font-mono">{s}</span>
                  {i === 0 && isNewHighScore && s === score && (
                    <span className="ml-2 px-2 py-1 bg-yellow-200 text-yellow-900 rounded text-xs font-bold animate-bounce">New High Score!</span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
        <div className="flex gap-4 mt-4 justify-center">
          <button onClick={startGame} className="px-8 py-2 rounded bg-white border border-[#b01c2e] text-[#b01c2e] font-bold text-lg hover:bg-[#b01c2e] hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-[#b01c2e]">Play Again</button>
          <a href="/" className="px-8 py-2 rounded bg-[#b01c2e] text-white font-bold text-lg hover:bg-[#a01a29] transition-all focus:outline-none focus:ring-2 focus:ring-[#b01c2e]">Return to Dashboard</a>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <InstructionsSection />
      {/* Game Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Market Making</h2>
        <div className="flex items-center gap-4">
          <button
            className="text-[#b01c2e] hover:text-[#a01a29] text-xl font-bold focus:outline-none"
            aria-label="Show instructions"
            onClick={() => setShowHelp(true)}
            title="How to play"
          >
            <Info className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[#b01c2e]" />
            <span className="text-xl font-bold">{score}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#b01c2e]" />
            <span className="text-xl font-bold">{timeLeft}s</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#b01c2e]">Inv:</span>
            <span className="text-xl font-mono" title="Net position (long/short)">{inventory}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#b01c2e]">P&L:</span>
            <span className={`text-xl font-mono ${unrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>{unrealizedPnL.toFixed(2)}</span>
          </div>
          <span className="ml-4 px-3 py-1 rounded-full bg-[#b01c2e]/10 text-[#b01c2e] text-sm font-bold border border-[#b01c2e]">{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</span>
        </div>
      </div>

      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-lg w-full relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-[#b01c2e] text-2xl font-bold"
              onClick={() => setShowHelp(false)}
              aria-label="Close instructions"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4 text-[#b01c2e] font-serif">How to Play Market Making</h2>
            <ul className="text-gray-700 text-base list-disc pl-6 space-y-2 mb-4">
              <li>Place <b>buy</b> and <b>sell</b> orders to make a market.</li>
              <li>Your goal: <b>balance your book</b> and profit from the <b>spread</b>.</li>
              <li>Watch the <b>order book</b> and react to market moves.</li>
              <li>Try to maximize your profit while minimizing risk!</li>
              <li>Score is based on how close your orders are to the market price and your trading activity.</li>
              <li>Game ends when the timer reaches zero. Try to beat your high score!</li>
            </ul>
            <div className="text-gray-500 text-sm">Tip: Hover or tap on <Info className='inline w-4 h-4 align-text-bottom' /> icons for definitions of key terms.</div>
          </div>
        </div>
      )}

      {gameMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-2 px-4 bg-[#b01c2e]/20 rounded-lg text-[#b01c2e]"
        >
          {gameMessage}
        </motion.div>
      )}

      {showRiskWarning && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full bg-yellow-300 text-yellow-900 text-lg font-bold shadow-lg border border-yellow-500"
          role="status"
          aria-live="polite"
        >
          Warning: Inventory approaching risk limit! Auto-liquidation at ±{INVENTORY_LIMIT}
        </motion.div>
      )}

      {/* Market Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Price Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-xl font-bold mb-4 text-[#b01c2e]">Live Price Chart</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={priceHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFD700" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FFD700" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="timestamp" hide />
                <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fill: '#A0AEC0' }} />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#FFD700"
                  strokeWidth={2}
                  fill="url(#priceGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between items-center mt-4">
            <div>
              <span className="text-gray-600 text-sm">Current Price</span>
              <div className="text-2xl font-bold text-[#b01c2e]">
                ${marketState.currentPrice.toFixed(2)}
              </div>
            </div>
            <div className="text-right">
              <span className="text-gray-600 text-sm">24h Change</span>
              <div className="text-lg font-bold text-[#b01c2e]">+2.3%</div>
            </div>
          </div>
        </div>

        {/* Market Stats */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-xl font-bold mb-4 text-[#b01c2e]">Market Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center gap-1">
                Spread
                <span title="The difference between the best ask and best bid prices. Lower spread = more competitive market.">
                  <Info className="w-4 h-4 text-[#b01c2e] cursor-help" />
                </span>
              </span>
              <span className="font-bold text-[#b01c2e]">${marketState.spread.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center gap-1">
                Volume
                <span title="The total number of shares/contracts traded in the market.">
                  <Info className="w-4 h-4 text-[#b01c2e] cursor-help" />
                </span>
              </span>
              <span className="font-bold text-[#b01c2e]">{marketState.volume.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center gap-1">
                Volatility
                <span title="How much the price moves. Higher volatility = bigger price swings.">
                  <Info className="w-4 h-4 text-[#b01c2e] cursor-help" />
                </span>
              </span>
              <span className="font-bold text-[#b01c2e]">{(marketState.volatility * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Book and Trade History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Book */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-xl font-bold mb-4 text-[#b01c2e] flex items-center gap-2">
            Order Book
            <span title="A list of all buy and sell orders in the market, showing price and quantity.">
              <Info className="w-5 h-5 text-[#b01c2e] cursor-help" />
            </span>
          </h3>
          <div className="space-y-2">
            {/* Sell Orders */}
            <div className="text-[#b01c2e] text-sm font-semibold mb-2">SELL ORDERS</div>
            {Array.from({ length: 5 }, (_, i) => {
              const price = marketState.currentPrice + (i + 1) * 0.5;
              const userOrder = userOrders.find(o => o.side === 'sell' && Math.abs(o.price - price) < 0.01);
              return (
                <div key={`sell-${i}`} className={`flex justify-between text-sm ${userOrder ? 'bg-yellow-100 font-bold' : ''}`}>
                  <span className="text-[#b01c2e]">${price.toFixed(2)}</span>
                  <span className="text-gray-600">{userOrder ? userOrder.quantity : Math.floor(Math.random() * 200) + 100}</span>
                  {userOrder && <span className="text-xs text-[#b01c2e] ml-2">Your Order</span>}
                </div>
              );
            })}
            {/* Current Price */}
            <div className="border-t border-gray-200 my-2 pt-2">
              <div className="flex justify-between font-bold text-[#b01c2e]">
                <span>${marketState.currentPrice.toFixed(2)}</span>
                <span>MARKET</span>
              </div>
            </div>
            {/* Buy Orders */}
            <div className="text-[#b01c2e] text-sm font-semibold mb-2">BUY ORDERS</div>
            {Array.from({ length: 5 }, (_, i) => {
              const price = marketState.currentPrice - (i + 1) * 0.5;
              const userOrder = userOrders.find(o => o.side === 'buy' && Math.abs(o.price - price) < 0.01);
              return (
                <div key={`buy-${i}`} className={`flex justify-between text-sm ${userOrder ? 'bg-yellow-100 font-bold' : ''}`}>
                  <span className="text-[#b01c2e]">${price.toFixed(2)}</span>
                  <span className="text-gray-600">{userOrder ? userOrder.quantity : Math.floor(Math.random() * 200) + 100}</span>
                  {userOrder && <span className="text-xs text-[#b01c2e] ml-2">Your Order</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Trade History */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-xl font-bold mb-4 text-[#b01c2e]">Recent Trades</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {tradeHistory.length === 0 ? (
              <div className="text-gray-600 text-center py-8">No recent trades</div>
            ) : (
              tradeHistory.map((trade, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${trade.side === 'buy' ? 'bg-[#b01c2e]' : 'bg-[#b01c2e]'}`}
                    ></div>
                    <span
                      className={trade.side === 'buy' ? 'text-[#b01c2e]' : 'text-[#b01c2e]'}
                    >
                      {trade.side.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-[#b01c2e] font-bold">${trade.price.toFixed(2)}</span>
                  <span className="text-gray-600">{trade.quantity}</span>
                  <span className="text-gray-600 text-xs">
                    {new Date(trade.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Place Orders */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h3 className="text-xl font-bold mb-4 text-[#b01c2e]">Place Orders</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="mb-4 flex gap-4 items-center">
            <label className="font-semibold text-[#b01c2e]">Order Type:</label>
            <button
              className={`px-4 py-1 rounded-full border-2 font-bold text-sm transition-all focus:outline-none ${orderType === 'limit' ? 'bg-[#b01c2e] text-white border-[#b01c2e]' : 'bg-white text-[#b01c2e] border-[#b01c2e]'}`}
              onClick={() => setOrderType('limit')}
              aria-pressed={orderType === 'limit'}
            >
              Limit
            </button>
            <button
              className={`px-4 py-1 rounded-full border-2 font-bold text-sm transition-all focus:outline-none ${orderType === 'market' ? 'bg-[#b01c2e] text-white border-[#b01c2e]' : 'bg-white text-[#b01c2e] border-[#b01c2e]'}`}
              onClick={() => setOrderType('market')}
              aria-pressed={orderType === 'market'}
            >
              Market
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Price</label>
            <input
              type="number"
              step="0.01"
              value={orderPrice}
              onChange={e => setOrderPrice(Number(e.target.value))}
              className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-gray-800 focus:border-[#b01c2e] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Quantity</label>
            <input
              type="number"
              value={orderQty}
              onChange={e => setOrderQty(Number(e.target.value))}
              className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-gray-800 focus:border-[#b01c2e] focus:outline-none"
            />
          </div>
          {orderType === 'limit' && (
            <div className="mb-4 flex gap-4 items-center">
              <label className="font-semibold text-[#b01c2e]">Expiry:</label>
              {[5, 10, 20].map((sec) => (
                <button
                  key={sec}
                  className={`px-3 py-1 rounded-full border-2 font-bold text-sm transition-all focus:outline-none ${orderExpiry === sec ? 'bg-[#b01c2e] text-white border-[#b01c2e]' : 'bg-white text-[#b01c2e] border-[#b01c2e]'}`}
                  onClick={() => setOrderExpiry(sec)}
                  aria-pressed={orderExpiry === sec}
                >
                  {sec}s
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => placeOrder('buy', orderPrice, orderQty)}
            className="flex-1 bg-[#b01c2e] hover:bg-[#b01c2e]/80 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            BUY
          </button>
          <button
            onClick={() => placeOrder('sell', orderPrice, orderQty)}
            className="flex-1 bg-[#b01c2e] hover:bg-[#b01c2e]/80 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            SELL
          </button>
        </div>
      </div>

      {/* Your Orders */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h3 className="text-xl font-bold mb-4 text-[#b01c2e]">Your Orders</h3>
        {userOrders.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No orders placed yet</p>
        ) : (
          <div className="space-y-2">
            {userOrders
              .slice(-5)
              .reverse()
              .map((order) => (
                <div
                  key={order.id}
                  className={`flex items-center justify-between p-3 rounded-lg border border-gray-200 ${order.filled ? 'bg-green-100 animate-pulse' : order.expired ? 'bg-gray-200 text-gray-400' : 'bg-gray-100'}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${order.side === 'buy' ? 'bg-[#b01c2e]' : 'bg-[#b01c2e]'} ${order.id === lastOrderId ? 'animate-flash' : ''}`}
                    ></div>
                    <span className="font-semibold text-white">{order.side.toUpperCase()}</span>
                    <span className="text-gray-600">{order.quantity}</span>
                    {/* Only show one status badge per order */}
                    {order.expired ? (
                      <span className="ml-2 px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs font-bold">Expired</span>
                    ) : order.filled ? (
                      <span className="ml-2 px-2 py-1 bg-green-200 text-green-900 rounded text-xs font-bold animate-bounce">Filled</span>
                    ) : (order.remainingQty ?? 0) > 0 ? (
                      <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-900 rounded text-xs font-bold">{order.remainingQty} left</span>
                    ) : null}
                  </div>
                  <span className="font-bold text-[#b01c2e]">${order.price.toFixed(2)}</span>
                </div>
              ))}
          </div>
        )}
      </div>
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={300} />}

      {/* Leaderboard */}
      {gameState === 'playing' && (
        <div className="mt-8 max-w-md mx-auto">
          <h3 className="text-xl font-bold mb-2 text-[#b01c2e]">Leaderboard</h3>
          <ol className="bg-white rounded-xl shadow p-4 space-y-2">
            {leaderboard.map((s, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="font-bold text-lg text-[#b01c2e]">#{i + 1}</span>
                <span className="text-lg font-mono">{s}</span>
                {i === 0 && isNewHighScore && s === score && (
                  <span className="ml-2 px-2 py-1 bg-yellow-200 text-yellow-900 rounded text-xs font-bold animate-bounce">New High Score!</span>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}
      {/* showMarketEvent and marketEvent were removed from the new_code, so they are removed here. */}
    </div>
  );
};

export default MarketMakingGame;
