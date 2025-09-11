export interface Room {
  id: string;
  shortCode: string;
  name: string;
  hostId: string;
  hostName: string;
  players: Player[];
  maxPlayers: number;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'waiting' | 'playing' | 'finished';
  gameData?: MultiplayerGameData;
  createdAt: number;
  isPrivate: boolean;
  password?: string;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  level: number;
  isReady: boolean;
  isHost: boolean;
  score: number;
  attempts: number;
  hasGuessed: boolean;
  guessTime?: number;
  isConnected: boolean;
  lastGuess: number | null;
}

export interface MultiplayerGameData {
  targetNumber: number;
  startTime: number;
  timeLimit: number;
  activePlayerId: string;
  turnStartTime: number;
  turnTimeLimit: number;
  currentRound: number;
  maxRounds: number;
  roundResults: RoundResult[];
}

export interface RoundResult {
  round: number;
  winner: string;
  winnerName: string;
  targetNumber: number;
  playerResults: PlayerRoundResult[];
  duration: number;
}

export interface PlayerRoundResult {
  playerId: string;
  playerName: string;
  attempts: number;
  guessTime: number;
  won: boolean;
  score: number;
  lastGuess: number;
  feedback: 'higher' | 'lower' | 'correct';
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
  type: 'message' | 'system' | 'game';
}

export interface Tournament {
  id: string;
  name: string;
  description: string;
  startTime: number;
  endTime: number;
  maxParticipants: number;
  participants: TournamentParticipant[];
  rounds: TournamentRound[];
  status: 'upcoming' | 'active' | 'finished';
  prize: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface TournamentParticipant {
  playerId: string;
  playerName: string;
  avatar: string;
  level: number;
  totalScore: number;
  gamesPlayed: number;
  gamesWon: number;
  eliminated: boolean;
}

export interface TournamentRound {
  roundNumber: number;
  matches: TournamentMatch[];
  status: 'pending' | 'active' | 'completed';
}

export interface TournamentMatch {
  id: string;
  player1: TournamentParticipant;
  player2: TournamentParticipant;
  winner?: string;
  roomId?: string;
  status: 'pending' | 'active' | 'completed';
}

export interface MultiplayerStats {
  multiplayerGamesPlayed: number;
  multiplayerGamesWon: number;
  multiplayerWinRate: number;
  tournamentsPlayed: number;
  tournamentsWon: number;
  bestMultiplayerStreak: number;
  averageGuessTime: number;
  totalMultiplayerXP: number;
}