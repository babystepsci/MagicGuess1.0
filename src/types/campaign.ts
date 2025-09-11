export interface CampaignLevel {
  id: string;
  name: string;
  description: string;
  story: string;
  difficulty: 'easy' | 'medium' | 'hard';
  range: { min: number; max: number };
  timeLimit: number;
  maxAttempts?: number;
  specialRules?: {
    evenOnly?: boolean;
    oddOnly?: boolean;
    multiplesOf?: number;
    noRepeats?: boolean;
    blindMode?: boolean; // Pas d'indices "plus haut/plus bas"
  };
  xpReward: number;
  unlockRequirement?: string; // ID du niveau précédent requis
  theme: {
    primary: string;
    secondary: string;
    gradient: string;
    particleColor: string;
    background: string;
  };
}

export interface CampaignProgress {
  userId: string;
  completedLevels: string[];
  unlockedLevels: string[];
  currentLevel?: string;
  totalXpEarned: number;
  bestTimes: { [levelId: string]: number };
  attempts: { [levelId: string]: number };
  lastPlayedAt: any; // Firebase Timestamp
}

export interface CampaignGameState {
  level: CampaignLevel;
  targetNumber: number;
  timeLeft: number;
  maxTime: number;
  attempts: CampaignAttempt[];
  gameStatus: 'waiting' | 'playing' | 'won' | 'lost';
  score: number;
  xpGained: number;
  maxAttempts?: number;
  usedNumbers: number[]; // Pour la règle noRepeats
}

export interface CampaignAttempt {
  number: number;
  result: 'higher' | 'lower' | 'correct' | 'invalid';
  timestamp: number;
  violatesRule?: string;
}