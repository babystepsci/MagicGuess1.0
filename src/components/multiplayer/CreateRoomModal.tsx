import React, { useState } from 'react';
import { X, Users, Lock, Globe, Zap, Flame, Skull } from 'lucide-react';
import { Button } from '../ui/Button';
import { useMultiplayer } from '../../hooks/MultiplayerProvider'; // Updated import path
import { useLocale } from '../../hooks/useLocale';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoomCreated: (roomId: string) => void;
}

export function CreateRoomModal({ isOpen, onClose, onRoomCreated }: CreateRoomModalProps) {
  const { createRoom, isLoading, error } = useMultiplayer();
  const { t } = useLocale();
  const [createdRoom, setCreatedRoom] = useState<{ roomId: string; shortCode: string } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    maxPlayers: 4,
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    isPrivate: false,
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) return;

    const roomData = {
      ...formData,
      name: formData.name.trim(),
      password: formData.isPrivate ? formData.password : undefined,
    };

    const result = await createRoom(roomData);
    if (result) {
      setCreatedRoom(result);
      // Réinitialiser le formulaire
      setFormData({
        name: '',
        maxPlayers: 4,
        difficulty: 'medium',
        isPrivate: false,
        password: '',
      });
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return <Zap className="text-green-400" size={20} />;
      case 'medium': return <Flame className="text-orange-400" size={20} />;
      case 'hard': return <Skull className="text-red-400" size={20} />;
      default: return null;
    }
  };

  const handleJoinCreatedRoom = () => {
    if (createdRoom) {
      onRoomCreated(createdRoom.roomId);
      setCreatedRoom(null);
      onClose();
    }
  };

  const handleCloseModal = () => {
    setCreatedRoom(null);
    onClose();
  };

  // Si une salle a été créée, afficher le code
  if (createdRoom) {
    return <RoomCreatedModal 
      shortCode={createdRoom.shortCode} 
      onJoin={handleJoinCreatedRoom}
      onClose={handleCloseModal}
    />;
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseModal} />
      
      {/* Modal */}
      <div className="relative bg-gray-900/95 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full border border-gray-700/50 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={handleCloseModal}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 font-['Orbitron']">
            {t.multiplayer.createRoom}
          </h2>
          <p className="text-gray-400 mt-2">
            {t.multiplayer.createRoomDescription}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Room Name */}
          <div>
            <label className="block text-white font-semibold mb-2">
              {t.multiplayer.roomName}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder={t.multiplayer.enterRoomName}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 outline-none transition-all duration-200 text-white"
              required
              maxLength={30}
            />
          </div>

          {/* Max Players */}
          <div>
            <label className="block text-white font-semibold mb-2">
              {t.multiplayer.maxPlayers}
            </label>
            <select
              value={formData.maxPlayers}
              onChange={(e) => setFormData(prev => ({ ...prev, maxPlayers: parseInt(e.target.value) }))}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 outline-none transition-all duration-200 text-white"
            >
              <option value={2}>2 {t.multiplayer.players}</option>
              <option value={3}>3 {t.multiplayer.players}</option>
              <option value={4}>4 {t.multiplayer.players}</option>
              <option value={6}>6 {t.multiplayer.players}</option>
              <option value={8}>8 {t.multiplayer.players}</option>
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-white font-semibold mb-2">
              {t.multiplayer.difficulty}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'medium', 'hard'] as const).map((difficulty) => (
                <button
                  key={difficulty}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, difficulty }))}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center space-y-2 ${
                    formData.difficulty === difficulty
                      ? 'border-purple-400 bg-purple-500/20'
                      : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                  }`}
                >
                  {getDifficultyIcon(difficulty)}
                  <span className="text-white text-sm capitalize">
                    {t.game[difficulty]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Privacy Settings */}
          <div>
            <label className="block text-white font-semibold mb-2">
              {t.multiplayer.privacy}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, isPrivate: false, password: '' }))}
                className={`p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center space-y-2 ${
                  !formData.isPrivate
                    ? 'border-green-400 bg-green-500/20'
                    : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                }`}
              >
                <Globe className="text-green-400" size={20} />
                <span className="text-white text-sm">{t.multiplayer.public}</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, isPrivate: true }))}
                className={`p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center space-y-2 ${
                  formData.isPrivate
                    ? 'border-yellow-400 bg-yellow-500/20'
                    : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                }`}
              >
                <Lock className="text-yellow-400" size={20} />
                <span className="text-white text-sm">{t.multiplayer.private}</span>
              </button>
            </div>
          </div>

          {/* Password (if private) */}
          {formData.isPrivate && (
            <div>
              <label className="block text-white font-semibold mb-2">
                {t.multiplayer.password}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder={t.multiplayer.enterPassword}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 outline-none transition-all duration-200 text-white"
                required={formData.isPrivate}
                maxLength={20}
              />
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={isLoading || !formData.name.trim()}
            icon={Users}
          >
            {isLoading ? t.multiplayer.creating : t.multiplayer.createRoom}
          </Button>
        </form>
      </div>
    </div>
  );
}

interface RoomCreatedModalProps {
  shortCode: string;
  onJoin: () => void;
  onClose: () => void;
}

function RoomCreatedModal({ shortCode, onJoin, onClose }: RoomCreatedModalProps) {
  const { t } = useLocale();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-gray-900/95 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full border border-gray-700/50 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 font-['Orbitron']">
            Salle Créée !
          </h2>
          <p className="text-gray-400 mt-2">
            Partagez ce code avec vos amis
          </p>
        </div>

        {/* Code Display */}
        <div className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border-2 border-purple-400/50 rounded-2xl p-8 mb-8 text-center">
          <p className="text-gray-300 mb-2">Code de la salle</p>
          <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 font-mono tracking-wider">
            {shortCode}
          </div>
          <p className="text-gray-400 text-sm mt-2">
            Les autres joueurs peuvent rejoindre avec ce code
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-white/5 rounded-xl p-4 mb-6">
          <h3 className="text-white font-semibold mb-2">Instructions :</h3>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>• Partagez le code <span className="font-mono text-cyan-400">{shortCode}</span> avec vos amis</li>
            <li>• Ils peuvent rejoindre via "Rejoindre par code"</li>
            <li>• Vous devez être sur le même réseau Wi-Fi</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <Button
            onClick={onJoin}
            variant="primary"
            size="lg"
            className="flex-1"
            icon={Users}
          >
            {t.multiplayer.accessLobby}
          </Button>
          <Button
            onClick={onClose}
            variant="secondary"
            size="lg"
            className="flex-1"
          >
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
}