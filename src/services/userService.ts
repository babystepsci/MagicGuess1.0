import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  increment,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { User, UserStats } from '../types/game';

export class UserService {
  // Créer ou mettre à jour un profil utilisateur
  static async createOrUpdateUser(userId: string, userData: Partial<User>): Promise<void> {
    const userRef = doc(db, 'users', userId);
    
    try {
      console.log('🔍 [UserService] Creating/updating user:', userId, 'with data:', userData);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        console.log('🔍 [UserService] User does not exist, creating new user');
        // Créer un nouveau utilisateur avec des stats par défaut
        const newUser: User = {
          id: userId,
          pseudo: userData.pseudo || 'Joueur',
          name: userData.pseudo || 'Joueur', // Alias pour compatibilité
          email: userData.email || '',
          avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.pseudo}`,
          level: 1,
          xp: 0,
          stats: {
            gamesPlayed: 0,
            gamesWon: 0,
            winRate: 0,
            avgReactionTime: 0,
            bestStreak: 0,
            totalXP: 0,
            easyWins: 0,
            mediumWins: 0,
            hardWins: 0,
          },
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        };
        
        console.log('🔍 [UserService] Creating new user with data:', newUser);
        await setDoc(userRef, newUser);
        console.log('🔍 [UserService] New user created successfully');
      } else {
        console.log('🔍 [UserService] User exists, updating lastLogin and provided data');
        // Mettre à jour la dernière connexion
        await updateDoc(userRef, {
          lastLogin: serverTimestamp(),
          ...userData
        });
        console.log('🔍 [UserService] User updated successfully');
      }
    } catch (error) {
      console.error('Erreur lors de la création/mise à jour de l\'utilisateur:', error);
      // Vérifier si c'est une erreur de permissions
      if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
        throw new Error('Permissions insuffisantes. Veuillez vérifier la configuration des règles Firestore.');
      }
      throw error;
    }
  }

  // Récupérer un utilisateur par son ID
  static async getUser(userId: string): Promise<User | null> {
    try {
      console.log('🔍 [UserService] Getting user with ID:', userId);
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const rawData = userDoc.data();
        console.log('🔍 [UserService] Raw user data from Firestore:', rawData);
        
        const userData = { id: userId, ...rawData } as User;
        
        // Fallback: si pseudo est manquant, utiliser name
        if (!userData.pseudo && userData.name) {
          userData.pseudo = userData.name;
        }
        
        console.log('🔍 [UserService] Processed user data:', userData);
        console.log('🔍 [UserService] User pseudo:', userData.pseudo);
        console.log('🔍 [UserService] User name:', userData.name);
        
        return userData;
      }
      
      console.log('🔍 [UserService] User document does not exist for ID:', userId);
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      throw error;
    }
  }

  // Mettre à jour les statistiques après une partie
  static async updateGameStats(
    userId: string, 
    gameResult: {
      won: boolean;
      difficulty: 'easy' | 'medium' | 'hard';
      attempts: number;
      timeUsed: number;
      xpGained: number;
    }
  ): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      
      const updates: any = {
        'stats.gamesPlayed': increment(1),
        'stats.totalXP': increment(gameResult.xpGained),
        xp: increment(gameResult.xpGained),
      };

      if (gameResult.won) {
        updates['stats.gamesWon'] = increment(1);
        updates[`stats.${gameResult.difficulty}Wins`] = increment(1);
      }

      await updateDoc(userRef, updates);

      // Recalculer le taux de victoire et le niveau
      await this.recalculateUserStats(userId);
    } catch (error) {
      console.error('Erreur lors de la mise à jour des stats:', error);
      throw error;
    }
  }

  // Recalculer les statistiques dérivées
  private static async recalculateUserStats(userId: string): Promise<void> {
    try {
      const user = await this.getUser(userId);
      if (!user) return;

      const winRate = user.stats.gamesPlayed > 0 
        ? user.stats.gamesWon / user.stats.gamesPlayed 
        : 0;

      const newLevel = Math.floor(user.xp / 1000) + 1;

      await updateDoc(doc(db, 'users', userId), {
        'stats.winRate': winRate,
        level: newLevel,
      });
    } catch (error) {
      console.error('Erreur lors du recalcul des stats:', error);
    }
  }

  // Récupérer le classement global
  static async getLeaderboard(limitCount: number = 10): Promise<User[]> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef, 
        orderBy('xp', 'desc'), 
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const leaderboard: User[] = [];
      
      querySnapshot.forEach((doc) => {
        leaderboard.push({ id: doc.id, ...doc.data() } as User);
      });
      
      return leaderboard;
    } catch (error) {
      console.error('Erreur lors de la récupération du classement:', error);
      throw error;
    }
  }

  // Sauvegarder une partie
  static async saveGame(
    userId: string,
    gameData: {
      difficulty: string;
      targetNumber: number;
      attempts: number;
      timeUsed: number;
      won: boolean;
      xpGained: number;
    }
  ): Promise<void> {
    try {
      const gamesRef = collection(db, 'games');
      await setDoc(doc(gamesRef), {
        userId,
        ...gameData,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la partie:', error);
      throw error;
    }
  }
}