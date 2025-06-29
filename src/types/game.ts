import React from 'react';

export type GameType = 'market-making' | 'probability' | 'mental-math' | 'strategy';

export interface GameStats {
  totalScore: number;
  gamesPlayed: number;
  winRate: number;
  currentStreak: number;
  bestScore: number;
  level: number;
}

export interface Game {
  id: GameType;
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  difficulty: 'Beginner' | 'Intermediate' | 'Expert';
  category: string;
  color: string;
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
}

export interface ProbabilityProblem {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface MathProblem {
  question: string;
  answer: number;
  timeLimit: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface StrategyScenario {
  id: string;
  title: string;
  description: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  points: number;
} 