import { useState, useEffect, useCallback } from 'react';
import { UserService } from '../services/userService';
import { useAuth } from './useAuth';
import type { GameState, Attempt } from '../types/game';
import { DIFFICULTIES } from '../config/difficulties';

export function useGame() {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<GameState>({
    mode: 'solo',
    difficulty: 'easy',
    targetNumber: 0,
    timeLeft: 0,
    maxTime: 0,
    attempts: [],
    gameStatus: 'waiting',
    score: 0,
    xpGained: 0,
  });

  const generateRandomNumber = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const calculateXP = (attempts: number, timeLeft: number, difficulty: string) => {
    const difficultyConfig = DIFFICULTIES[difficulty];
    const baseXP = Math.max(50 - attempts * 5, 10);
    const timeBonus = timeLeft * 2;
    const difficultyMultiplier = difficultyConfig.xpMultiplier;
    return Math.floor((baseXP + timeBonus) * difficultyMultiplier);
  };

  const saveGameResult = async (won: boolean, attempts: number, timeUsed: number, xpGained: number) => {
    if (!user) return;

    try {
      // Sauvegarder la partie
      await UserService.saveGame(user.id, {
        difficulty: gameState.difficulty,
        targetNumber: gameState.targetNumber,
        attempts,
        timeUsed,
        won,
        xpGained,
      });

      // Mettre à jour les statistiques utilisateur
      await UserService.updateGameStats(user.id, {
        won,
        difficulty: gameState.difficulty,
        attempts,
        timeUsed,
        xpGained,
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const startGame = useCallback((difficulty: string) => {
    const config = DIFFICULTIES[difficulty];
    const targetNumber = generateRandomNumber(config.range.min, config.range.max);
    
    setGameState({
      mode: 'solo',
      difficulty: difficulty as 'easy' | 'medium' | 'hard',
      targetNumber,
      timeLeft: config.timeLimit,
      maxTime: config.timeLimit,
      attempts: [],
      gameStatus: 'playing',
      score: 0,
      xpGained: 0,
    });
  }, []);

  const makeGuess = useCallback((guess: number) => {
    if (gameState.gameStatus !== 'playing') return;

    const newAttempt: Attempt = {
      number: guess,
      result: guess === gameState.targetNumber 
        ? 'correct' 
        : guess < gameState.targetNumber 
        ? 'higher' 
        : 'lower',
      timestamp: Date.now(),
    };

    const newAttempts = [...gameState.attempts, newAttempt];
    
    if (guess === gameState.targetNumber) {
      const xpGained = calculateXP(newAttempts.length, gameState.timeLeft, gameState.difficulty);
      const timeUsed = gameState.maxTime - gameState.timeLeft;
      
      saveGameResult(true, newAttempts.length, timeUsed, xpGained);
      setGameState(prev => ({
        ...prev,
        attempts: newAttempts,
        gameStatus: 'won',
        score: xpGained,
        xpGained,
      }));
    } else {
      setGameState(prev => ({
        ...prev,
        attempts: newAttempts,
      }));
    }
  }, [gameState, user]);

  const resetGame = useCallback(() => {
    setGameState({
      mode: 'solo',
      difficulty: 'easy',
      targetNumber: 0,
      timeLeft: 0,
      maxTime: 0,
      attempts: [],
      gameStatus: 'waiting',
      score: 0,
      xpGained: 0,
    });
  }, []);

  // Timer effect
  useEffect(() => {
    if (gameState.gameStatus === 'playing' && gameState.timeLeft > 0) {
      const timer = setInterval(() => {
        setGameState(prev => {
          const newTimeLeft = prev.timeLeft - 1;
          if (newTimeLeft <= 0) {
            // Sauvegarder la défaite
            if (user) {
              const timeUsed = prev.maxTime;
              saveGameResult(false, prev.attempts.length, timeUsed, 0);
            }
            return {
              ...prev,
              timeLeft: 0,
              gameStatus: 'lost',
            };
          }
          return {
            ...prev,
            timeLeft: newTimeLeft,
          };
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameState.gameStatus, gameState.timeLeft]);

  return {
    gameState,
    startGame,
    makeGuess,
    resetGame,
  };
}