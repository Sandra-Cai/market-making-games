import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, Target, CheckCircle, Info } from 'lucide-react';
import { MarketState, MarketOrder, GameStats } from '../../types/game';
import { XAxis, YAxis, ResponsiveContainer, AreaChart, Area } from 'recharts';
import Confetti from 'react-confetti';
import useSound from 'use-sound';
import { useGameStore } from '../../store/gameStore';

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
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'finished'>('waiting');
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
  const [timeLeft, setTimeLeft] = useState(60);
  const [userOrders, setUserOrders] = useState<MarketOrder[]>([]);
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

  // 1. Add Framer Motion animated score: animate the score number (scale up and fade in) when it increases.
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  // 1. Add local leaderboard state and helpers
  const [leaderboard, setLeaderboard] = useState<number[]>(() => {
    const stored = localStorage.getItem('mmg_leaderboard');
    return stored ? JSON.parse(stored) : [];
  });
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  // 2. Add sound effect files (place in public/sounds/ or use a CDN for demo)
  // Example: order.mp3, game-end.mp3

  // 3. Use useSound for order and game end
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const [playOrder] = useSound('/sounds/order.mp3', { soundEnabled });
  const [playGameEnd] = useSound('/sounds/game-end.mp3', { soundEnabled });

  // 4. Play sound on order placement and game end
  const placeOrder = (side: 'buy' | 'sell', price: number, quantity: number) => {
    const order: MarketOrder = {
      id: Date.now().toString(),
      side,
      price,
      quantity,
      timestamp: Date.now(),
    };

    setUserOrders((prev) => [...prev, order]);
    setLastOrderId(order.id); // 2. Add lastOrderId state and highlight new orders in 'Your Orders' and order book with a yellow flash (using a CSS class and setTimeout to remove highlight).

    // Calculate score based on order placement
    const priceDiff = Math.abs(price - marketState.currentPrice);
    const scoreGain = Math.max(0, 100 - priceDiff * 100);
    setScore((prev) => prev + scoreGain);

    setGameMessage(`Order placed: ${side} ${quantity} @ $${price.toFixed(2)}`);
    setTimeout(() => setGameMessage(''), 2000);
    if (soundEnabled) playOrder();
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(60);
    setUserOrders([]);
    setGameMessage('Game started! Place orders to make markets.');
  };

  const endGame = useCallback(() => {
    setGameState('finished');
    onStatsUpdate({
      totalScore: score,
      gamesPlayed: 1,
    });
    if (soundEnabled) playGameEnd();
  }, [score, onStatsUpdate, soundEnabled, playGameEnd]);

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
      // Add some random noise
      const noise = (Math.random() - 0.5) * prev.volatility;
      newPrice *= 1 + noise;
      const finalPrice = Math.max(50, Math.min(200, newPrice));
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
      }
      return {
        ...prev,
        currentPrice: finalPrice,
        volatility: Math.max(0.005, Math.min(0.1, newVolatility)),
        volume: Math.max(100, Math.min(5000, newVolume)),
        spread: prev.spread + (Math.random() - 0.5) * 0.1,
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
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center text-center py-20 max-w-2xl mx-auto bg-white"
      >
        <CheckCircle className="w-16 h-16 text-[#b01c2e] mx-auto mb-8" />
        <h2 className="text-5xl font-extrabold mb-8 tracking-tight font-serif text-black">Game Complete!</h2>
        <div className="text-6xl font-bold text-[#b01c2e] mb-8 font-serif">{score}</div>
        <p className="text-2xl text-gray-700 mb-12 font-light font-sans">Final Score</p>
        <button onClick={startGame} className="px-8 py-2 rounded bg-white border border-[#b01c2e] text-[#b01c2e] font-bold text-lg hover:bg-[#b01c2e] hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-[#b01c2e]">
          Play Again
        </button>
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
                  className="flex items-center justify-between p-3 bg-gray-100 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        order.side === 'buy' ? 'bg-[#b01c2e]' : 'bg-[#b01c2e]'
                      } ${order.id === lastOrderId ? 'animate-flash' : ''}`}
                    ></div>
                    <span className="font-semibold text-white">{order.side.toUpperCase()}</span>
                    <span className="text-gray-600">{order.quantity}</span>
                  </div>
                  <span className="font-bold text-[#b01c2e]">${order.price.toFixed(2)}</span>
                </div>
              ))}
          </div>
        )}
      </div>
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={300} />}

      {/* Leaderboard */}
      {gameState === 'finished' && (
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
    </div>
  );
};

export default MarketMakingGame;
