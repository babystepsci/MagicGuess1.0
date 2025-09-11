import React, { useState, useEffect } from 'react';
import { ArrowLeft, Lock, Star, Trophy, Clock, Target, Zap } from 'lucide-react';
import { Button } from '../ui/Button';
import { CampaignService } from '../../services/campaignService';
import { useAuth } from '../../hooks/useAuth';
import type { CampaignLevel } from '../../types/campaign';

interface CampaignMapProps {
  onSelectLevel: (level: CampaignLevel) => void;
  onBack: () => void;
}

export function CampaignMap({ onSelectLevel, onBack }: CampaignMapProps) {
  const { user } = useAuth();
  const [levels, setLevels] = useState<{
    unlocked: CampaignLevel[];
    locked: CampaignLevel[];
    completed: CampaignLevel[];
  }>({ unlocked: [], locked: [], completed: [] });
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCampaignData = async () => {
      if (!user) return;
      
      try {
        const [availableLevels, campaignStats] = await Promise.all([
          CampaignService.getAvailableLevels(user.id),
          CampaignService.getCampaignStats(user.id)
        ]);
        
        setLevels(availableLevels);
        setStats(campaignStats);
      } catch (error) {
        console.error('Erreur lors du chargement de la campagne:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCampaignData();
  }, [user]);

  const getLevelStatus = (level: CampaignLevel) => {
    if (levels.completed.some(l => l.id === level.id)) return 'completed';
    if (levels.unlocked.some(l => l.id === level.id)) return 'unlocked';
    return 'locked';
  };

  const getLevelIcon = (level: CampaignLevel) => {
    const status = getLevelStatus(level);
    
    if (status === 'completed') return <Star className="text-yellow-400" size={20} />;
    if (status === 'locked') return <Lock className="text-gray-500" size={20} />;
    
    // Icônes spéciales selon les règles
    if (level.specialRules?.blindMode) return <div className="text-gray-800 text-xl">👁️</div>;
    if (level.specialRules?.evenOnly) return <div className="text-blue-400 text-xl">2️⃣</div>;
    if (level.specialRules?.multiplesOf) return <div className="text-pink-400 text-xl">✖️</div>;
    if (level.specialRules?.noRepeats) return <div className="text-red-400 text-xl">🚫</div>;
    if (level.maxAttempts) return <Target className="text-purple-400" size={20} />;
    if (level.timeLimit <= 15) return <Zap className="text-orange-400" size={20} />;
    
    return <Trophy className="text-cyan-400" size={20} />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement de la campagne...</p>
        </div>
      </div>
    );
  }

  const allLevels = [...levels.completed, ...levels.unlocked, ...levels.locked];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button onClick={onBack} variant="secondary" icon={ArrowLeft}>
            Retour
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 font-['Orbitron']">
            Mode Campagne
          </h1>
          <div className="w-24"></div> {/* Spacer */}
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 mb-8">
            <h2 className="text-white text-xl font-semibold mb-4 flex items-center">
              <Trophy className="mr-2" size={24} />
              Progression de la Campagne
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">{stats.completedLevels}/{stats.totalLevels}</div>
                <div className="text-gray-400 text-sm">Niveaux Complétés</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{stats.completionPercentage}%</div>
                <div className="text-gray-400 text-sm">Progression</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{stats.totalXpEarned}</div>
                <div className="text-gray-400 text-sm">XP Gagnés</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{stats.averageAttempts}</div>
                <div className="text-gray-400 text-sm">Moy. Tentatives</div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full transition-all duration-500"
                  style={{ width: `${stats.completionPercentage}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Campaign Levels */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allLevels.map((level, index) => {
            const status = getLevelStatus(level);
            const isClickable = status !== 'locked';
            
            return (
              <div
                key={level.id}
                className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
                  status === 'completed' 
                    ? 'border-yellow-400/50 bg-yellow-500/10' 
                    : status === 'unlocked'
                    ? 'border-cyan-400/50 bg-cyan-500/10 hover:border-cyan-400 cursor-pointer transform hover:scale-105'
                    : 'border-gray-600/50 bg-gray-800/30 opacity-60'
                }`}
                onClick={() => isClickable && onSelectLevel(level)}
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${level.theme.background} opacity-20`} />
                
                {/* Content */}
                <div className="relative z-10 p-6">
                  {/* Level Number & Status */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        status === 'completed' ? 'bg-yellow-400 text-black' :
                        status === 'unlocked' ? 'bg-cyan-400 text-black' :
                        'bg-gray-600 text-gray-300'
                      }`}>
                        {index + 1}
                      </div>
                      {getLevelIcon(level)}
                    </div>
                    
                    {status === 'completed' && (
                      <div className="flex items-center space-x-1 text-yellow-400 text-sm">
                        <Star size={16} />
                        <span>Complété</span>
                      </div>
                    )}
                  </div>

                  {/* Level Info */}
                  <h3 className="text-white text-lg font-bold mb-2">{level.name}</h3>
                  <p className="text-gray-300 text-sm mb-4">{level.description}</p>
                  
                  {/* Story Preview */}
                  <div className="bg-black/30 rounded-lg p-3 mb-4">
                    <p className="text-gray-400 text-xs italic">"{level.story}"</p>
                  </div>

                  {/* Level Details */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center space-x-1">
                      <Target size={12} className="text-gray-400" />
                      <span className="text-gray-300">{level.range.min}-{level.range.max}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock size={12} className="text-gray-400" />
                      <span className="text-gray-300">{level.timeLimit}s</span>
                    </div>
                    {level.maxAttempts && (
                      <div className="flex items-center space-x-1">
                        <Zap size={12} className="text-gray-400" />
                        <span className="text-gray-300">{level.maxAttempts} tent.</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <Trophy size={12} className="text-gray-400" />
                      <span className="text-gray-300">{level.xpReward} XP</span>
                    </div>
                  </div>

                  {/* Special Rules */}
                  {level.specialRules && (
                    <div className="mt-3 p-2 bg-purple-500/20 rounded-lg">
                      <div className="text-purple-300 text-xs font-semibold mb-1">Règles Spéciales:</div>
                      <div className="text-purple-200 text-xs">
                        {level.specialRules.evenOnly && "• Nombres pairs uniquement"}
                        {level.specialRules.oddOnly && "• Nombres impairs uniquement"}
                        {level.specialRules.multiplesOf && `• Multiples de ${level.specialRules.multiplesOf}`}
                        {level.specialRules.noRepeats && "• Pas de répétition"}
                        {level.specialRules.blindMode && "• Mode aveugle (pas d'indices)"}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  {status === 'unlocked' && (
                    <Button
                      onClick={() => onSelectLevel(level)}
                      variant="primary"
                      size="sm"
                      className="w-full mt-4"
                    >
                      Commencer
                    </Button>
                  )}
                  
                  {status === 'completed' && (
                    <Button
                      onClick={() => onSelectLevel(level)}
                      variant="secondary"
                      size="sm"
                      className="w-full mt-4"
                    >
                      Rejouer
                    </Button>
                  )}
                  
                  {status === 'locked' && (
                    <div className="mt-4 text-center">
                      <div className="text-gray-500 text-sm">Niveau verrouillé</div>
                    </div>
                  )}
                </div>

                {/* Locked Overlay */}
                {status === 'locked' && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Lock className="text-gray-400" size={32} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}