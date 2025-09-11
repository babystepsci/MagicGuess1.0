import React from 'react';
import { Wifi, Globe, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { useLocale } from '../../hooks/useLocale';

interface MultiplayerTypeSelectorProps {
  onSelectLocal: () => void;
  onSelectOnline: () => void;
  onBack: () => void;
}

export function MultiplayerTypeSelector({ onSelectLocal, onSelectOnline, onBack }: MultiplayerTypeSelectorProps) {
  const { t } = useLocale();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 font-['Orbitron'] mb-4">
            {t.multiplayer.multiplayerMode}
          </h1>
          <p className="text-gray-300 text-lg md:text-xl">
            {t.multiplayer.selectMultiplayerType}
          </p>
        </div>

        {/* Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Local Mode */}
          <div
            className="group relative overflow-hidden bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-3xl p-8 hover:border-gray-500 transition-all duration-300 cursor-pointer transform hover:scale-105"
            onClick={onSelectLocal}
          >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-500 opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
            
            {/* Content */}
            <div className="relative z-10">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 mb-4">
                  <Wifi size={40} className="text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">{t.multiplayer.localMode}</h3>
                <p className="text-gray-400">{t.multiplayer.localModeDescription}</p>
              </div>

              <div className="space-y-3 text-center">
                <div className="bg-white/10 rounded-lg p-3">
                  <span className="text-gray-300 text-sm">Connexion</span>
                  <div className="text-white font-mono text-lg">Wi-Fi Local</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <span className="text-gray-300 text-sm">Joueurs</span>
                  <div className="text-white font-mono text-lg">2 Joueurs</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <span className="text-gray-300 text-sm">Code</span>
                  <div className="text-white font-mono text-lg">4 Chiffres</div>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  onClick={onSelectLocal}
                  variant="primary"
                  className="w-full bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600"
                  size="lg"
                >
                  Jouer en {t.multiplayer.localMode}
                </Button>
              </div>
            </div>

            {/* Hover Animation */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
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

          {/* Online Mode */}
          <div
            className="group relative overflow-hidden bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-3xl p-8 hover:border-gray-500 transition-all duration-300 cursor-pointer transform hover:scale-105"
            onClick={onSelectOnline}
          >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500 opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
            
            {/* Content */}
            <div className="relative z-10">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 mb-4">
                  <Globe size={40} className="text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">{t.multiplayer.onlineMode}</h3>
                <p className="text-gray-400">{t.multiplayer.onlineModeDescription}</p>
              </div>

              <div className="space-y-3 text-center">
                <div className="bg-white/10 rounded-lg p-3">
                  <span className="text-gray-300 text-sm">Connexion</span>
                  <div className="text-white font-mono text-lg">Internet</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <span className="text-gray-300 text-sm">Joueurs</span>
                  <div className="text-white font-mono text-lg">2-8 Joueurs</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <span className="text-gray-300 text-sm">Matchmaking</span>
                  <div className="text-white font-mono text-lg">Automatique</div>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  onClick={onSelectOnline}
                  variant="primary"
                  className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600"
                  size="lg"
                >
                  Jouer en {t.multiplayer.onlineMode}
                </Button>
              </div>
            </div>

            {/* Hover Animation */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
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

        {/* Back Button */}
        <div className="text-center">
          <Button onClick={onBack} variant="secondary" size="lg" icon={ArrowLeft}>
            {t.game.backToModeSelection}
          </Button>
        </div>
      </div>
    </div>
  );
}