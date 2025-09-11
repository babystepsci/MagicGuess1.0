import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { CampaignProgress, CampaignLevel } from '../types/campaign';
import { CAMPAIGN_LEVELS, getCampaignLevel } from '../config/campaignLevels';

export class CampaignService {
  // Récupérer la progression de campagne d'un utilisateur
  static async getUserProgress(userId: string): Promise<CampaignProgress> {
    const progressRef = doc(db, 'campaignProgress', userId);
    const progressDoc = await getDoc(progressRef);
    
    if (!progressDoc.exists()) {
      // Créer une nouvelle progression avec le premier niveau débloqué
      const newProgress: CampaignProgress = {
        userId,
        completedLevels: [],
        unlockedLevels: ['tutorial'], // Premier niveau toujours débloqué
        totalXpEarned: 0,
        bestTimes: {},
        attempts: {},
        lastPlayedAt: serverTimestamp(),
      };
      
      await setDoc(progressRef, newProgress);
      return newProgress;
    }
    
    return { id: userId, ...progressDoc.data() } as CampaignProgress;
  }

  // Marquer un niveau comme complété
  static async completeLevel(
    userId: string, 
    levelId: string, 
    completionTime: number, 
    attempts: number,
    xpEarned: number
  ): Promise<void> {
    const progressRef = doc(db, 'campaignProgress', userId);
    const progress = await this.getUserProgress(userId);
    
    // Ajouter le niveau aux complétés s'il n'y est pas déjà
    if (!progress.completedLevels.includes(levelId)) {
      progress.completedLevels.push(levelId);
    }
    
    // Mettre à jour le meilleur temps si c'est mieux
    if (!progress.bestTimes[levelId] || completionTime < progress.bestTimes[levelId]) {
      progress.bestTimes[levelId] = completionTime;
    }
    
    // Mettre à jour le nombre de tentatives
    progress.attempts[levelId] = attempts;
    
    // Ajouter l'XP
    progress.totalXpEarned += xpEarned;
    
    // Débloquer le niveau suivant
    const nextLevel = CAMPAIGN_LEVELS.find(level => level.unlockRequirement === levelId);
    if (nextLevel && !progress.unlockedLevels.includes(nextLevel.id)) {
      progress.unlockedLevels.push(nextLevel.id);
    }
    
    await updateDoc(progressRef, {
      completedLevels: progress.completedLevels,
      unlockedLevels: progress.unlockedLevels,
      totalXpEarned: progress.totalXpEarned,
      bestTimes: progress.bestTimes,
      attempts: progress.attempts,
      lastPlayedAt: serverTimestamp(),
    });
  }

  // Obtenir les niveaux disponibles pour un utilisateur
  static async getAvailableLevels(userId: string): Promise<{
    unlocked: CampaignLevel[];
    locked: CampaignLevel[];
    completed: CampaignLevel[];
  }> {
    const progress = await this.getUserProgress(userId);
    
    const unlocked: CampaignLevel[] = [];
    const locked: CampaignLevel[] = [];
    const completed: CampaignLevel[] = [];
    
    CAMPAIGN_LEVELS.forEach(level => {
      if (progress.completedLevels.includes(level.id)) {
        completed.push(level);
      } else if (progress.unlockedLevels.includes(level.id)) {
        unlocked.push(level);
      } else {
        locked.push(level);
      }
    });
    
    return { unlocked, locked, completed };
  }

  // Obtenir les statistiques de campagne
  static async getCampaignStats(userId: string): Promise<{
    totalLevels: number;
    completedLevels: number;
    totalXpEarned: number;
    averageAttempts: number;
    bestCompletionTime: number;
    completionPercentage: number;
  }> {
    const progress = await this.getUserProgress(userId);
    
    const totalLevels = CAMPAIGN_LEVELS.length;
    const completedLevels = progress.completedLevels.length;
    const totalXpEarned = progress.totalXpEarned;
    
    const attemptValues = Object.values(progress.attempts);
    const averageAttempts = attemptValues.length > 0 
      ? attemptValues.reduce((sum, attempts) => sum + attempts, 0) / attemptValues.length 
      : 0;
    
    const timeValues = Object.values(progress.bestTimes);
    const bestCompletionTime = timeValues.length > 0 ? Math.min(...timeValues) : 0;
    
    const completionPercentage = (completedLevels / totalLevels) * 100;
    
    return {
      totalLevels,
      completedLevels,
      totalXpEarned,
      averageAttempts: Math.round(averageAttempts * 10) / 10,
      bestCompletionTime,
      completionPercentage: Math.round(completionPercentage)
    };
  }

  // Valider si un nombre respecte les règles spéciales d'un niveau
  static validateGuess(guess: number, level: CampaignLevel, usedNumbers: number[] = []): {
    isValid: boolean;
    reason?: string;
  } {
    const { specialRules } = level;
    
    if (!specialRules) {
      return { isValid: true };
    }
    
    // Vérifier les nombres pairs uniquement
    if (specialRules.evenOnly && guess % 2 !== 0) {
      return { isValid: false, reason: 'Seuls les nombres pairs sont autorisés' };
    }
    
    // Vérifier les nombres impairs uniquement
    if (specialRules.oddOnly && guess % 2 === 0) {
      return { isValid: false, reason: 'Seuls les nombres impairs sont autorisés' };
    }
    
    // Vérifier les multiples
    if (specialRules.multiplesOf && guess % specialRules.multiplesOf !== 0) {
      return { isValid: false, reason: `Le nombre doit être un multiple de ${specialRules.multiplesOf}` };
    }
    
    // Vérifier les répétitions
    if (specialRules.noRepeats && usedNumbers.includes(guess)) {
      return { isValid: false, reason: 'Ce nombre a déjà été tenté' };
    }
    
    return { isValid: true };
  }
}