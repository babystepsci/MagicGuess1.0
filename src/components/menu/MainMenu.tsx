import React from 'react';
import { Play, User, Settings, LogOut, Trophy, Zap } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { useLocale } from '../../hooks/useLocale';

interface MainMenuProps {
  onPlay: () => void;
  onProfile: () => void;
  onSettings: () => void;
}

export function MainMenu({ onPlay, onProfile, onSettings }: MainMenuProps) {
  const { user, logout } = useAuth();
  const { t } = useLocale();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col justify-center">
        {/* User Header */}
        {user && (
          <div className="absolute top-4 right-4 flex items-center space-x-3">
            <div className="text-right min-w-0">
              <p className="text-white font-semibold text-sm max-w-[100px] truncate">{user.pseudo}</p>
              <p className="text-gray-400 text-sm flex items-center">
                <Trophy size={12} className="mr-1 flex-shrink-0" />
                <span className="truncate">{t.menu.level} {user.level}</span>
              </p>
            </div>
            <img
              src={user.avatar}
              alt={user.pseudo}
              className="w-10 h-10 rounded-full border-2 border-purple-400 flex-shrink-0"
            />
            <Button
              onClick={logout}
              variant="secondary"
              size="sm"
              icon={LogOut}
              className="text-xs px-2 py-1"
            >
              {t.menu.logout}
            </Button>
          </div>
        )}

        <div className="text-center">
          {/* Logo */}
          <div className="mb-12">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 font-['Orbitron'] animate-pulse mb-4">
              magic<span className="text-yellow-400">Guess</span>
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-gray-300 font-light px-4">
              {t.menu.ultimateExperience}
            </p>
          </div>

          {/* Menu Buttons */}
          <div className="max-w-md mx-auto space-y-4">
            <Button
              onClick={onPlay}
              variant="primary"
              size="lg"
              icon={Play}
              className="w-full text-lg md:text-xl py-4 md:py-6 shadow-2xl shadow-purple-500/25"
            >
              {t.menu.play}
            </Button>
            
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={onProfile}
                variant="secondary"
                size="lg"
                icon={User}
                className="text-base md:text-lg py-3 md:py-4"
              >
                {t.menu.profile}
              </Button>
              <Button
                onClick={onSettings}
                variant="secondary"
                size="lg"
                icon={Settings}
                className="text-base md:text-lg py-3 md:py-4"
              >
                {t.menu.settings}
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          {user && (
            <div className="mt-8 max-w-2xl mx-auto px-4">
              <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-gray-700/50">
                <h3 className="text-white text-base md:text-lg font-semibold mb-4 flex items-center justify-center">
                  <Zap className="mr-2" size={20} />
                  {t.menu.yourStats}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
                  <div className="text-center">
                    <div className="text-lg md:text-2xl font-bold text-cyan-400">{user.stats.gamesPlayed}</div>
                    <div className="text-gray-400 text-xs md:text-sm">{t.menu.gamesPlayed}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg md:text-2xl font-bold text-green-400">{user.stats.gamesWon}</div>
                    <div className="text-gray-400 text-xs md:text-sm">{t.menu.gamesWon}</div>
                  </div>
                  <div className="text-center md:col-span-1 col-span-2">
                    <div className="text-lg md:text-2xl font-bold text-green-400">{Math.round(user.stats.winRate * 100)}%</div>
                    <div className="text-gray-400 text-xs md:text-sm">{t.menu.winRate}</div>
                  </div>
                  <div className="text-center hidden md:block">
                    <div className="text-lg md:text-2xl font-bold text-yellow-400">{user.stats.bestStreak}</div>
                    <div className="text-gray-400 text-xs md:text-sm">{t.menu.bestStreak}</div>
                  </div>
                  <div className="text-center hidden lg:block">
                    <div className="text-lg md:text-2xl font-bold text-purple-400">{user.stats.avgReactionTime.toFixed(1)}s</div>
                    <div className="text-gray-400 text-xs md:text-sm">{t.menu.avgTime}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Version */}
          <div className="mt-8 text-gray-500 text-sm">
            {t.menu.version}
          </div>
        </div>
      </div>
    </div>
  );
}