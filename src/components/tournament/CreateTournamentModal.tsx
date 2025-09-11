import React, { useState } from 'react';
import { X, Trophy, Users, Clock, Award, Zap, Flame, Skull } from 'lucide-react';
import { Button } from '../ui/Button';
import { TournamentService } from '../../services/tournamentService';
import { useAuth } from '../../hooks/useAuth';

interface CreateTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTournamentCreated: (tournamentId: string) => void;
}

export function CreateTournamentModal({ isOpen, onClose, onTournamentCreated }: CreateTournamentModalProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startTime: '',
    duration: 2, // heures
    maxParticipants: 8,
    entryFee: 0,
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    timeLimit: 15,
    maxAttempts: 0, // 0 = illimité
    specialRules: [] as string[],
    prizes: {
      winner: 1000,
      runnerUp: 500,
      participant: 100
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    
    try {
      const startTime = new Date(formData.startTime).getTime();
      
      const tournamentId = await TournamentService.createTournament(user.id, {
        name: formData.name,
        description: formData.description,
        startTime,
        duration: formData.duration,
        maxParticipants: formData.maxParticipants,
        entryFee: formData.entryFee > 0 ? formData.entryFee : undefined,
        difficulty: formData.difficulty,
        prize: formData.prizes,
        rules: {
          timeLimit: formData.timeLimit,
          maxAttempts: formData.maxAttempts > 0 ? formData.maxAttempts : undefined,
          specialRules: formData.specialRules.length > 0 ? formData.specialRules : undefined
        }
      });

      onTournamentCreated(tournamentId);
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        startTime: '',
        duration: 2,
        maxParticipants: 8,
        entryFee: 0,
        difficulty: 'medium',
        timeLimit: 15,
        maxAttempts: 0,
        specialRules: [],
        prizes: {
          winner: 1000,
          runnerUp: 500,
          participant: 100
        }
      });
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
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

  const toggleSpecialRule = (rule: string) => {
    setFormData(prev => ({
      ...prev,
      specialRules: prev.specialRules.includes(rule)
        ? prev.specialRules.filter(r => r !== rule)
        : [...prev.specialRules, rule]
    }));
  };

  if (!isOpen) return null;

  // Date minimum = maintenant + 1 heure
  const minDateTime = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16);

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
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 font-['Orbitron']">
            Créer un Tournoi
          </h2>
          <p className="text-gray-400 mt-2">
            Organisez votre propre compétition épique !
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-semibold mb-2">
                Nom du Tournoi
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Tournoi des Champions"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 outline-none transition-all duration-200 text-white"
                required
                maxLength={50}
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Participants Max
              </label>
              <select
                value={formData.maxParticipants}
                onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) }))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 outline-none transition-all duration-200 text-white"
              >
                <option value={4}>4 Joueurs</option>
                <option value={8}>8 Joueurs</option>
                <option value={16}>16 Joueurs</option>
                <option value={32}>32 Joueurs</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-white font-semibold mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Décrivez votre tournoi..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 outline-none transition-all duration-200 text-white resize-none"
              rows={3}
              maxLength={200}
            />
          </div>

          {/* Timing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-semibold mb-2">
                Date et Heure de Début
              </label>
              <input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                min={minDateTime}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 outline-none transition-all duration-200 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Durée (heures)
              </label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 outline-none transition-all duration-200 text-white"
              >
                <option value={1}>1 heure</option>
                <option value={2}>2 heures</option>
                <option value={4}>4 heures</option>
                <option value={8}>8 heures</option>
              </select>
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-white font-semibold mb-2">
              Difficulté
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
                    {difficulty}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Game Rules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-semibold mb-2">
                Temps par Tour (secondes)
              </label>
              <input
                type="number"
                value={formData.timeLimit}
                onChange={(e) => setFormData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) }))}
                min={5}
                max={60}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 outline-none transition-all duration-200 text-white"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Tentatives Max (0 = illimité)
              </label>
              <input
                type="number"
                value={formData.maxAttempts}
                onChange={(e) => setFormData(prev => ({ ...prev, maxAttempts: parseInt(e.target.value) }))}
                min={0}
                max={10}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 outline-none transition-all duration-200 text-white"
              />
            </div>
          </div>

          {/* Entry Fee */}
          <div>
            <label className="block text-white font-semibold mb-2">
              Frais d'Entrée (XP) - 0 = Gratuit
            </label>
            <input
              type="number"
              value={formData.entryFee}
              onChange={(e) => setFormData(prev => ({ ...prev, entryFee: parseInt(e.target.value) }))}
              min={0}
              max={5000}
              step={50}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 outline-none transition-all duration-200 text-white"
            />
          </div>

          {/* Prizes */}
          <div>
            <label className="block text-white font-semibold mb-2">
              Récompenses (XP)
            </label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">🥇 Gagnant</label>
                <input
                  type="number"
                  value={formData.prizes.winner}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    prizes: { ...prev.prizes, winner: parseInt(e.target.value) }
                  }))}
                  min={100}
                  max={10000}
                  step={100}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:border-yellow-400 outline-none text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">🥈 Finaliste</label>
                <input
                  type="number"
                  value={formData.prizes.runnerUp}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    prizes: { ...prev.prizes, runnerUp: parseInt(e.target.value) }
                  }))}
                  min={50}
                  max={5000}
                  step={50}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:border-gray-400 outline-none text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">🏅 Participation</label>
                <input
                  type="number"
                  value={formData.prizes.participant}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    prizes: { ...prev.prizes, participant: parseInt(e.target.value) }
                  }))}
                  min={10}
                  max={1000}
                  step={10}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:border-orange-400 outline-none text-white text-sm"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
            disabled={isLoading || !formData.name || !formData.startTime}
            icon={Trophy}
          >
            {isLoading ? 'Création...' : 'Créer le Tournoi'}
          </Button>
        </form>
      </div>
    </div>
  );
}