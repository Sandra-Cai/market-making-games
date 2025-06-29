import React from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Target, Trophy, BarChart3, Zap, Star, Flame, Award } from 'lucide-react';
import { Game, GameType, GameStats } from '../types/game';

interface DashboardProps {
  games: Game[];
  userStats: GameStats;
  onGameSelect: (gameId: GameType) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ games, userStats, onGameSelect }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

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
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          <motion.div variants={itemVariants} className="stat-card">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <span className="text-2xl font-bold">{userStats.totalScore}</span>
            </div>
            <p className="text-gray-400">Total Score</p>
          </motion.div>

          <motion.div variants={itemVariants} className="stat-card">
            <div className="flex items-center justify-center gap-2 mb-2">
              <BarChart3 className="w-6 h-6 text-primary-400" />
              <span className="text-2xl font-bold">{userStats.gamesPlayed}</span>
            </div>
            <p className="text-gray-400">Games Played</p>
          </motion.div>

          <motion.div variants={itemVariants} className="stat-card">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="w-6 h-6 text-success-400" />
              <span className="text-2xl font-bold">{(userStats.winRate * 100).toFixed(0)}%</span>
            </div>
            <p className="text-gray-400">Win Rate</p>
          </motion.div>

          <motion.div variants={itemVariants} className="stat-card">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Flame className="w-6 h-6 text-orange-400" />
              <span className="text-2xl font-bold">{userStats.currentStreak}</span>
            </div>
            <p className="text-gray-400">Current Streak</p>
          </motion.div>
        </motion.div>

        {/* Level Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 mb-12"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Level {userStats.level}</h2>
            <Award className="w-8 h-8 text-yellow-400" />
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(userStats.totalScore % 1000) / 10}%` }}
            ></div>
          </div>
          <p className="text-gray-400 mt-2">
            {userStats.totalScore % 1000} / 1000 XP to next level
          </p>
        </motion.div>

        {/* Games Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onGameSelect(game.id)}
              className={`game-card relative overflow-hidden group`}
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