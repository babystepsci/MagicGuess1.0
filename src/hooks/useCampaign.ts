import { useState, useEffect, useCallback } from 'react';
import { CampaignService } from '../services/campaignService';
import { UserService } from '../services/userService';
import { useAuth } from './useAuth';
import type { CampaignGameState, CampaignLevel, CampaignAttempt } from '../types/campaign';

export function useCampaign() {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<CampaignGameState>({
    level: {} as CampaignLevel,
    targetNumber: 0,
    timeLeft: 0,
    maxTime: 0,
    attempts: [],
    gameStatus: 'waiting',
    score: 0,
    xpGained: 0,
    usedNumbers: [],
  });

  const generateRandomNumber = (min: number, max: number, specialRules?: any) => {
    let validNumbers: number[] = [];
    
    for (let i = min; i <= max; i++) {
      let isValid = true;
      
      if (specialRules?.evenOnly && i % 2 !== 0) isValid = false;
      if (specialRules?.oddOnly && i % 2 === 0) isValid = false;
      if (specialRules?.multiplesOf && i % specialRules.multiplesOf !== 0) isValid = false;
      
      if (isValid) validNumbers.push(i);
    }
    
    return validNumbers[Math.floor(Math.random() * validNumbers.length)];
  };

  const calculateXP = (attempts: number, timeLeft: number, level: CampaignLevel) => {
    const baseXP = level.xpReward;
    const timeBonus = Math.floor((timeLeft / level.timeLimit) * 50);
    const attemptBonus = Math.max(0, (level.maxAttempts || 10) - attempts) * 10;
    return Math.floor(baseXP + timeBonus + attemptBonus);
  };

  const startCampaignLevel = useCallback((level: CampaignLevel) => {
    const targetNumber = generateRandomNumber(level.range.min, level.range.max, level.specialRules);
    
    setGameState({
      level,
      targetNumber,
      timeLeft: level.timeLimit,
      maxTime: level.timeLimit,
      attempts: [],
      gameStatus: 'playing',
      score: 0,
      xpGained: 0,
      maxAttempts: level.maxAttempts,
      usedNumbers: [],
    });
  }, []);

  const makeGuess = useCallback((guess: number) => {
    if (gameState.gameStatus !== 'playing') return;

    // Valider la tentative selon les règles du niveau
    const validation = CampaignService.validateGuess(guess, gameState.level, gameState.usedNumbers);
    
    if (!validation.isValid) {
      const invalidAttempt: CampaignAttempt = {
        number: guess,
        result: 'invalid',
        timestamp: Date.now(),
        violatesRule: validation.reason,
      };
      
      setGameState(prev => ({
        ...prev,
        attempts: [...prev.attempts, invalidAttempt],
      }));
      return;
    }

    const newAttempt: CampaignAttempt = {
      number: guess,
      result: guess === gameState.targetNumber 
        ? 'correct' 
        : gameState.level.specialRules?.blindMode 
        ? 'invalid' // En mode aveugle, pas d'indice
        : guess < gameState.targetNumber 
        ? 'higher' 
        : 'lower',
      timestamp: Date.now(),
    };

    const newAttempts = [...gameState.attempts, newAttempt];
    const newUsedNumbers = [...gameState.usedNumbers, guess];
    
    if (guess === gameState.targetNumber) {
      // Victoire !
      const xpGained = calculateXP(newAttempts.length, gameState.timeLeft, gameState.level);
      const completionTime = gameState.maxTime - gameState.timeLeft;
      
      // Sauvegarder la progression
      if (user) {
        CampaignService.completeLevel(
          user.id, 
          gameState.level.id, 
          completionTime, 
          newAttempts.length,
          xpGained
        );
        
        // Mettre à jour les stats utilisateur
        UserService.updateGameStats(user.id, {
          won: true,
          difficulty: gameState.level.difficulty,
          attempts: newAttempts.length,
          timeUsed: completionTime,
          xpGained,
        });
      }
      
      setGameState(prev => ({
        ...prev,
        attempts: newAttempts,
        usedNumbers: newUsedNumbers,
        gameStatus: 'won',
        score: xpGained,
        xpGained,
      }));
    } else {
      // Vérifier si le joueur a épuisé ses tentatives
      const maxAttempts = gameState.maxAttempts || Infinity;
      if (newAttempts.length >= maxAttempts) {
        setGameState(prev => ({
          ...prev,
          attempts: newAttempts,
          usedNumbers: newUsedNumbers,
          gameStatus: 'lost',
        }));
      } else {
        setGameState(prev => ({
          ...prev,
          attempts: newAttempts,
          usedNumbers: newUsedNumbers,
        }));
      }
    }
  }, [gameState, user]);

  const resetGame = useCallback(() => {
    setGameState({
      level: {} as CampaignLevel,
      targetNumber: 0,
      timeLeft: 0,
      maxTime: 0,
      attempts: [],
      gameStatus: 'waiting',
      score: 0,
      xpGained: 0,
      usedNumbers: [],
    });
  }, []);

  // Timer effect
  useEffect(() => {
    if (gameState.gameStatus === 'playing' && gameState.timeLeft > 0) {
      const timer = setInterval(() => {
        setGameState(prev => {
          const newTimeLeft = prev.timeLeft - 1;
          if (newTimeLeft <= 0) {
            // Temps écoulé - défaite
            if (user) {
              const timeUsed = prev.maxTime;
              UserService.updateGameStats(user.id, {
                won: false,
                difficulty: prev.level.difficulty,
                attempts: prev.attempts.length,
                timeUsed,
                xpGained: 0,
              });
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
  }, [gameState.gameStatus, gameState.timeLeft, user]);

  return {
    gameState,
    startCampaignLevel,
    makeGuess,
    resetGame,
  };
}