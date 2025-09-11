import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { MultiplayerService } from '../services/multiplayerService';
import { useAuth } from './useAuth';
import type { Room, Player, ChatMessage } from '../types/multiplayer';

interface MultiplayerContextType {
  currentRoom: Room | null;
  currentPlayer: Player | null;
  chatMessages: ChatMessage[];
  publicRooms: Room[];
  isLoading: boolean;
  error: string | null;
  createRoom: (roomData: { name: string; maxPlayers: number; difficulty: 'easy' | 'medium' | 'hard'; isPrivate: boolean; password?: string; }) => Promise<{ roomId: string; shortCode: string } | null>;
  joinRoom: (roomId: string, password?: string) => Promise<boolean>;
  joinRoomByCode: (code: string, password?: string) => Promise<boolean>;
  leaveRoom: () => Promise<void>;
  toggleReady: () => Promise<void>;
  startGame: () => Promise<void>;
  makeGuess: (guess: number) => Promise<{ result: 'higher' | 'lower' | 'correct'; isWinner: boolean; } | null>;
  sendChatMessage: (message: string) => Promise<void>;
  findMatch: (difficulty: 'easy' | 'medium' | 'hard') => Promise<string | null>;
  loadPublicRooms: () => Promise<void>;
  clearError: () => void;
}

const MultiplayerContext = createContext<MultiplayerContextType | null>(null);

export function useMultiplayer() {
  const context = useContext(MultiplayerContext);
  if (!context) {
    throw new Error('useMultiplayer must be used within MultiplayerProvider');
  }
  return context;
}

export function MultiplayerProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [publicRooms, setPublicRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Rejoindre une salle par code
  const joinRoomByCode = useCallback(async (code: string, password?: string) => {
    if (!user) return false;

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔍 [MultiplayerProvider] Joining room by code:', code);
      const room = await MultiplayerService.findRoomByShortCode(code);
      console.log('🔍 [MultiplayerProvider] Found room by code:', room);
      if (!room) {
        setError('Aucune salle trouvée avec ce code');
        return false;
      }

      await MultiplayerService.joinRoom(room.id, {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        level: user.level
      }, password);
      console.log('🔍 [MultiplayerProvider] Successfully joined room');
      
      const updatedRoom = await MultiplayerService.getRoom(room.id);
      console.log('🔍 [MultiplayerProvider] Retrieved updated room details:', updatedRoom);
      if (updatedRoom) {
        console.log('🔍 [MultiplayerProvider] Setting currentRoom directly:', updatedRoom);
        setCurrentRoom(updatedRoom);
        setCurrentRoomId(updatedRoom.id);
      }
      
      return true;
    } catch (error: any) {
      console.error('🔍 [MultiplayerProvider] Error joining room by code:', error);
      setError(error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Créer une salle
  const createRoom = useCallback(async (roomData: {
    name: string;
    maxPlayers: number;
    difficulty: 'easy' | 'medium' | 'hard';
    isPrivate: boolean;
    password?: string;
  }): Promise<{ roomId: string; shortCode: string } | null> => {
    if (!user) return null;

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔍 [MultiplayerProvider] Creating room with data:', roomData);
      const result = await MultiplayerService.createRoom(
        user.id,
        user.name,
        user.avatar,
        user.level,
        roomData
      );
      console.log('🔍 [MultiplayerProvider] Room created, result:', result);
      
      const room = await MultiplayerService.getRoom(result.roomId);
      console.log('🔍 [MultiplayerProvider] Retrieved room details:', room);
      if (room) {
        console.log('🔍 [MultiplayerProvider] Setting currentRoom directly:', room);
        setCurrentRoom(room);
        setCurrentRoomId(room.id);
      }
      
      return result;
    } catch (error: any) {
      console.error('🔍 [MultiplayerProvider] Error creating room:', error);
      setError(error.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Rejoindre une salle
  const joinRoom = useCallback(async (roomId: string, password?: string) => {
    if (!user) return false;

    setIsLoading(true);
    setError(null);

    try {
      await MultiplayerService.joinRoom(roomId, {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        level: user.level
      }, password);
      
      const room = await MultiplayerService.getRoom(roomId);
      if (room) {
        console.log('🔍 [MultiplayerProvider] Setting currentRoom directly:', room);
        setCurrentRoom(room);
        setCurrentRoomId(room.id);
      }
      
      return true;
    } catch (error: any) {
      setError(error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Quitter une salle
  const leaveRoom = useCallback(async () => {
    if (!user || !currentRoomId) return;

    try {
      await MultiplayerService.leaveRoom(currentRoomId, user.id);
      console.log('🔍 [MultiplayerProvider] Leaving room, setting currentRoom to null');
      setCurrentRoom(null);
      setCurrentRoomId(null);
      setChatMessages([]);
    } catch (error: any) {
      setError(error.message);
    }
  }, [user, currentRoomId]);

  // Basculer l'état prêt
  const toggleReady = useCallback(async () => {
    if (!user || !currentRoomId) return;

    try {
      await MultiplayerService.toggleReady(currentRoomId, user.id);
    } catch (error: any) {
      setError(error.message);
    }
  }, [user, currentRoomId]);

  // Démarrer la partie
  const startGame = useCallback(async () => {
    console.log('🔍 [MultiplayerProvider] startGame appelé');
    console.log('🔍 [MultiplayerProvider] user:', user?.id);
    console.log('🔍 [MultiplayerProvider] currentRoomId:', currentRoomId);
    
    if (!user || !currentRoomId) return;

    setError(null);
    
    try {
      console.log('🔍 [MultiplayerProvider] Appel MultiplayerService.startGame');
      const result = await MultiplayerService.startGame(currentRoomId, user.id);
      console.log('🔍 [MultiplayerProvider] startGame réussi:', result);
    } catch (error: any) {
      console.error('❌ [MultiplayerProvider] Erreur startGame:', error);
      setError(error.message);
    }
  }, [user, currentRoomId]);

  // Faire une estimation
  const makeGuess = useCallback(async (guess: number) => {
    if (!user || !currentRoomId) return null;

    try {
      return await MultiplayerService.makeGuess(currentRoomId, user.id, guess);
    } catch (error: any) {
      setError(error.message);
      return null;
    }
  }, [user, currentRoomId]);

  // Envoyer un message de chat
  const sendChatMessage = useCallback(async (message: string) => {
    if (!user || !currentRoomId || !message.trim()) return;

    try {
      await MultiplayerService.sendChatMessage(currentRoomId, {
        playerId: user.id,
        playerName: user.name,
        message: message.trim()
      });
    } catch (error: any) {
      setError(error.message);
    }
  }, [user, currentRoomId]);

  // Matchmaking automatique
  const findMatch = useCallback(async (difficulty: 'easy' | 'medium' | 'hard') => {
    if (!user) return null;

    setIsLoading(true);
    setError(null);

    try {
      const roomId = await MultiplayerService.findMatch(
        user.id,
        user.name,
        user.avatar,
        user.level,
        difficulty
      );
      
      if (roomId) {
        const room = await MultiplayerService.getRoom(roomId);
        if (room) {
          console.log('🔍 [MultiplayerProvider] Setting currentRoom directly:', room);
          setCurrentRoom(room);
          setCurrentRoomId(room.id);
        }
      }
      
      return roomId;
    } catch (error: any) {
      setError(error.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Charger les salles publiques
  const loadPublicRooms = useCallback(async () => {
    try {
      const rooms = await MultiplayerService.getPublicRooms();
      setPublicRooms(rooms);
    } catch (error: any) {
      setError(error.message);
    }
  }, []);

  // Écouter les mises à jour de la salle
  useEffect(() => {
    if (!currentRoomId) return;

    // Timer pour gérer l'expiration des tours
    let turnTimer: NodeJS.Timeout;

    const unsubscribeRoom = MultiplayerService.onRoomUpdate(currentRoomId, (room) => {
      if (room) {
        setCurrentRoom(room);
        
        // Gérer le timer de tour
        if (room.status === 'playing' && room.gameData) {
          const turnTimeLeft = Math.max(0, room.gameData.turnStartTime + (room.gameData.turnTimeLimit || 5000) - Date.now());
          
          if (turnTimeLeft > 0) {
            clearTimeout(turnTimer);
            turnTimer = setTimeout(() => {
              MultiplayerService.handleTurnTimeout(currentRoomId);
            }, turnTimeLeft);
          }
        }
      } else {
        console.log('🔍 [MultiplayerProvider] Room deleted, setting currentRoom to null');
        setCurrentRoom(null);
        setCurrentRoomId(null);
        setChatMessages([]);
        setError('La salle a été fermée');
      }
    });

    const unsubscribeChat = MultiplayerService.onChatUpdate(currentRoomId, (messages) => {
      setChatMessages(messages);
    });

    return () => {
      clearTimeout(turnTimer);
      unsubscribeRoom();
      unsubscribeChat();
    };
  }, [currentRoomId]);

  // Nettoyage automatique des salles inactives
  useEffect(() => {
    const interval = setInterval(() => {
      MultiplayerService.cleanupInactiveRooms();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const currentPlayer = currentRoom?.players.find(p => p.id === user?.id) || null;

  const contextValue = {
    currentRoom,
    currentPlayer,
    chatMessages,
    publicRooms,
    isLoading,
    error,
    createRoom,
    joinRoom,
    joinRoomByCode,
    leaveRoom,
    toggleReady,
    startGame,
    makeGuess,
    sendChatMessage,
    findMatch,
    loadPublicRooms,
    clearError: () => setError(null),
  };

  return (
    <MultiplayerContext.Provider value={contextValue}>
      {children}
    </MultiplayerContext.Provider>
  );
}