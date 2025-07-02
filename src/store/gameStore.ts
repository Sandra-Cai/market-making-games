import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameStats, GameType, Achievement, GameSession } from '../types/game';

interface GameState {
  // User data
  userStats: GameStats;
  achievements: Achievement[];
  gameHistory: GameSession[];
  currentStreak: number;
  bestStreak: number;
  
  // Game state
  currentGame: GameType | null;
  gameInProgress: boolean;
  currentScore: number;
  gameStartTime: number | null;
  
  // UI state
  theme: 'dark' | 'light';
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  
  // Actions
  updateStats: (stats: Partial<GameStats>) => void;
  addAchievement: (achievement: Achievement) => void;
  startGame: (gameType: GameType) => void;
  endGame: (finalScore: number) => void;
  addGameSession: (session: GameSession) => void;
  toggleTheme: () => void;
  toggleSound: () => void;
  toggleNotifications: () => void;
  resetProgress: () => void;
  checkAchievements: () => void;
}

const initialStats: GameStats = {
  totalScore: 0,
  gamesPlayed: 0,
  winRate: 0,
  currentStreak: 0,
  bestScore: 0,
  level: 1,
  totalPlayTime: 0,
  averageScore: 0,
  gamesWon: 0,
  marketMakingScore: 0,
  probabilityScore: 0,
  mentalMathScore: 0,
  strategyScore: 0
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Initial state
      userStats: initialStats,
      achievements: [],
      gameHistory: [],
      currentStreak: 0,
      bestStreak: 0,
      currentGame: null,
      gameInProgress: false,
      currentScore: 0,
      gameStartTime: null,
      theme: 'dark',
      soundEnabled: true,
      notificationsEnabled: true,

      // Actions
      updateStats: (stats) => {
        set((state) => {
          const newStats = { ...state.userStats, ...stats };
          
          // Calculate derived stats
          if (newStats.gamesPlayed > 0) {
            newStats.averageScore = Math.round(newStats.totalScore / newStats.gamesPlayed);
            newStats.winRate = newStats.gamesWon / newStats.gamesPlayed;
          }
          
          // Level progression
          const newLevel = Math.floor(newStats.totalScore / 1000) + 1;
          if (newLevel > newStats.level) {
            newStats.level = newLevel;
          }
          
          return { userStats: newStats };
        });
      },

      addAchievement: (achievement) => {
        set((state) => {
          const exists = state.achievements.some(a => a.id === achievement.id);
          if (!exists) {
            return { achievements: [...state.achievements, achievement] };
          }
          return state;
        });
      },

      startGame: (gameType) => {
        set({
          currentGame: gameType,
          gameInProgress: true,
          currentScore: 0,
          gameStartTime: Date.now()
        });
      },

      endGame: (finalScore) => {
        const state = get();
        const gameDuration = state.gameStartTime ? Date.now() - state.gameStartTime : 0;
        
        // Update stats
        const newStats = {
          ...state.userStats,
          totalScore: state.userStats.totalScore + finalScore,
          gamesPlayed: state.userStats.gamesPlayed + 1,
          totalPlayTime: state.userStats.totalPlayTime + gameDuration,
          gamesWon: state.userStats.gamesWon + (finalScore > 0 ? 1 : 0)
        };

        // Update game-specific scores
        if (state.currentGame) {
          const gameScoreKey = `${state.currentGame}Score` as keyof GameStats;
          newStats[gameScoreKey] = state.userStats[gameScoreKey] + finalScore;
        }

        // Update streak
        let newStreak = state.currentStreak;
        if (finalScore > 0) {
          newStreak += 1;
        } else {
          newStreak = 0;
        }

        // Add game session
        const session: GameSession = {
          id: Date.now().toString(),
          gameType: state.currentGame!,
          score: finalScore,
          duration: gameDuration,
          timestamp: Date.now(),
          level: state.userStats.level
        };

        set((state) => ({
          userStats: { ...state.userStats, ...newStats },
          currentStreak: newStreak,
          bestStreak: Math.max(state.bestStreak, newStreak),
          gameHistory: [session, ...state.gameHistory.slice(0, 49)], // Keep last 50 sessions
          currentGame: null,
          gameInProgress: false,
          currentScore: 0,
          gameStartTime: null
        }));

        // Check for achievements
        get().checkAchievements();
      },

      addGameSession: (session) => {
        set((state) => ({
          gameHistory: [session, ...state.gameHistory.slice(0, 49)]
        }));
      },

      toggleTheme: () => {
        set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' }));
      },

      toggleSound: () => {
        set((state) => ({ soundEnabled: !state.soundEnabled }));
      },

      toggleNotifications: () => {
        set((state) => ({ notificationsEnabled: !state.notificationsEnabled }));
      },

      resetProgress: () => {
        set({
          userStats: initialStats,
          achievements: [],
          gameHistory: [],
          currentStreak: 0,
          bestStreak: 0
        });
      },

      checkAchievements: () => {
        const state = get();
        const newAchievements: Achievement[] = [];

        // First win
        if (state.userStats.gamesWon === 1) {
          newAchievements.push({
            id: 'first_win',
            title: 'First Victory',
            description: 'Win your first game',
            icon: '🏆',
            unlockedAt: Date.now()
          });
        }

        // Streak achievements
        if (state.currentStreak === 5) {
          newAchievements.push({
            id: 'streak_5',
            title: 'Hot Streak',
            description: 'Win 5 games in a row',
            icon: '🔥',
            unlockedAt: Date.now()
          });
        }

        // Score achievements
        if (state.userStats.totalScore >= 1000) {
          newAchievements.push({
            id: 'score_1000',
            title: 'Score Master',
            description: 'Reach 1000 total points',
            icon: '⭐',
            unlockedAt: Date.now()
          });
        }

        // Level achievements
        if (state.userStats.level >= 5) {
          newAchievements.push({
            id: 'level_5',
            title: 'Level Up',
            description: 'Reach level 5',
            icon: '📈',
            unlockedAt: Date.now()
          });
        }

        newAchievements.forEach(achievement => get().addAchievement(achievement));
      }
    }),
    {
      name: 'market-making-games-storage',
      partialize: (state) => ({
        userStats: state.userStats,
        achievements: state.achievements,
        gameHistory: state.gameHistory,
        currentStreak: state.currentStreak,
        bestStreak: state.bestStreak,
        theme: state.theme,
        soundEnabled: state.soundEnabled,
        notificationsEnabled: state.notificationsEnabled
      })
    }
  )
); 