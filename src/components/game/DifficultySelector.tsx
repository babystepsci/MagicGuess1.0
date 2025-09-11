import React from 'react';
import { Zap, Flame, Skull } from 'lucide-react';
import { Button } from '../ui/Button';
import { DIFFICULTIES } from '../../config/difficulties';
import type { DifficultyConfig } from '../../types/game';
import { useLocale } from '../../hooks/useLocale';

interface DifficultySelectorProps {
  onSelect: (difficulty: string) => void;
  onMultiplayer: () => void;
  onBack: () => void;
}

export function DifficultySelector({ onSelect, onMultiplayer, onBack }: DifficultySelectorProps) {
  const { t } = useLocale();
  
  const difficultyIcons = {
    easy: Zap,
    medium: Flame,
    hard: Skull,
  };

  const difficultyDescriptions = {
    easy: 'Perfect for beginners',
    medium: 'A balanced challenge',
    hard: 'For the brave souls',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 font-['Orbitron'] mb-4">
            Choose Your Challenge
          </h1>
          <p className="text-gray-300 text-lg md:text-xl">
            Select your difficulty level and test your guessing skills
          </p>
        </div>

        {/* Difficulty Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {Object.entries(DIFFICULTIES).map(([key, config]: [string, DifficultyConfig]) => {
            const Icon = difficultyIcons[key as keyof typeof difficultyIcons];
            return (
              <div
                key={key}
                className="group relative overflow-hidden bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-3xl p-8 hover:border-gray-500 transition-all duration-300 cursor-pointer transform hover:scale-105"
                onClick={() => onSelect(key)}
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${config.theme.gradient} opacity-20 group-hover:opacity-30 transition-opacity duration-300`} />
                
                {/* Content */}
                <div className="relative z-10">
                  <div className="text-center mb-6">
                    <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${config.theme.gradient} mb-4`}>
                      <Icon size={40} className="text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-2">{config.name}</h3>
                    <p className="text-gray-400">{difficultyDescriptions[key as keyof typeof difficultyDescriptions]}</p>
                  </div>

                  <div className="space-y-3 text-center">
                    <div className="bg-white/10 rounded-lg p-3">
                      <span className="text-gray-300 text-sm">Range</span>
                      <div className="text-white font-mono text-lg">
                        {config.range.min} - {config.range.max}
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <span className="text-gray-300 text-sm">Time Limit</span>
                      <div className="text-white font-mono text-lg">{config.timeLimit}s</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <span className="text-gray-300 text-sm">XP Multiplier</span>
                      <div className="text-white font-mono text-lg">×{config.xpMultiplier}</div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button
                      onClick={() => onSelect(key)}
                      variant="primary"
                      className="w-full"
                      size="lg"
                    >
                      Start {config.name} Game
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
            );
          })}
        </div>

        {/* Back Button */}
        <div className="text-center">
          <div className="flex justify-center space-x-4">
            <Button onClick={onMultiplayer} variant="primary" size="lg">
              {t.multiplayer.multiplayerLobby}
            </Button>
            <Button onClick={onBack} variant="secondary" size="lg">
              {t.game.backToModeSelection}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}