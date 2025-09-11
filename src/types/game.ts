export interface User {
  id: string;
  pseudo: string;
  name: string; // Alias pour pseudo pour compatibilité
  email: string;
  avatar: string;
  level: number;
  xp: number;
  stats: UserStats;
  createdAt?: any; // Firebase Timestamp
  lastLogin?: any; // Firebase Timestamp
}

export interface UserStats {
  gamesPlayed: number;
  gamesWon: number;
  winRate: number;
  avgReactionTime: number;
  bestStreak: number;
  totalXP: number;
  easyWins: number;
  mediumWins: number;
  hardWins: number;
}

export interface GameState {
  mode: 'solo' | 'multiplayer';
  difficulty: 'easy' | 'medium' | 'hard';
  targetNumber: number;
  timeLeft: number;
  maxTime: number;
  attempts: Attempt[];
  gameStatus: 'waiting' | 'playing' | 'won' | 'lost';
  score: number;
  xpGained: number;
}

export interface Attempt {
  number: number;
  result: 'higher' | 'lower' | 'correct';
  timestamp: number;
}

export interface DifficultyConfig {
  name: string;
  range: { min: number; max: number };
  timeLimit: number;
  xpMultiplier: number;
  theme: {
    primary: string;
    secondary: string;
    gradient: string;
    particleColor: string;
  };
}