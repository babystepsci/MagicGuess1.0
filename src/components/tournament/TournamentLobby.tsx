import React, { useState, useEffect } from 'react';
import { Trophy, Users, Clock, Star, Plus, Calendar, Award } from 'lucide-react';
import { Button } from '../ui/Button';
import { TournamentService } from '../../services/tournamentService';
import { useAuth } from '../../hooks/useAuth';
import type { Tournament } from '../../types/tournament';

interface TournamentLobbyProps {
  onJoinTournament: (tournament: Tournament) => void;
  onCreateTournament: () => void;
  onBack: () => void;
}

export function TournamentLobby({ onJoinTournament, onCreateTournament, onBack }: TournamentLobbyProps) {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [userTournaments, setUserTournaments] = useState<Tournament[]>([]);
  const [selectedTab, setSelectedTab] = useState<'available' | 'my-tournaments'>('available');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTournaments();
  }, [user]);

  const loadTournaments = async () => {
    if (!user) return;
    
    try {
      const [availableTournaments, myTournaments] = await Promise.all([
        TournamentService.getTournaments(),
        TournamentService.getUserTournaments(user.id)
      ]);
      
      setTournaments(availableTournaments.filter(t => t.status !== 'finished'));
      setUserTournaments(myTournaments);
    } catch (error) {
      console.error('Erreur lors du chargement des tournois:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (tournament: Tournament) => {
    if (!user) return;
    
    try {
      await TournamentService.registerForTournament(tournament.id, {
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        userLevel: user.level
      });
      
      await loadTournaments();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const getStatusColor = (status: Tournament['status']) => {
    switch (status) {
      case 'upcoming': return 'text-blue-400 bg-blue-500/20';
      case 'registration': return 'text-green-400 bg-green-500/20';
      case 'active': return 'text-orange-400 bg-orange-500/20';
      case 'finished': return 'text-gray-400 bg-gray-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusText = (status: Tournament['status']) => {
    switch (status) {
      case 'upcoming': return 'À venir';
      case 'registration': return 'Inscriptions ouvertes';
      case 'active': return 'En cours';
      case 'finished': return 'Terminé';
      default: return 'Inconnu';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-orange-400';
      case 'hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement des tournois...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 font-['Orbitron'] mb-4">
            🏆 Tournois Multijoueurs
          </h1>
          <p className="text-gray-300 text-lg">
            Affrontez les meilleurs joueurs dans des compétitions épiques !
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800/50 rounded-xl p-1 flex">
            <button
              onClick={() => setSelectedTab('available')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                selectedTab === 'available'
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Tournois Disponibles
            </button>
            <button
              onClick={() => setSelectedTab('my-tournaments')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                selectedTab === 'my-tournaments'
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Mes Tournois
            </button>
          </div>
        </div>

        {/* Create Tournament Button */}
        <div className="text-center mb-8">
          <Button
            onClick={onCreateTournament}
            variant="primary"
            size="lg"
            icon={Plus}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
          >
            Créer un Tournoi
          </Button>
        </div>

        {/* Tournament List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(selectedTab === 'available' ? tournaments : userTournaments).map((tournament) => {
            const isRegistered = tournament.participants.some(p => p.userId === user?.id);
            const canRegister = tournament.status === 'upcoming' || tournament.status === 'registration';
            
            return (
              <div
                key={tournament.id}
                className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-6 hover:border-gray-500 transition-all duration-300"
              >
                {/* Tournament Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Trophy className="text-yellow-400" size={24} />
                    <h3 className="text-white text-lg font-bold truncate">{tournament.name}</h3>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(tournament.status)}`}>
                    {getStatusText(tournament.status)}
                  </div>
                </div>

                {/* Tournament Info */}
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{tournament.description}</p>

                {/* Tournament Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Participants:</span>
                    <span className="text-white flex items-center">
                      <Users size={14} className="mr-1" />
                      {tournament.participants.length}/{tournament.maxParticipants}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Difficulté:</span>
                    <span className={`font-semibold capitalize ${getDifficultyColor(tournament.difficulty)}`}>
                      {tournament.difficulty}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Début:</span>
                    <span className="text-white flex items-center">
                      <Calendar size={14} className="mr-1" />
                      {formatDate(tournament.startTime)}
                    </span>
                  </div>
                  
                  {tournament.entryFee && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Frais d'entrée:</span>
                      <span className="text-yellow-400 font-semibold">{tournament.entryFee} XP</span>
                    </div>
                  )}
                </div>

                {/* Prizes */}
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4">
                  <h4 className="text-yellow-400 font-semibold mb-2 flex items-center">
                    <Award size={16} className="mr-1" />
                    Récompenses
                  </h4>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="text-yellow-400 font-bold">🥇</div>
                      <div className="text-white">{tournament.prize.winner} XP</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-300 font-bold">🥈</div>
                      <div className="text-white">{tournament.prize.runnerUp} XP</div>
                    </div>
                    <div className="text-center">
                      <div className="text-orange-400 font-bold">🏅</div>
                      <div className="text-white">{tournament.prize.participant} XP</div>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                {selectedTab === 'available' && (
                  <div>
                    {isRegistered ? (
                      <Button
                        onClick={() => onJoinTournament(tournament)}
                        variant="success"
                        size="md"
                        className="w-full"
                        disabled={tournament.status === 'finished'}
                      >
                        {tournament.status === 'active' ? 'Rejoindre' : 'Inscrit ✓'}
                      </Button>
                    ) : canRegister ? (
                      <Button
                        onClick={() => handleRegister(tournament)}
                        variant="primary"
                        size="md"
                        className="w-full"
                        disabled={tournament.participants.length >= tournament.maxParticipants}
                      >
                        {tournament.participants.length >= tournament.maxParticipants ? 'Complet' : 'S\'inscrire'}
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        size="md"
                        className="w-full"
                        disabled
                      >
                        Inscriptions fermées
                      </Button>
                    )}
                  </div>
                )}

                {selectedTab === 'my-tournaments' && (
                  <Button
                    onClick={() => onJoinTournament(tournament)}
                    variant="primary"
                    size="md"
                    className="w-full"
                    disabled={tournament.status === 'finished'}
                  >
                    {tournament.status === 'active' ? 'Continuer' : 'Voir Détails'}
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {(selectedTab === 'available' ? tournaments : userTournaments).length === 0 && (
          <div className="text-center py-12">
            <Trophy className="mx-auto mb-4 text-gray-500" size={64} />
            <h3 className="text-white text-xl font-semibold mb-2">
              {selectedTab === 'available' ? 'Aucun tournoi disponible' : 'Aucun tournoi rejoint'}
            </h3>
            <p className="text-gray-400 mb-6">
              {selectedTab === 'available' 
                ? 'Créez le premier tournoi ou revenez plus tard !' 
                : 'Inscrivez-vous à un tournoi pour commencer à jouer !'}
            </p>
            {selectedTab === 'available' && (
              <Button
                onClick={onCreateTournament}
                variant="primary"
                icon={Plus}
              >
                Créer un Tournoi
              </Button>
            )}
          </div>
        )}

        {/* Back Button */}
        <div className="text-center mt-8">
          <Button onClick={onBack} variant="secondary" size="lg">
            Retour
          </Button>
        </div>
      </div>
    </div>
  );
}