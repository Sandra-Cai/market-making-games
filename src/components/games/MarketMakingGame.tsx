import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Clock, Target, CheckCircle, XCircle } from 'lucide-react';
import { MarketState, MarketOrder, GameStats } from '../../types/game';

interface MarketMakingGameProps {
  onStatsUpdate: (stats: Partial<GameStats>) => void;
}

const MarketMakingGame: React.FC<MarketMakingGameProps> = ({ onStatsUpdate }) => {
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'finished'>('waiting');
  const [marketState, setMarketState] = useState<MarketState>({
    currentPrice: 100,
    spread: 0.5,
    volume: 1000,
    volatility: 0.02,
    orders: []
  });
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [userOrders, setUserOrders] = useState<MarketOrder[]>([]);
  const [gameMessage, setGameMessage] = useState('');

  const generateMarketEvent = useCallback(() => {
    const events = [
      { type: 'price_up', magnitude: 0.01, probability: 0.3 },
      { type: 'price_down', magnitude: 0.01, probability: 0.3 },
      { type: 'volatility_up', magnitude: 0.005, probability: 0.2 },
      { type: 'volume_spike', magnitude: 500, probability: 0.2 }
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
    setMarketState(prev => {
      const event = generateMarketEvent();
      let newPrice = prev.currentPrice;
      let newVolatility = prev.volatility;
      let newVolume = prev.volume;

      if (event) {
        switch (event.type) {
          case 'price_up':
            newPrice *= (1 + event.magnitude);
            break;
          case 'price_down':
            newPrice *= (1 - event.magnitude);
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
      newPrice *= (1 + noise);

      return {
        ...prev,
        currentPrice: Math.max(50, Math.min(200, newPrice)),
        volatility: Math.max(0.005, Math.min(0.1, newVolatility)),
        volume: Math.max(100, Math.min(5000, newVolume)),
        spread: prev.spread + (Math.random() - 0.5) * 0.1
      };
    });
  }, [generateMarketEvent]);

  const placeOrder = (side: 'buy' | 'sell', price: number, quantity: number) => {
    const order: MarketOrder = {
      id: Date.now().toString(),
      side,
      price,
      quantity,
      timestamp: Date.now()
    };

    setUserOrders(prev => [...prev, order]);
    
    // Calculate score based on order placement
    const priceDiff = Math.abs(price - marketState.currentPrice);
    const scoreGain = Math.max(0, 100 - priceDiff * 100);
    setScore(prev => prev + scoreGain);
    
    setGameMessage(`Order placed: ${side} ${quantity} @ $${price.toFixed(2)}`);
    setTimeout(() => setGameMessage(''), 2000);
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(60);
    setUserOrders([]);
    setGameMessage('Game started! Place orders to make markets.');
  };

  const endGame = () => {
    setGameState('finished');
    onStatsUpdate({
      totalScore: score,
      gamesPlayed: 1
    });
  };

  useEffect(() => {
    if (gameState === 'playing') {
      const marketInterval = setInterval(updateMarket, 2000);
      const timeInterval = setInterval(() => {
        setTimeLeft(prev => {
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
  }, [gameState, updateMarket]);

  if (gameState === 'waiting') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card p-8 text-center"
      >
        <TrendingUp className="w-16 h-16 text-primary-400 mx-auto mb-6" />
        <h2 className="text-3xl font-bold mb-4">Market Making Challenge</h2>
        <p className="text-gray-300 mb-6 max-w-md mx-auto">
          Practice market making by placing buy and sell orders. Your goal is to maintain a balanced book
          while profiting from the spread. Watch the market move and react quickly!
        </p>
        <button onClick={startGame} className="btn-primary">
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
        className="glass-card p-8 text-center"
      >
        <CheckCircle className="w-16 h-16 text-success-400 mx-auto mb-6" />
        <h2 className="text-3xl font-bold mb-4">Game Complete!</h2>
        <div className="text-4xl font-bold text-primary-400 mb-4">{score}</div>
        <p className="text-gray-300 mb-6">Final Score</p>
        <button onClick={startGame} className="btn-primary">
          Play Again
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Market Making</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary-400" />
              <span className="text-xl font-bold">{score}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-400" />
              <span className="text-xl font-bold">{timeLeft}s</span>
            </div>
          </div>
        </div>
        
        {gameMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-2 px-4 bg-primary-500/20 rounded-lg text-primary-300"
          >
            {gameMessage}
          </motion.div>
        )}
      </div>

      {/* Market Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold mb-4">Market State</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Current Price:</span>
              <span className="font-bold text-2xl">${marketState.currentPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Spread:</span>
              <span className="font-bold">${marketState.spread.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Volume:</span>
              <span className="font-bold">{marketState.volume.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Volatility:</span>
              <span className="font-bold">{(marketState.volatility * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-xl font-bold mb-4">Place Orders</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Price</label>
              <input
                type="number"
                step="0.01"
                defaultValue={marketState.currentPrice}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Quantity</label>
              <input
                type="number"
                defaultValue={100}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => placeOrder('buy', marketState.currentPrice, 100)}
                className="flex-1 bg-success-600 hover:bg-success-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Buy
              </button>
              <button
                onClick={() => placeOrder('sell', marketState.currentPrice, 100)}
                className="flex-1 bg-danger-600 hover:bg-danger-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Sell
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Order Book */}
      <div className="glass-card p-6">
        <h3 className="text-xl font-bold mb-4">Your Orders</h3>
        {userOrders.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No orders placed yet</p>
        ) : (
          <div className="space-y-2">
            {userOrders.slice(-5).reverse().map(order => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    order.side === 'buy' ? 'bg-success-400' : 'bg-danger-400'
                  }`}></div>
                  <span className="font-semibold">{order.side.toUpperCase()}</span>
                  <span className="text-gray-400">{order.quantity}</span>
                </div>
                <span className="font-bold">${order.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketMakingGame; 