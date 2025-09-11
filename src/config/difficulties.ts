import type { DifficultyConfig } from '../types/game';

export const DIFFICULTIES: Record<string, DifficultyConfig> = {
  easy: {
    name: 'Easy',
    range: { min: 1, max: 50 },
    timeLimit: 15,
    xpMultiplier: 1,
    theme: {
      primary: '#10B981',
      secondary: '#34D399',
      gradient: 'from-emerald-400 to-teal-400',
      particleColor: '#10B981',
    },
  },
  medium: {
    name: 'Medium',
    range: { min: 1, max: 100 },
    timeLimit: 25,
    xpMultiplier: 1.5,
    theme: {
      primary: '#F59E0B',
      secondary: '#FBBF24',
      gradient: 'from-amber-400 to-orange-400',
      particleColor: '#F59E0B',
    },
  },
  hard: {
    name: 'Hard',
    range: { min: 1, max: 500 },
    timeLimit: 50,
    xpMultiplier: 2,
    theme: {
      primary: '#EF4444',
      secondary: '#F87171',
      gradient: 'from-red-400 to-pink-400',
      particleColor: '#EF4444',
    },
  },
};