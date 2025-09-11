import React, { useState } from 'react';
import { Wifi, Plus, Search, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { useMultiplayer } from '../../hooks/MultiplayerProvider'; // Updated import path
import { useLocale } from '../../hooks/useLocale';

interface LocalMultiplayerLobbyProps {
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onBack: () => void;
}

export function LocalMultiplayerLobby({ onCreateRoom, onJoinRoom, onBack }: LocalMultiplayerLobbyProps) {
  const { joinRoomByCode, isLoading, error } = useMultiplayer();
  const { t } = useLocale();
  const [joinCode, setJoinCode] = useState('');
  const [showJoinForm, setShowJoinForm] = useState(false);

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.length === 4) {
      const success = await joinRoomByCode(joinCode);
      if (success) {
        onJoinRoom(); // La salle est maintenant définie dans le hook
        setJoinCode('');
        setShowJoinForm(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 mb-6">
            <Wifi size={32} className="text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-4 font-['Orbitron']">
            Mode Local
          </h1>
          <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto">
            {t.multiplayer.connectDirectly}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl max-w-md mx-auto">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Main Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-3xl mx-auto">
          {/* Create Game Card */}
          <div
            className="group relative overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg border-2 border-purple-400/30 rounded-3xl p-8 hover:border-purple-400/50 transition-all duration-300 cursor-pointer transform hover:scale-105"
            onClick={onCreateRoom}
          >
            {/* Background Animation */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 mb-6">
                <Plus size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                {t.multiplayer.createGame}
              </h3>
              <p className="text-gray-300 mb-6">
                {t.multiplayer.becomeHost}
              </p>
              <div className="bg-white/10 rounded-lg p-3 mb-6">
                <span className="text-gray-300 text-sm">Vous obtiendrez un</span>
                <div className="text-white font-mono text-lg font-bold">Code à 4 chiffres</div>
              </div>
              <Button
                onClick={onCreateRoom}
                variant="primary"
                className="w-full bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600"
                size="lg"
                disabled={isLoading}
              >
                Créer une Partie
              </Button>
            </div>

            {/* Hover Particles */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-purple-400 rounded-full animate-pulse"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${1 + Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Join Game Card */}
          <div
            className="group relative overflow-hidden bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-lg border-2 border-cyan-400/30 rounded-3xl p-8 hover:border-cyan-400/50 transition-all duration-300 cursor-pointer transform hover:scale-105"
            onClick={() => setShowJoinForm(!showJoinForm)}
          >
            {/* Background Animation */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 mb-6">
                <Search size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                {t.multiplayer.findGame}
              </h3>
              <p className="text-gray-300 mb-6">
                {t.multiplayer.findHost}
              </p>
              <div className="bg-white/10 rounded-lg p-3 mb-6">
                <span className="text-gray-300 text-sm">Entrez le</span>
                <div className="text-white font-mono text-lg font-bold">Code à 4 chiffres</div>
              </div>
              <Button
                onClick={() => setShowJoinForm(!showJoinForm)}
                variant="primary"
                className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600"
                size="lg"
              >
                {showJoinForm ? 'Masquer' : 'Rechercher'}
              </Button>
            </div>

            {/* Hover Particles */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${1 + Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Join Form */}
        {showJoinForm && (
          <div className="max-w-md mx-auto mb-8">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
              <h3 className="text-white text-xl font-semibold mb-4 text-center">
                {t.multiplayer.enterGameCode}
              </h3>
              <form onSubmit={handleJoinByCode} className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="1234"
                    className="w-full px-6 py-4 text-3xl font-mono text-center bg-gray-800 border-2 border-gray-600 rounded-xl focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 outline-none transition-all duration-200 text-white tracking-widest"
                    maxLength={4}
                    autoFocus
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-xl pointer-events-none" />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600"
                  size="lg"
                  disabled={joinCode.length !== 4 || isLoading}
                  icon={Search}
                >
                  {isLoading ? 'Recherche...' : 'Rejoindre la Partie'}
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
            <h3 className="text-white text-lg font-semibold mb-4 text-center">
              Comment ça marche ?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="text-center">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2">1</div>
                <p className="text-gray-300">
                  <strong className="text-white">Créer :</strong> L'hôte crée une partie et reçoit un code
                </p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2">2</div>
                <p className="text-gray-300">
                  <strong className="text-white">Rejoindre :</strong> L'autre joueur entre le code pour rejoindre
                </p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-yellow-300 text-xs text-center">
                ⚠️ Les deux appareils doivent être connectés au même réseau Wi-Fi
              </p>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <Button onClick={onBack} variant="secondary" size="lg" icon={ArrowLeft}>
            Retour
          </Button>
        </div>
      </div>
    </div>
  );
}