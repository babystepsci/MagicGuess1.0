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
    accumulatedXp: 0,
    roundsWon: 0,
    totalAttempts: 0,
    totalTimePlayed: 0,
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

  const saveGameSessionResult = async (totalXpGained: number, totalRoundsWon: number, finalAttempts: number, finalTimePlayed: number) => {
    if (!user) return;

    try {
      // Sauvegarder la partie
      await UserService.saveGame(user.id, {
        difficulty: gameState.difficulty,
        targetNumber: gameState.targetNumber,
        attempts: finalAttempts,
        timeUsed: finalTimePlayed,
        won: totalRoundsWon > 0,
        xpGained: totalXpGained,
      });

      // Mettre à jour les statistiques utilisateur
      await UserService.updateGameStats(user.id, {
        won: totalRoundsWon > 0,
        difficulty: gameState.difficulty,
        attempts: finalAttempts,
        timeUsed: finalTimePlayed,
        xpGained: totalXpGained,
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
      accumulatedXp: 0,
      roundsWon: 0,
      totalAttempts: 0,
      totalTimePlayed: 0,
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
      // Round gagné - continuer avec un nouveau nombre
      const xpGained = calculateXP(newAttempts.length, gameState.timeLeft, gameState.difficulty);
      const roundTimeUsed = gameState.maxTime - gameState.timeLeft;
      const config = DIFFICULTIES[gameState.difficulty];
      const newTargetNumber = generateRandomNumber(config.range.min, config.range.max);
      
      setGameState(prev => ({
        ...prev,
        targetNumber: newTargetNumber,
        timeLeft: prev.maxTime, // Reset timer
        attempts: [], // Reset attempts for new round
        accumulatedXp: prev.accumulatedXp + xpGained,
        roundsWon: prev.roundsWon + 1,
        totalAttempts: prev.totalAttempts + newAttempts.length,
        totalTimePlayed: prev.totalTimePlayed + roundTimeUsed,
        score: prev.accumulatedXp + xpGained, // Show accumulated XP as score
        xpGained: xpGained, // XP for this round only
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
      accumulatedXp: 0,
      roundsWon: 0,
      totalAttempts: 0,
      totalTimePlayed: 0,
    });
  }, []);

  // Timer effect
  useEffect(() => {
    if (gameState.gameStatus === 'playing' && gameState.timeLeft > 0) {
      const timer = setInterval(() => {
        setGameState(prev => {
          const newTimeLeft = prev.timeLeft - 1;
          if (newTimeLeft <= 0) {
            // Temps écoulé - fin de session
            if (user) {
              const finalTimePlayed = prev.totalTimePlayed + (prev.maxTime - prev.timeLeft);
              const finalAttempts = prev.totalAttempts + prev.attempts.length;
              saveGameSessionResult(prev.accumulatedXp, prev.roundsWon, finalAttempts, finalTimePlayed);
            }
            return {
              ...prev,
              timeLeft: 0,
              gameStatus: 'lost',
              totalTimePlayed: prev.totalTimePlayed + (prev.maxTime - prev.timeLeft),
              totalAttempts: prev.totalAttempts + prev.attempts.length,
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