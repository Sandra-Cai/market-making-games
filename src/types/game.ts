import React from 'react';

export type GameType = 'market-making' | 'probability' | 'mental-math' | 'strategy';

export interface GameStats {
  totalScore: number;
  gamesPlayed: number;
  winRate: number;
  currentStreak: number;
  bestScore: number;
  level: number;
  totalPlayTime: number;
  averageScore: number;
  gamesWon: number;
  marketMakingScore: number;
  probabilityScore: number;
  mentalMathScore: number;
  strategyScore: number;
}

export interface Game {
  id: GameType;
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  difficulty: 'Beginner' | 'Intermediate' | 'Expert';
  category: string;
  color: string;
  highScore?: number;
  averageScore?: number;
  timesPlayed?: number;
}

export interface MarketOrder {
  id: string;
  price: number;
  quantity: number;
  side: 'buy' | 'sell';
  timestamp: number;
}

export interface MarketState {
  currentPrice: number;
  spread: number;
  volume: number;
  volatility: number;
  orders: MarketOrder[];
  priceHistory: { timestamp: number; price: number }[];
  volumeHistory: { timestamp: number; volume: number }[];
}

export interface ProbabilityProblem {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'basic' | 'conditional' | 'bayesian' | 'combinatorics';
  timeLimit: number;
}

export interface MathProblem {
  question: string;
  answer: number;
  timeLimit: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'arithmetic' | 'algebra' | 'calculus' | 'statistics';
  hints?: string[];
}

export interface StrategyScenario {
  id: string;
  title: string;
  description: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'risk' | 'optimization' | 'game-theory' | 'decision-making';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: number;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  progress?: number;
  maxProgress?: number;
}

export interface GameSession {
  id: string;
  gameType: GameType;
  score: number;
  duration: number;
  timestamp: number;
  level: number;
  accuracy?: number;
  speed?: number;
  mistakes?: number;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  gameType: GameType;
  timestamp: number;
  level: number;
  avatar?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  joinDate: number;
  lastActive: number;
  preferences: {
    theme: 'dark' | 'light';
    soundEnabled: boolean;
    notificationsEnabled: boolean;
    difficulty: 'easy' | 'medium' | 'hard';
  };
}

export interface GameSettings {
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  soundEnabled: boolean;
  animationsEnabled: boolean;
  tutorialEnabled: boolean;
}

export interface TutorialStep {
  id: string;
  title: string;
  content: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  completed: boolean;
}

export interface Notification {
  id: string;
  type: 'achievement' | 'level-up' | 'streak' | 'reminder';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  action?: {
    label: string;
    url: string;
  };
} 