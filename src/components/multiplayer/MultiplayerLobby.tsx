import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Lock, Globe, Zap, Flame, Skull } from 'lucide-react';
import { Button } from '../ui/Button';
import { useMultiplayer } from '../../hooks/MultiplayerProvider'; // Updated import path
import { useLocale } from '../../hooks/useLocale';
import type { Room } from '../../types/multiplayer';

interface MultiplayerLobbyProps {
  onJoinRoom: () => void;
  onCreateRoom: () => void;
  onBack: () => void;
}

export function MultiplayerLobby({ onJoinRoom, onCreateRoom, onBack }: MultiplayerLobbyProps) {
  const { publicRooms, loadPublicRooms, findMatch, joinRoomByCode, isLoading } = useMultiplayer();
  const { t } = useLocale();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [joinCode, setJoinCode] = useState('');
  const [showJoinByCode, setShowJoinByCode] = useState(false);

  useEffect(() => {
    loadPublicRooms();
    const interval = setInterval(loadPublicRooms, 5000); // Actualiser toutes les 5 secondes
    return () => clearInterval(interval);
  }, [loadPublicRooms]);

  const filteredRooms = publicRooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.hostName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'all' || room.difficulty === selectedDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  const handleQuickMatch = async (difficulty: 'easy' | 'medium' | 'hard') => {
    const roomId = await findMatch(difficulty);
    if (roomId) {
      console.log('🔍 [MultiplayerLobby] Quick match found, room ID:', roomId);
      onJoinRoom();
    }
  };

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.length === 4) {
      const success = await joinRoomByCode(joinCode);
      if (success) {
        console.log('🔍 [MultiplayerLobby] Joined room by code successfully');
        onJoinRoom();
        setJoinCode('');
        setShowJoinByCode(false);
      }
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return <Zap className="text-green-400" size={16} />;
      case 'medium': return <Flame className="text-orange-400" size={16} />;
      case 'hard': return <Skull className="text-red-400" size={16} />;
      default: return null;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'border-green-500/20 bg-green-500/10';
      case 'medium': return 'border-orange-500/20 bg-orange-500/10';
      case 'hard': return 'border-red-500/20 bg-red-500/10';
      default: return 'border-gray-500/20 bg-gray-500/10';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 font-['Orbitron'] mb-4">
            {t.multiplayer.onlineMode}
          </h1>
          <p className="text-gray-300 text-base md:text-lg">
            Affrontez des joueurs du monde entier
          </p>
        </div>

        {/* Quick Match Section */}
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-gray-700/50 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
            <Zap className="mr-2" size={24} />
            {t.multiplayer.quickMatch}
          </h2>
          <p className="text-gray-400 mb-6">{t.multiplayer.quickMatchDescription}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => handleQuickMatch('easy')}
              variant="success"
              size="lg"
              icon={Zap}
              disabled={isLoading}
              className="w-full"
            >
              {t.game.easy}
            </Button>
            <Button
              onClick={() => handleQuickMatch('medium')}
              variant="primary"
              size="lg"
              icon={Flame}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
            >
              {t.game.medium}
            </Button>
            <Button
              onClick={() => handleQuickMatch('hard')}
              variant="danger"
              size="lg"
              icon={Skull}
              disabled={isLoading}
              className="w-full"
            >
              {t.game.hard}
            </Button>
          </div>
        </div>

        {/* Room Browser */}
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-gray-700/50 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-4 md:mb-0 flex items-center">
              <Users className="mr-2" size={24} />
              Salles Publiques
            </h2>
            
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto">
              <Button
                onClick={onCreateRoom}
                variant="primary"
                icon={Plus}
                className="w-full md:w-auto"
              >
                {t.multiplayer.createRoom}
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={t.multiplayer.searchRooms}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 outline-none transition-all duration-200 text-white"
              />
            </div>
            
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value as any)}
              className="px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 outline-none transition-all duration-200 text-white"
            >
              <option value="all">{t.multiplayer.allDifficulties}</option>
              <option value="easy">{t.game.easy}</option>
              <option value="medium">{t.game.medium}</option>
              <option value="hard">{t.game.hard}</option>
            </select>
          </div>

          {/* Rooms List */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredRooms.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto mb-4 text-gray-500" size={48} />
                <p className="text-gray-400 text-lg">
                  {searchTerm || selectedDifficulty !== 'all' 
                    ? t.multiplayer.noRoomsFound 
                    : t.multiplayer.noRoomsAvailable}
                </p>
                <p className="text-gray-500 mt-2">
                  {t.multiplayer.createFirstRoom}
                </p>
              </div>
            ) : (
              filteredRooms.map((room) => (
                <div
                  key={room.id}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] cursor-pointer ${getDifficultyColor(room.difficulty)}`}
                  onClick={async () => {
                    console.log('🔍 [MultiplayerLobby] Attempting to join room:', room.id);
                    const success = await joinRoom(room.id);
                    if (success) {
                      console.log('🔍 [MultiplayerLobby] Successfully joined room');
                      onJoinRoom();
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {room.isPrivate ? (
                          <Lock className="text-yellow-400" size={20} />
                        ) : (
                          <Globe className="text-green-400" size={20} />
                        )}
                        {getDifficultyIcon(room.difficulty)}
                      </div>
                      
                      <div>
                        <h3 className="text-white font-semibold text-lg">{room.name}</h3>
                        <p className="text-gray-400">
                          {t.multiplayer.hostedBy} {room.hostName}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-white font-semibold">
                        {room.players.length}/{room.maxPlayers}
                      </div>
                      <div className="text-gray-400 text-sm capitalize">
                        {t.game[room.difficulty as keyof typeof t.game]}
                      </div>
                    </div>
                  </div>
                  
                  {/* Players Preview */}
                  <div className="flex items-center space-x-2 mt-3">
                    {room.players.slice(0, 4).map((player, index) => (
                      <img
                        key={player.id}
                        src={player.avatar}
                        alt={player.name}
                        className="w-8 h-8 rounded-full border-2 border-gray-600"
                        title={player.name}
                      />
                    ))}
                    {room.players.length > 4 && (
                      <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-600 flex items-center justify-center text-xs text-gray-300">
                        +{room.players.length - 4}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <Button onClick={onBack} variant="secondary" size="lg">
            Retour
          </Button>
        </div>
      </div>
    </div>
  );
}