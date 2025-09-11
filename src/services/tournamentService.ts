import { 
  doc, 
  collection,
  addDoc,
  getDoc, 
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { MultiplayerService } from './multiplayerService';
import type { Tournament, TournamentParticipant, TournamentBracket } from '../types/tournament';

export class TournamentService {
  // Créer un nouveau tournoi
  static async createTournament(creatorId: string, tournamentData: {
    name: string;
    description: string;
    startTime: number;
    duration: number; // en heures
    maxParticipants: number;
    entryFee?: number;
    difficulty: 'easy' | 'medium' | 'hard';
    prize: { winner: number; runnerUp: number; participant: number };
    rules: { timeLimit: number; maxAttempts?: number; specialRules?: string[] };
  }): Promise<string> {
    const tournamentsRef = collection(db, 'tournaments');
    
    const tournament: Omit<Tournament, 'id'> = {
      name: tournamentData.name,
      description: tournamentData.description,
      startTime: tournamentData.startTime,
      endTime: tournamentData.startTime + (tournamentData.duration * 60 * 60 * 1000),
      maxParticipants: tournamentData.maxParticipants,
      entryFee: tournamentData.entryFee,
      difficulty: tournamentData.difficulty,
      status: 'upcoming',
      prize: tournamentData.prize,
      participants: [],
      brackets: [],
      currentRound: 0,
      maxRounds: Math.ceil(Math.log2(tournamentData.maxParticipants)),
      createdAt: Date.now(),
      createdBy: creatorId,
      rules: tournamentData.rules
    };

    const docRef = await addDoc(tournamentsRef, tournament);
    return docRef.id;
  }

  // Récupérer tous les tournois
  static async getTournaments(status?: Tournament['status']): Promise<Tournament[]> {
    const tournamentsRef = collection(db, 'tournaments');
    let q = query(tournamentsRef, orderBy('startTime', 'desc'));
    
    if (status) {
      q = query(tournamentsRef, where('status', '==', status), orderBy('startTime', 'desc'));
    }

    const snapshot = await getDocs(q);
    const tournaments: Tournament[] = [];
    
    snapshot.forEach((doc) => {
      tournaments.push({ id: doc.id, ...doc.data() } as Tournament);
    });

    return tournaments;
  }

  // S'inscrire à un tournoi
  static async registerForTournament(tournamentId: string, participant: {
    userId: string;
    userName: string;
    userAvatar: string;
    userLevel: number;
  }): Promise<boolean> {
    const tournamentRef = doc(db, 'tournaments', tournamentId);
    const tournamentDoc = await getDoc(tournamentRef);
    
    if (!tournamentDoc.exists()) {
      throw new Error('Tournoi introuvable');
    }

    const tournament = tournamentDoc.data() as Tournament;
    
    if (tournament.status !== 'upcoming' && tournament.status !== 'registration') {
      throw new Error('Les inscriptions sont fermées');
    }

    if (tournament.participants.length >= tournament.maxParticipants) {
      throw new Error('Tournoi complet');
    }

    if (tournament.participants.some(p => p.userId === participant.userId)) {
      throw new Error('Déjà inscrit à ce tournoi');
    }

    const newParticipant: TournamentParticipant = {
      ...participant,
      registeredAt: Date.now(),
      status: 'registered',
      currentScore: 0,
      totalWins: 0,
      totalLosses: 0,
      averageTime: 0,
      averageAttempts: 0
    };

    await updateDoc(tournamentRef, {
      participants: arrayUnion(newParticipant)
    });

    return true;
  }

  // Démarrer un tournoi (générer les brackets)
  static async startTournament(tournamentId: string): Promise<void> {
    const tournamentRef = doc(db, 'tournaments', tournamentId);
    const tournamentDoc = await getDoc(tournamentRef);
    
    if (!tournamentDoc.exists()) {
      throw new Error('Tournoi introuvable');
    }

    const tournament = tournamentDoc.data() as Tournament;
    
    if (tournament.status !== 'upcoming' && tournament.status !== 'registration') {
      throw new Error('Le tournoi ne peut pas être démarré');
    }

    if (tournament.participants.length < 2) {
      throw new Error('Pas assez de participants');
    }

    // Mélanger les participants
    const shuffledParticipants = [...tournament.participants].sort(() => Math.random() - 0.5);
    
    // Générer les brackets du premier round
    const brackets: TournamentBracket[] = [];
    
    for (let i = 0; i < shuffledParticipants.length; i += 2) {
      if (i + 1 < shuffledParticipants.length) {
        brackets.push({
          id: `round1_match${Math.floor(i/2) + 1}`,
          round: 1,
          match: Math.floor(i/2) + 1,
          player1: shuffledParticipants[i],
          player2: shuffledParticipants[i + 1],
          status: 'pending'
        });
      }
    }

    await updateDoc(tournamentRef, {
      status: 'active',
      currentRound: 1,
      brackets,
      participants: shuffledParticipants.map(p => ({ ...p, status: 'active' }))
    });
  }

  // Créer une salle pour un match de tournoi
  static async createTournamentMatch(tournamentId: string, bracketId: string): Promise<string> {
    const tournamentRef = doc(db, 'tournaments', tournamentId);
    const tournamentDoc = await getDoc(tournamentRef);
    
    if (!tournamentDoc.exists()) {
      throw new Error('Tournoi introuvable');
    }

    const tournament = tournamentDoc.data() as Tournament;
    const bracket = tournament.brackets.find(b => b.id === bracketId);
    
    if (!bracket) {
      throw new Error('Match introuvable');
    }

    // Créer une salle multijoueur pour ce match
    const roomResult = await MultiplayerService.createRoom(
      bracket.player1.userId,
      bracket.player1.userName,
      bracket.player1.userAvatar,
      bracket.player1.userLevel,
      {
        name: `Tournoi: ${tournament.name} - Round ${bracket.round}`,
        maxPlayers: 2,
        difficulty: tournament.difficulty,
        isPrivate: true,
        password: `tournament_${tournamentId}_${bracketId}`
      }
    );

    // Mettre à jour le bracket avec l'ID de la salle
    const updatedBrackets = tournament.brackets.map(b => 
      b.id === bracketId 
        ? { ...b, roomId: roomResult.roomId, status: 'active' as const, startTime: Date.now() }
        : b
    );

    await updateDoc(tournamentRef, {
      brackets: updatedBrackets
    });

    return roomResult.roomId;
  }

  // Terminer un match de tournoi
  static async finishTournamentMatch(tournamentId: string, bracketId: string, winnerId: string, gameData: {
    targetNumber: number;
    player1Attempts: number;
    player2Attempts: number;
    player1Time: number;
    player2Time: number;
  }): Promise<void> {
    const tournamentRef = doc(db, 'tournaments', tournamentId);
    const tournamentDoc = await getDoc(tournamentRef);
    
    if (!tournamentDoc.exists()) {
      throw new Error('Tournoi introuvable');
    }

    const tournament = tournamentDoc.data() as Tournament;
    const bracketIndex = tournament.brackets.findIndex(b => b.id === bracketId);
    
    if (bracketIndex === -1) {
      throw new Error('Match introuvable');
    }

    // Mettre à jour le bracket
    tournament.brackets[bracketIndex] = {
      ...tournament.brackets[bracketIndex],
      winner: winnerId,
      status: 'completed',
      endTime: Date.now(),
      gameData
    };

    // Mettre à jour les statistiques des participants
    const updatedParticipants = tournament.participants.map(p => {
      if (p.userId === winnerId) {
        return { ...p, totalWins: p.totalWins + 1, currentScore: p.currentScore + 1 };
      } else if (p.userId === tournament.brackets[bracketIndex].player1.userId || 
                 p.userId === tournament.brackets[bracketIndex].player2.userId) {
        return { ...p, totalLosses: p.totalLosses + 1 };
      }
      return p;
    });

    // Vérifier si le round est terminé
    const currentRoundBrackets = tournament.brackets.filter(b => b.round === tournament.currentRound);
    const completedMatches = currentRoundBrackets.filter(b => b.status === 'completed');

    let updateData: any = {
      brackets: tournament.brackets,
      participants: updatedParticipants
    };

    // Si tous les matches du round sont terminés, passer au round suivant
    if (completedMatches.length === currentRoundBrackets.length) {
      const winners = completedMatches.map(b => 
        updatedParticipants.find(p => p.userId === b.winner)!
      );

      if (winners.length === 1) {
        // Tournoi terminé
        updateData.status = 'finished';
        updateData.participants = updatedParticipants.map(p => ({
          ...p,
          status: p.userId === winners[0].userId ? 'winner' : 'eliminated'
        }));
      } else if (winners.length > 1) {
        // Créer le round suivant
        const nextRoundBrackets: TournamentBracket[] = [];
        
        for (let i = 0; i < winners.length; i += 2) {
          if (i + 1 < winners.length) {
            nextRoundBrackets.push({
              id: `round${tournament.currentRound + 1}_match${Math.floor(i/2) + 1}`,
              round: tournament.currentRound + 1,
              match: Math.floor(i/2) + 1,
              player1: winners[i],
              player2: winners[i + 1],
              status: 'pending'
            });
          }
        }

        updateData.brackets = [...tournament.brackets, ...nextRoundBrackets];
        updateData.currentRound = tournament.currentRound + 1;
      }
    }

    await updateDoc(tournamentRef, updateData);
  }

  // Récupérer les tournois d'un utilisateur
  static async getUserTournaments(userId: string): Promise<Tournament[]> {
    const tournamentsRef = collection(db, 'tournaments');
    const snapshot = await getDocs(tournamentsRef);
    
    const userTournaments: Tournament[] = [];
    
    snapshot.forEach((doc) => {
      const tournament = { id: doc.id, ...doc.data() } as Tournament;
      if (tournament.participants.some(p => p.userId === userId)) {
        userTournaments.push(tournament);
      }
    });

    return userTournaments.sort((a, b) => b.startTime - a.startTime);
  }

  // Nettoyer les tournois expirés
  static async cleanupExpiredTournaments(): Promise<void> {
    const tournamentsRef = collection(db, 'tournaments');
    const snapshot = await getDocs(tournamentsRef);
    
    const now = Date.now();
    const expiredThreshold = 7 * 24 * 60 * 60 * 1000; // 7 jours
    
    snapshot.forEach(async (docSnapshot) => {
      const tournament = docSnapshot.data() as Tournament;
      if (tournament.status === 'finished' && (now - tournament.endTime) > expiredThreshold) {
        // Optionnel: archiver au lieu de supprimer
        await updateDoc(doc(db, 'tournaments', docSnapshot.id), {
          status: 'archived'
        });
      }
    });
  }
}