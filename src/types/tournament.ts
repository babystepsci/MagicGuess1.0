export interface Tournament {
  id: string;
  name: string;
  description: string;
  startTime: number;
  endTime: number;
  maxParticipants: number;
  entryFee?: number; // XP requis pour participer
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'upcoming' | 'registration' | 'active' | 'finished';
  prize: {
    winner: number; // XP
    runnerUp: number;
    participant: number;
  };
  participants: TournamentParticipant[];
  brackets: TournamentBracket[];
  currentRound: number;
  maxRounds: number;
  createdAt: number;
  createdBy: string;
  rules: {
    timeLimit: number;
    maxAttempts?: number;
    specialRules?: string[];
  };
}

export interface TournamentParticipant {
  userId: string;
  userName: string;
  userAvatar: string;
  userLevel: number;
  registeredAt: number;
  status: 'registered' | 'active' | 'eliminated' | 'winner';
  currentScore: number;
  totalWins: number;
  totalLosses: number;
  averageTime: number;
  averageAttempts: number;
}

export interface TournamentBracket {
  id: string;
  round: number;
  match: number;
  player1: TournamentParticipant;
  player2: TournamentParticipant;
  winner?: string;
  roomId?: string;
  status: 'pending' | 'active' | 'completed';
  startTime?: number;
  endTime?: number;
  gameData?: {
    targetNumber: number;
    player1Attempts: number;
    player2Attempts: number;
    player1Time: number;
    player2Time: number;
  };
}

export interface TournamentStats {
  tournamentsPlayed: number;
  tournamentsWon: number;
  tournamentWinRate: number;
  bestTournamentRank: number;
  totalTournamentXP: number;
  averageTournamentRank: number;
}