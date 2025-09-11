import React from 'react';
import { X, Trophy, Target, Zap, Award, TrendingUp } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { UserService } from '../../services/userService';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = React.useState<any[]>([]);

  if (!isOpen || !user) return null;

  const badges = [
    { name: 'First Win', icon: Trophy, earned: true, color: 'text-yellow-400' },
    { name: 'Speed Demon', icon: Zap, earned: user.stats.avgReactionTime < 5, color: 'text-blue-400' },
    { name: 'Precision Master', icon: Target, earned: user.stats.winRate > 0.8, color: 'text-green-400' },
    { name: 'Streak Legend', icon: TrendingUp, earned: user.stats.bestStreak > 10, color: 'text-purple-400' },
  ];

  React.useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const leaders = await UserService.getLeaderboard(10);
        setLeaderboard(leaders);
      } catch (error) {
        console.error('Erreur lors du chargement du classement:', error);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-gray-900/95 backdrop-blur-xl rounded-3xl p-8 max-w-2xl w-full border border-gray-700/50 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <img
            src={user.avatar}
            alt={user.pseudo}
            className="w-24 h-24 rounded-full border-4 border-purple-400 mx-auto mb-4"
          />
          <h2 className="text-2xl md:text-3xl font-bold text-white">{user.pseudo}</h2>
          <p className="text-gray-400">{user.email}</p>
          <div className="flex items-center justify-center space-x-4 mt-4">
            <div className="bg-purple-500/20 px-4 py-2 rounded-full">
              <span className="text-purple-400 font-semibold">Level {user.level}</span>
            </div>
            <div className="bg-yellow-500/20 px-4 py-2 rounded-full">
              <span className="text-yellow-400 font-semibold">{user.xp.toLocaleString()} XP</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-cyan-400">{user.stats.gamesPlayed}</div>
            <div className="text-gray-400 text-sm">Games Played</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{user.stats.gamesWon}</div>
            <div className="text-gray-400 text-sm">Games Won</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{Math.round(user.stats.winRate * 100)}%</div>
            <div className="text-gray-400 text-sm">Win Rate</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{user.stats.bestStreak}</div>
            <div className="text-gray-400 text-sm">Best Streak</div>
          </div>
        </div>

        {/* Difficulty Breakdown */}
        <div className="mb-8">
          <h3 className="text-white text-xl font-semibold mb-4">Difficulty Stats</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
              <div className="text-lg font-bold text-green-400">{user.stats.easyWins}</div>
              <div className="text-gray-400 text-sm">Easy Wins</div>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 text-center">
              <div className="text-lg font-bold text-orange-400">{user.stats.mediumWins}</div>
              <div className="text-gray-400 text-sm">Medium Wins</div>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
              <div className="text-lg font-bold text-red-400">{user.stats.hardWins}</div>
              <div className="text-gray-400 text-sm">Hard Wins</div>
            </div>
          </div>
        </div>

        {/* Campaign Progress */}
        {campaignStats && (
          <div className="mb-8">
            <h3 className="text-white text-xl font-semibold mb-4">Progression Campagne</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4 text-center">
                <div className="text-lg font-bold text-violet-400">{campaignStats.completedLevels}/{campaignStats.totalLevels}</div>
                <div className="text-gray-400 text-sm">Niveaux Complétés</div>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 text-center">
                <div className="text-lg font-bold text-purple-400">{campaignStats.completionPercentage}%</div>
                <div className="text-gray-400 text-sm">Progression</div>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-center">
                <div className="text-lg font-bold text-yellow-400">{campaignStats.totalXpEarned}</div>
                <div className="text-gray-400 text-sm">XP Campagne</div>
              </div>
              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 text-center">
                <div className="text-lg font-bold text-cyan-400">{campaignStats.averageAttempts}</div>
                <div className="text-gray-400 text-sm">Moy. Tentatives</div>
              </div>
            </div>
            
            {/* Campaign Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm">Progression Campagne</span>
                <span className="text-white text-sm">{campaignStats.completionPercentage}%</span>
              </div>
              <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-400 to-purple-400 rounded-full transition-all duration-500"
                  style={{ width: `${campaignStats.completionPercentage}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="mb-8">
          <h3 className="text-white text-xl font-semibold mb-4 flex items-center">
            <Award className="mr-2" size={24} />
            Achievements
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {badges.map((badge, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border-2 text-center transition-all duration-200 ${
                  badge.earned
                    ? 'bg-gray-800/50 border-gray-600'
                    : 'bg-gray-900/50 border-gray-700 opacity-50'
                }`}
              >
                <badge.icon 
                  size={32} 
                  className={`mx-auto mb-2 ${badge.earned ? badge.color : 'text-gray-600'}`} 
                />
                <div className={`font-semibold ${badge.earned ? 'text-white' : 'text-gray-500'}`}>
                  {badge.name}
                </div>
                {badge.earned && (
                  <div className="text-green-400 text-xs mt-1">✓ Earned</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard Preview */}
        <div className="mb-8">
          <h3 className="text-white text-xl font-semibold mb-4">Classement Global</h3>
          <div className="bg-gray-800/50 rounded-xl p-4 max-h-48 overflow-y-auto">
            {leaderboard.map((leader, index) => (
              <div key={leader.id} className={`flex items-center justify-between py-2 ${
                leader.id === user.id ? 'bg-purple-500/20 rounded-lg px-2' : ''
              }`}>
                <div className="flex items-center space-x-3">
                  <span className={`text-lg font-bold ${
                    index === 0 ? 'text-yellow-400' : 
                    index === 1 ? 'text-gray-300' : 
                    index === 2 ? 'text-orange-400' : 'text-gray-400'
                  }`}>#{index + 1}</span>
                  <img src={leader.avatar} alt={leader.name} className="w-8 h-8 rounded-full" />
                  <span className="text-white">{leader.name}</span>
                </div>
                <span className="text-cyan-400 font-semibold">{leader.xp.toLocaleString()} XP</span>
              </div>
            ))}
          </div>
        </div>

        {/* XP Progress */}
        <div>
          <h3 className="text-white text-xl font-semibold mb-4">Level Progress</h3>
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Level {user.level}</span>
              <span className="text-gray-400">Level {user.level + 1}</span>
            </div>
            <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${((user.xp % 1000) / 1000) * 100}%` }}
              />
            </div>
            <div className="text-center mt-2 text-gray-400 text-sm">
              {user.xp % 1000} / 1000 XP to next level
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}