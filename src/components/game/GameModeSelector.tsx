import React from 'react';
import { User, Users, ArrowLeft, Map, Trophy } from 'lucide-react';
import { Button } from '../ui/Button';
import { useLocale } from '../../hooks/useLocale';

interface GameModeSelectorProps {
  onSelectSolo: () => void;
  onSelectMultiplayer: () => void;
  onSelectCampaign: () => void;
  onSelectTournament: () => void;
  onBack: () => void;
}

export function GameModeSelector({ onSelectSolo, onSelectMultiplayer, onSelectCampaign, onSelectTournament, onBack }: GameModeSelectorProps) {
  const { t } = useLocale();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 font-['Orbitron'] mb-4">
            {t.game.selectGameMode}
          </h1>
          <p className="text-gray-300 text-lg md:text-xl">
            {t.game.selectModeDescription}
          </p>
        </div>

        {/* Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Solo Mode */}
          <div
            className="group relative overflow-hidden bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-3xl p-8 hover:border-gray-500 transition-all duration-300 cursor-pointer transform hover:scale-105"
            onClick={onSelectSolo}
          >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500 opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
            
            {/* Content */}
            <div className="relative z-10">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 mb-4">
                  <User size={40} className="text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">{t.game.soloMode}</h3>
                <p className="text-gray-400">{t.game.soloDescription}</p>
              </div>

              <div className="space-y-3 text-center">
                <div className="bg-white/10 rounded-lg p-3">
                  <span className="text-gray-300 text-sm">Mode de Jeu</span>
                  <div className="text-white font-mono text-lg">Contre l'IA</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <span className="text-gray-300 text-sm">Difficulté</span>
                  <div className="text-white font-mono text-lg">3 Niveaux</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <span className="text-gray-300 text-sm">Progression</span>
                  <div className="text-white font-mono text-lg">XP & Niveaux</div>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  onClick={onSelectSolo}
                  variant="primary"
                  className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600"
                  size="lg"
                >
                  Jouer en {t.game.soloMode}
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

          {/* Campaign Mode */}
          <div
            className="group relative overflow-hidden bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-3xl p-8 hover:border-gray-500 transition-all duration-300 cursor-pointer transform hover:scale-105"
            onClick={onSelectCampaign}
          >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-400 to-purple-500 opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
            
            {/* Content */}
            <div className="relative z-10">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 mb-4">
                  <Map size={40} className="text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">Campagne</h3>
                <p className="text-gray-400">Aventure narrative avec défis progressifs</p>
              </div>

              <div className="space-y-3 text-center">
                <div className="bg-white/10 rounded-lg p-3">
                  <span className="text-gray-300 text-sm">Mode de Jeu</span>
                  <div className="text-white font-mono text-lg">Histoire</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <span className="text-gray-300 text-sm">Niveaux</span>
                  <div className="text-white font-mono text-lg">8 Défis</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <span className="text-gray-300 text-sm">Progression</span>
                  <div className="text-white font-mono text-lg">XP & Badges</div>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  onClick={onSelectCampaign}
                  variant="primary"
                  className="w-full bg-gradient-to-r from-violet-400 to-purple-500 hover:from-violet-500 hover:to-purple-600"
                  size="lg"
                >
                  Jouer la Campagne
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

          {/* Tournament Mode */}
          <div
            className="group relative overflow-hidden bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-3xl p-8 hover:border-gray-500 transition-all duration-300 cursor-pointer transform hover:scale-105"
            onClick={onSelectTournament}
          >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
            
            {/* Content */}
            <div className="relative z-10">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mb-4">
                  <Trophy size={40} className="text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">Tournois</h3>
                <p className="text-gray-400">Compétitions épiques avec récompenses</p>
              </div>

              <div className="space-y-3 text-center">
                <div className="bg-white/10 rounded-lg p-3">
                  <span className="text-gray-300 text-sm">Mode de Jeu</span>
                  <div className="text-white font-mono text-lg">Élimination</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <span className="text-gray-300 text-sm">Participants</span>
                  <div className="text-white font-mono text-lg">4-32 Joueurs</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <span className="text-gray-300 text-sm">Récompenses</span>
                  <div className="text-white font-mono text-lg">XP & Trophées</div>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  onClick={onSelectTournament}
                  variant="primary"
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
                  size="lg"
                >
                  Rejoindre Tournois
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

          {/* Multiplayer Mode */}
          <div
            className="group relative overflow-hidden bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-3xl p-8 hover:border-gray-500 transition-all duration-300 cursor-pointer transform hover:scale-105"
            onClick={onSelectMultiplayer}
          >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-500 opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
            
            {/* Content */}
            <div className="relative z-10">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 mb-4">
                  <Users size={40} className="text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">{t.game.multiplayerMode}</h3>
                <p className="text-gray-400">{t.game.multiplayerDescription}</p>
              </div>

              <div className="space-y-3 text-center">
                <div className="bg-white/10 rounded-lg p-3">
                  <span className="text-gray-300 text-sm">Mode de Jeu</span>
                  <div className="text-white font-mono text-lg">En Ligne</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <span className="text-gray-300 text-sm">Joueurs</span>
                  <div className="text-white font-mono text-lg">2-8 Joueurs</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <span className="text-gray-300 text-sm">Fonctionnalités</span>
                  <div className="text-white font-mono text-lg">Chat & Classement</div>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  onClick={onSelectMultiplayer}
                  variant="primary"
                  className="w-full bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600"
                  size="lg"
                >
                  Jouer en {t.game.multiplayerMode}
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
            Retour au Menu Principal
          </Button>
        </div>
      </div>
    </div>
  );
}