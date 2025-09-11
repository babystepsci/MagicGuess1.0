import { 
  ref, 
  push, 
  set, 
  get, 
  onValue, 
  off, 
  remove,
  update,
  serverTimestamp,
  query,
  orderByChild,
  equalTo,
  limitToLast
} from 'firebase/database';
import { realtimeDB } from '../config/firebase';
import type { Room, Player, ChatMessage, MultiplayerGameData, Tournament } from '../types/multiplayer';

export class MultiplayerService {
  // Gestion des salles
  static async createRoom(hostId: string, hostName: string, hostAvatar: string, hostLevel: number, roomData: {
    name: string;
    maxPlayers: number;
    difficulty: 'easy' | 'medium' | 'hard';
    isPrivate: boolean;
    password?: string;
  }): Promise<{ roomId: string; shortCode: string }> {
    const roomsRef = ref(realtimeDB, 'rooms');
    const newRoomRef = push(roomsRef);
    const roomId = newRoomRef.key!;
    
    // Générer un code à 4 chiffres unique
    const shortCode = Math.floor(1000 + Math.random() * 9000).toString();

    const room: Omit<Room, 'password'> & { password?: string } = {
      id: roomId,
      shortCode,
      name: roomData.name,
      hostId,
      hostName,
      players: [{
        id: hostId,
        name: hostName,
        avatar: hostAvatar,
        level: hostLevel,
        isReady: true,
        isHost: true,
        score: 0,
        attempts: 0,
        hasGuessed: false,
        isConnected: true,
        lastGuess: null,
      }],
      maxPlayers: roomData.maxPlayers,
      difficulty: roomData.difficulty,
      status: 'waiting',
      createdAt: Date.now(),
      isPrivate: roomData.isPrivate,
    };

    // Ajouter le mot de passe seulement si la salle est privée
    if (roomData.isPrivate && roomData.password) {
      room.password = roomData.password;
    }

    await set(newRoomRef, room);
    return { roomId, shortCode };
  }

  // Récupérer une salle par son ID
  static async getRoom(roomId: string): Promise<Room | null> {
    const roomRef = ref(realtimeDB, `rooms/${roomId}`);
    const snapshot = await get(roomRef);
    
    if (!snapshot.exists()) {
      return null;
    }

    return { id: roomId, ...snapshot.val() } as Room;
  }

  static async joinRoom(roomId: string, player: {
    id: string;
    name: string;
    avatar: string;
    level: number;
  }, password?: string): Promise<boolean> {
    const roomRef = ref(realtimeDB, `rooms/${roomId}`);
    const snapshot = await get(roomRef);
    
    if (!snapshot.exists()) {
      throw new Error('Salon introuvable');
    }

    const room: Room = snapshot.val();
    
    if (room.isPrivate && room.password !== password) {
      throw new Error('Mot de passe incorrect');
    }

    if (room.players.length >= room.maxPlayers) {
      throw new Error('Salon complet');
    }

    if (room.status !== 'waiting') {
      throw new Error('La partie a déjà commencé');
    }

    // Vérifier si le joueur n'est pas déjà dans la salle
    const existingPlayer = room.players.find(p => p.id === player.id);
    if (existingPlayer) {
      // Reconnecter le joueur
      await update(ref(realtimeDB, `rooms/${roomId}/players/${room.players.indexOf(existingPlayer)}`), {
        isConnected: true
      });
      return true;
    }

    const newPlayer: Player = {
      ...player,
      isReady: false,
      isHost: false,
      score: 0,
      attempts: 0,
      hasGuessed: false,
      isConnected: true,
      lastGuess: null,
    };

    room.players.push(newPlayer);
    await update(roomRef, { players: room.players });

    // Message système
    await this.sendChatMessage(roomId, {
      playerId: 'system',
      playerName: 'Système',
      message: `${player.name} a rejoint le salon`,
      type: 'system'
    });

    return true;
  }

  static async findRoomByShortCode(code: string): Promise<Room | null> {
    const roomsRef = ref(realtimeDB, 'rooms');
    const snapshot = await get(roomsRef);
    
    if (!snapshot.exists()) return null;

    let foundRoom: Room | null = null;
    snapshot.forEach((child) => {
      const room = child.val() as Room;
      if (room.shortCode === code && room.status === 'waiting') {
        foundRoom = room;
        return true; // Break the loop
      }
    });

    return foundRoom;
  }

  static async leaveRoom(roomId: string, playerId: string): Promise<void> {
    const roomRef = ref(realtimeDB, `rooms/${roomId}`);
    const snapshot = await get(roomRef);
    
    if (!snapshot.exists()) return;

    const room: Room = snapshot.val();
    const playerIndex = room.players.findIndex(p => p.id === playerId);
    
    if (playerIndex === -1) return;

    const player = room.players[playerIndex];
    
    // Si la partie est en cours, marquer comme déconnecté au lieu de supprimer
    if (room.status === 'playing') {
      player.isConnected = false;
      
      // Si c'était le joueur actif, passer au suivant
      if (room.gameData && room.gameData.activePlayerId === playerId) {
        await this.advanceTurn(roomId);
      }
      
      // Si c'est l'hôte, transférer à un autre joueur connecté
      if (player.isHost) {
        const newHost = room.players.find(p => p.id !== playerId && p.isConnected);
        if (newHost) {
          newHost.isHost = true;
          room.hostId = newHost.id;
          room.hostName = newHost.name;
        }
      }
      
      // Vérifier s'il reste des joueurs connectés
      const connectedPlayers = room.players.filter(p => p.isConnected);
      if (connectedPlayers.length === 0) {
        await remove(roomRef);
        return;
      }
      
      await update(roomRef, { 
        players: room.players,
        hostId: room.hostId,
        hostName: room.hostName
      });
      
      return;
    }
    
    // Si c'est l'hôte et qu'il y a d'autres joueurs, transférer l'hôte
    if (player.isHost && room.players.length > 1) {
      const newHost = room.players.find(p => p.id !== playerId);
      if (newHost) {
        newHost.isHost = true;
        room.hostId = newHost.id;
        room.hostName = newHost.name;
      }
    }

    // Retirer le joueur
    room.players.splice(playerIndex, 1);

    if (room.players.length === 0) {
      // Supprimer la salle si vide
      await remove(roomRef);
    } else {
      await update(roomRef, { 
        players: room.players,
        hostId: room.hostId,
        hostName: room.hostName
      });

      // Message système
      await this.sendChatMessage(roomId, {
        playerId: 'system',
        playerName: 'Système',
        message: `⏰ Tour de ${nextPlayer.name} - 15 secondes !`,
        type: 'system'
      });
    }
  }

  static async toggleReady(roomId: string, playerId: string): Promise<void> {
    const roomRef = ref(realtimeDB, `rooms/${roomId}`);
    const snapshot = await get(roomRef);
    
    if (!snapshot.exists()) return;

    const room: Room = snapshot.val();
    const player = room.players.find(p => p.id === playerId);
    
    if (!player || player.isHost) return;

    player.isReady = !player.isReady;
    await update(roomRef, { players: room.players });
  }

  static async startGame(roomId: string, hostId: string): Promise<void> {
    console.log('🔍 [MultiplayerService] startGame - début');
    console.log('🔍 [MultiplayerService] roomId:', roomId);
    console.log('🔍 [MultiplayerService] hostId:', hostId);
    
    const roomRef = ref(realtimeDB, `rooms/${roomId}`);
    const snapshot = await get(roomRef);
    
    if (!snapshot.exists()) {
      console.error('❌ [MultiplayerService] Room not found');
      throw new Error('Salon introuvable');
    }

    const room: Room = snapshot.val();
    console.log('🔍 [MultiplayerService] Room data:', {
      hostId: room.hostId,
      status: room.status,
      playersCount: room.players.length,
      players: room.players.map(p => ({ name: p.name, isReady: p.isReady, isHost: p.isHost }))
    });
    
    if (room.hostId !== hostId) {
      console.error('❌ [MultiplayerService] Not host - hostId:', room.hostId, 'requesterId:', hostId);
      throw new Error('Seul l\'hôte peut démarrer la partie');
    }

    const allReady = room.players.every(p => p.isReady || p.isHost);
    console.log('🔍 [MultiplayerService] All players ready:', allReady);
    
    if (!allReady) {
      console.error('❌ [MultiplayerService] Not all players ready');
      throw new Error('Tous les joueurs doivent être prêts');
    }

    // Générer le nombre à deviner
    const difficulties = {
      easy: { min: 1, max: 50, time: 5 },
      medium: { min: 1, max: 100, time: 5 },
      hard: { min: 1, max: 500, time: 5 }
    };

    const config = difficulties[room.difficulty];
    const targetNumber = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
    console.log('🔍 [MultiplayerService] Target number generated:', targetNumber);

    // Choisir le premier joueur actif (l'hôte)
    const firstPlayer = room.players.find(p => p.isHost) || room.players[0];
    console.log('🔍 [MultiplayerService] First player:', firstPlayer.name);

    const gameData: MultiplayerGameData = {
      targetNumber,
      startTime: Date.now(),
      timeLimit: 15 * 1000, // 15 secondes constant
      activePlayerId: firstPlayer.id,
      turnStartTime: Date.now(),
      turnTimeLimit: 15000, // 15 secondes par tour
      currentRound: 1,
      maxRounds: 1, // 1 round unique
      roundResults: []
    };

    // Réinitialiser les scores des joueurs
    room.players.forEach(player => {
      player.score = 0;
      player.attempts = 0;
      player.hasGuessed = false;
      player.guessTime = 0;
      player.lastGuess = null;
    });

    console.log('🔍 [MultiplayerService] Updating room with game data');
    await update(roomRef, {
      status: 'playing',
      gameData,
      players: room.players
    });
    console.log('🔍 [MultiplayerService] Room updated successfully');

    // Message système
    await this.sendChatMessage(roomId, {
      playerId: 'system',
      playerName: 'Système',
      message: `🎮 Partie lancée ! Nombre entre ${config.min} et ${config.max}`,
      type: 'game'
    });
    console.log('🔍 [MultiplayerService] startGame - fin avec succès');
  }

  static async makeGuess(roomId: string, playerId: string, guess: number): Promise<{
    result: 'higher' | 'lower' | 'correct';
    isWinner: boolean;
  }> {
    const roomRef = ref(realtimeDB, `rooms/${roomId}`);
    const snapshot = await get(roomRef);
    
    if (!snapshot.exists()) {
      throw new Error('Salon introuvable');
    }

    const room: Room = snapshot.val();
    
    if (room.status !== 'playing' || !room.gameData) {
      throw new Error('Aucune partie en cours');
    }

    const player = room.players.find(p => p.id === playerId);
    if (!player) {
      throw new Error('Vous n\'êtes pas dans cette partie');
    }
    
    // Vérifier si c'est le tour du joueur
    if (room.gameData.activePlayerId !== playerId) {
      throw new Error('Ce n\'est pas votre tour');
    }
    
    // Vérifier si le joueur a déjà fait sa tentative ce tour
    if (player.hasGuessed) {
      throw new Error('Vous avez déjà fait votre tentative ce tour');
    }
    
    // Vérifier le temps limite du tour
    const turnElapsed = Date.now() - (room.gameData.turnStartTime || Date.now());
    if (turnElapsed > (room.gameData.turnTimeLimit || 15000)) {
      // Passer au joueur suivant
      await this.advanceTurn(roomId);
      throw new Error('Temps écoulé pour votre tour');
    }

    const { targetNumber } = room.gameData;
    const guessTime = Date.now() - (room.gameData.turnStartTime || Date.now());
    
    player.attempts++;
    player.lastGuess = guess;
    player.hasGuessed = true; // Bloquer les tentatives supplémentaires
    player.guessTime = guessTime;
    
    let result: 'higher' | 'lower' | 'correct';
    let isWinner = false;

    if (guess === targetNumber) {
      result = 'correct';
      isWinner = true;
      
      // Calculer le score basé sur le temps et les tentatives
      const timeBonus = Math.max(0, 5000 - guessTime) / 100;
      const attemptPenalty = (player.attempts - 1) * 5;
      player.score += Math.max(10, Math.floor(100 + timeBonus - attemptPenalty));

      // Arrêter le timer et terminer le round
      room.status = 'finished';
      
      await update(roomRef, { 
        players: room.players,
        gameData: room.gameData,
        status: room.status
      });

      // Message de victoire
      await this.sendChatMessage(roomId, {
        playerId: 'system',
        playerName: 'Système',
        message: `🎉 ${player.name} a trouvé le nombre ${targetNumber} en ${(guessTime/1000).toFixed(2)}s !`,
        type: 'game'
      });

    } else {
      result = guess < targetNumber ? 'higher' : 'lower';
      
      await update(roomRef, { 
        players: room.players,
        gameData: room.gameData
      });
      
      // Message de feedback
      const feedbackMsg = result === 'higher' ? 'Trop petit' : 'Trop grand';
      await this.sendChatMessage(roomId, {
        playerId: 'system',
        playerName: 'Système',
        message: `${player.name}: ${guess} → ${feedbackMsg}`,
        type: 'game'
      });
      
      // Passer au joueur suivant après 1 seconde
      setTimeout(() => this.advanceTurn(roomId), 1000);
    }

    return { result, isWinner };
  }

  static async advanceTurn(roomId: string): Promise<void> {
    const roomRef = ref(realtimeDB, `rooms/${roomId}`);
    const snapshot = await get(roomRef);
    
    if (!snapshot.exists()) return;

    const room: Room = snapshot.val();
    if (!room.gameData || room.status !== 'playing') return;

    const connectedPlayers = room.players.filter(p => p.isConnected);
    if (connectedPlayers.length <= 1) {
      // Pas assez de joueurs connectés
      room.status = 'finished';
      await update(roomRef, { status: room.status });
      return;
    }

    // Trouver le joueur actuel et le suivant
    const currentPlayerIndex = connectedPlayers.findIndex(p => p.id === room.gameData.activePlayerId);
    const nextPlayerIndex = (currentPlayerIndex + 1) % connectedPlayers.length;
    const nextPlayer = connectedPlayers[nextPlayerIndex];

    // Réinitialiser tous les flags pour le nouveau tour
    nextPlayer.hasGuessed = false;
    nextPlayer.lastGuess = null;

    // Mettre à jour le joueur actif et réinitialiser le timer
    room.gameData.activePlayerId = nextPlayer.id;
    room.gameData.turnStartTime = Date.now();
    room.gameData.turnTimeLimit = 15000; // 15 secondes constant

    await update(roomRef, { 
      gameData: room.gameData,
      players: room.players
    });

    // Message système
    await this.sendChatMessage(roomId, {
      playerId: 'system',
      playerName: 'Système',
      message: `⏰ Tour de ${nextPlayer.name}`,
      type: 'game'
    });
  }

  // Fonction pour gérer l'expiration du temps
  static async handleTurnTimeout(roomId: string): Promise<void> {
    const roomRef = ref(realtimeDB, `rooms/${roomId}`);
    const snapshot = await get(roomRef);
    
    if (!snapshot.exists()) return;

    const room: Room = snapshot.val();
    if (!room.gameData || room.status !== 'playing') return;

    // Vérifier si le temps est vraiment écoulé
    const turnElapsed = Date.now() - room.gameData.turnStartTime;
    if (turnElapsed >= room.gameData.turnTimeLimit) {
      const activePlayer = room.players.find(p => p.id === room.gameData.activePlayerId);
      
      // Message de temps écoulé
      await this.sendChatMessage(roomId, {
        playerId: 'system',
        playerName: 'Système',
        message: `⏰ Temps écoulé pour ${activePlayer?.name}`,
        type: 'game'
      });

      // Passer au joueur suivant
      await this.advanceTurn(roomId);
    }
  }

  private static async endRound(roomId: string): Promise<void> {
    const roomRef = ref(realtimeDB, `rooms/${roomId}`);
    const snapshot = await get(roomRef);
    
    if (!snapshot.exists()) return;

    const room: Room = snapshot.val();
    if (!room.gameData) return;

    // Fin de partie immédiate (1 round unique)
    const finalWinner = room.players.reduce((prev, current) => 
      (prev.score > current.score) ? prev : current
    );

    await update(roomRef, { status: 'finished' });

    await this.sendChatMessage(roomId, {
      playerId: 'system',
      playerName: 'Système',
      message: `🏆 Partie terminée ! Gagnant : ${finalWinner.name} avec ${finalWinner.score} points !`,
      type: 'game'
    });
  }

  // Gestion du chat
  static async sendChatMessage(roomId: string, messageData: {
    playerId: string;
    playerName: string;
    message: string;
    type?: 'message' | 'system' | 'game';
  }): Promise<void> {
    const chatRef = ref(realtimeDB, `chats/${roomId}`);
    const newMessageRef = push(chatRef);

    const chatMessage: ChatMessage = {
      id: newMessageRef.key!,
      playerId: messageData.playerId,
      playerName: messageData.playerName,
      message: messageData.message,
      timestamp: Date.now(),
      type: messageData.type || 'message'
    };

    await set(newMessageRef, chatMessage);
  }

  // Récupération des salles publiques
  static async getPublicRooms(): Promise<Room[]> {
    const roomsRef = ref(realtimeDB, 'rooms');
    const publicRoomsQuery = query(roomsRef, orderByChild('isPrivate'), equalTo(false));
    const snapshot = await get(publicRoomsQuery);
    
    if (!snapshot.exists()) return [];

    const rooms: Room[] = [];
    snapshot.forEach((child) => {
      const room = child.val() as Room;
      if (room.status === 'waiting') {
        rooms.push(room);
      }
    });

    return rooms.sort((a, b) => b.createdAt - a.createdAt);
  }

  // Matchmaking automatique
  static async findMatch(playerId: string, playerName: string, playerAvatar: string, playerLevel: number, difficulty: 'easy' | 'medium' | 'hard'): Promise<string> {
    // Chercher une salle existante avec la même difficulté
    const roomsRef = ref(realtimeDB, 'rooms');
    const snapshot = await get(roomsRef);
    
    if (snapshot.exists()) {
      const rooms: Room[] = [];
      snapshot.forEach((child) => {
        const room = child.val() as Room;
        if (room.status === 'waiting' && 
            room.difficulty === difficulty && 
            !room.isPrivate &&
            room.players.length < room.maxPlayers) {
          rooms.push(room);
        }
      });

      if (rooms.length > 0) {
        // Rejoindre la première salle disponible
        const room = rooms[0];
        await this.joinRoom(room.id, {
          id: playerId,
          name: playerName,
          avatar: playerAvatar,
          level: playerLevel
        });
        return room.id;
      }
    }

    // Créer une nouvelle salle si aucune n'est disponible
    return await this.createRoom(playerId, playerName, playerAvatar, playerLevel, {
      name: `Partie ${difficulty}`,
      maxPlayers: 4,
      difficulty,
      isPrivate: false
    });
  }

  // Écouteurs en temps réel
  static onRoomUpdate(roomId: string, callback: (room: Room | null) => void): () => void {
    const roomRef = ref(realtimeDB, `rooms/${roomId}`);
    
    const unsubscribe = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val() as Room);
      } else {
        callback(null);
      }
    });

    return () => off(roomRef, 'value', unsubscribe);
  }

  static onChatUpdate(roomId: string, callback: (messages: ChatMessage[]) => void): () => void {
    const chatRef = ref(realtimeDB, `chats/${roomId}`);
    const chatQuery = query(chatRef, limitToLast(50));
    
    const unsubscribe = onValue(chatQuery, (snapshot) => {
      const messages: ChatMessage[] = [];
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          messages.push(child.val() as ChatMessage);
        });
      }
      callback(messages);
    });

    return () => off(chatRef, 'value', unsubscribe);
  }

  // Nettoyage des salles inactives
  static async cleanupInactiveRooms(): Promise<void> {
    const roomsRef = ref(realtimeDB, 'rooms');
    const snapshot = await get(roomsRef);
    
    if (!snapshot.exists()) return;

    const now = Date.now();
    const inactiveThreshold = 30 * 60 * 1000; // 30 minutes

    const updates: { [key: string]: null } = {};

    snapshot.forEach((child) => {
      const room = child.val() as Room;
      const isInactive = (now - room.createdAt) > inactiveThreshold;
      const hasNoConnectedPlayers = room.players.every(p => !p.isConnected);
      
      if (isInactive || hasNoConnectedPlayers) {
        updates[`rooms/${child.key}`] = null;
        updates[`chats/${child.key}`] = null;
      }
    });

    if (Object.keys(updates).length > 0) {
      await update(ref(realtimeDB), updates);
    }
  }
}