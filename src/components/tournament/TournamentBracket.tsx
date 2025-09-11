import React, { useState, useEffect } from 'react';
import { Trophy, Users, Clock, Play, Crown, Target } from 'lucide-react';
import { Button } from '../ui/Button';
import { TournamentService } from '../../services/tournamentService';
import { useAuth } from '../../hooks/useAuth';
import type { Tournament, TournamentBracket as TournamentBracketType } from '../../types/tournament';

interface TournamentBracketProps {
  tournament: Tournament;
  onJoinMatch: (roomId: string) => void;
  onBack: () => void;
}

export function TournamentBracket({ tournament, onJoinMatch, onBack }: TournamentBracketProps) {
  const { user } = useAuth();
  const [currentTournament, setCurrentTournament] = useState<Tournament>(tournament);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Actualiser les données du tournoi périodiquement
    const interval = setInterval(async () => {
      try {
        const tournaments = await TournamentService.getTournaments();
        const updated = tournaments.find(t => t.id === tournament.id);
        if (updated) {
          setCurrentTournament(updated);
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour du tournoi:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [tournament.id]);

  const handleJoinMatch = async (bracket: TournamentBracketType) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      let roomId = bracket.roomId;
      
      if (!roomId) {
        // Créer la salle pour ce match
        roomId = await TournamentService.createTournamentMatch(tournament.id, bracket.id);
      }
      
      onJoinMatch(roomId);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const isPlayerInMatch = (bracket: TournamentBracketType) => {
    return bracket.player1.userId === user?.id || bracket.player2.userId === user?.id;
  };

  const getMatchStatus = (bracket: TournamentBracketType) => {
    if (bracket.status === 'completed') return 'Terminé';
    if (bracket.status === 'active') return 'En cours';
    if (bracket.round === currentTournament.currentRound) return 'Prêt';
    return 'En attente';
  };

  const getMatchStatusColor = (bracket: TournamentBracketType) => {
    if (bracket.status === 'completed') return 'text-green-400 bg-green-500/20';
    if (bracket.status === 'active') return 'text-orange-400 bg-orange-500/20';
    if (bracket.round === currentTournament.currentRound) return 'text-blue-400 bg-blue-500/20';
    return 'text-gray-400 bg-gray-500/20';
  };

  const groupBracketsByRound = () => {
    const rounds: { [key: number]: TournamentBracketType[] } = {};
    
    currentTournament.brackets.forEach(bracket => {
      if (!rounds[bracket.round]) {
        rounds[bracket.round] = [];
      }
      rounds[bracket.round].push(bracket);
    });
    
    return rounds;
  };

  const rounds = groupBracketsByRound();
  const maxRound = Math.max(...Object.keys(rounds).map(Number));

  const getRoundName = (round: number) => {
    const totalRounds = maxRound;
    if (round === totalRounds) return 'Finale';
    if (round === totalRounds - 1) return 'Demi-finale';
    if (round === totalRounds - 2) return 'Quart de finale';
    return `Round ${round}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPlayerRank = (userId: string) => {
    const participant = currentTournament.participants.find(p => p.userId === userId);
    if (!participant) return 0;
    
    const sortedParticipants = [...currentTournament.participants]
      .sort((a, b) => b.currentScore - a.currentScore);
    
    return sortedParticipants.findIndex(p => p.userId === userId) + 1;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 font-['Orbitron'] mb-4">
            🏆 {currentTournament.name}
          </h1>
          <p className="text-gray-300 text-lg mb-4">{currentTournament.description}</p>
          
          {/* Tournament Info */}
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <div className="bg-gray-800/50 px-4 py-2 rounded-full">
              <span className="text-gray-400">Statut: </span>
              <span className="text-white font-semibold">
                {currentTournament.status === 'active' ? 'En cours' : 
                 currentTournament.status === 'finished' ? 'Terminé' : 'À venir'}
              </span>
            </div>
            <div className="bg-gray-800/50 px-4 py-2 rounded-full">
              <span className="text-gray-400">Round: </span>
              <span className="text-white font-semibold">{currentTournament.currentRound}/{maxRound}</span>
            </div>
            <div className="bg-gray-800/50 px-4 py-2 rounded-full">
              <span className="text-gray-400">Participants: </span>
              <span className="text-white font-semibold">{currentTournament.participants.length}</span>
            </div>
          </div>
        </div>

        {/* Tournament Status */}
        {currentTournament.status === 'finished' && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-6 mb-8 text-center">
            <Trophy className="mx-auto mb-4 text-yellow-400" size={48} />
            <h2 className="text-2xl font-bold text-yellow-400 mb-2">Tournoi Terminé !</h2>
            {(() => {
              const winner = currentTournament.participants.find(p => p.status === 'winner');
              return winner ? (
                <p className="text-white text-lg">
                  🎉 Félicitations à <span className="font-bold text-yellow-400">{winner.userName}</span> !
                </p>
              ) : null;
            })()}
          </div>
        )}

        {/* Brackets */}
        <div className="space-y-8">
          {Object.entries(rounds)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([roundNum, brackets]) => (
              <div key={roundNum} className="bg-gray-800/30 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
                <h3 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center">
                  <Target className="mr-2" size={24} />
                  {getRoundName(parseInt(roundNum))}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {brackets.map((bracket) => (
                    <div
                      key={bracket.id}
                      className={`bg-gray-800/50 border rounded-xl p-4 transition-all duration-300 ${
                        isPlayerInMatch(bracket) 
                          ? 'border-purple-400 bg-purple-500/10' 
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      {/* Match Header */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-400 text-sm">Match {bracket.match}</span>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getMatchStatusColor(bracket)}`}>
                          {getMatchStatus(bracket)}
                        </div>
                      </div>

                      {/* Players */}
                      <div className="space-y-3 mb-4">
                        {/* Player 1 */}
                        <div className={`flex items-center space-x-3 p-3 rounded-lg ${
                          bracket.winner === bracket.player1.userId 
                            ? 'bg-green-500/20 border border-green-500/30' 
                            : 'bg-gray-700/50'
                        }`}>
                          <img
                            src={bracket.player1.userAvatar}
                            alt={bracket.player1.userName}
                            className="w-8 h-8 rounded-full"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-white font-semibold">{bracket.player1.userName}</span>
                              {bracket.winner === bracket.player1.userId && (
                                <Crown className="text-yellow-400" size={16} />
                              )}
                            </div>
                            <span className="text-gray-400 text-sm">Niveau {bracket.player1.userLevel}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-bold">#{getPlayerRank(bracket.player1.userId)}</div>
                            <div className="text-gray-400 text-xs">{bracket.player1.currentScore} pts</div>
                          </div>
                        </div>

                        {/* VS */}
                        <div className="text-center">
                          <span className="text-gray-400 font-bold">VS</span>
                        </div>

                        {/* Player 2 */}
                        <div className={`flex items-center space-x-3 p-3 rounded-lg ${
                          bracket.winner === bracket.player2.userId 
                            ? 'bg-green-500/20 border border-green-500/30' 
                            : 'bg-gray-700/50'
                        }`}>
                          <img
                            src={bracket.player2.userAvatar}
                            alt={bracket.player2.userName}
                            className="w-8 h-8 rounded-full"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-white font-semibold">{bracket.player2.userName}</span>
                              {bracket.winner === bracket.player2.userId && (
                                <Crown className="text-yellow-400" size={16} />
                              )}
                            </div>
                            <span className="text-gray-400 text-sm">Niveau {bracket.player2.userLevel}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-bold">#{getPlayerRank(bracket.player2.userId)}</div>
                            <div className="text-gray-400 text-xs">{bracket.player2.currentScore} pts</div>
                          </div>
                        </div>
                      </div>

                      {/* Match Info */}
                      {bracket.gameData && (
                        <div className="bg-gray-700/30 rounded-lg p-3 mb-4">
                          <div className="text-center text-sm">
                            <div className="text-gray-400">Nombre à deviner: <span className="text-white font-bold">{bracket.gameData.targetNumber}</span></div>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <div>
                                <div className="text-gray-400">Tentatives</div>
                                <div className="text-white">{bracket.gameData.player1Attempts} vs {bracket.gameData.player2Attempts}</div>
                              </div>
                              <div>
                                <div className="text-gray-400">Temps</div>
                                <div className="text-white">{(bracket.gameData.player1Time/1000).toFixed(1)}s vs {(bracket.gameData.player2Time/1000).toFixed(1)}s</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      {isPlayerInMatch(bracket) && bracket.status !== 'completed' && (
                        <Button
                          onClick={() => handleJoinMatch(bracket)}
                          variant="primary"
                          size="md"
                          className="w-full"
                          disabled={isLoading || bracket.round !== currentTournament.currentRound}
                          icon={Play}
                        >
                          {bracket.status === 'active' ? 'Rejoindre Match' : 'Commencer Match'}
                        </Button>
                      )}

                      {/* Match Time */}
                      {bracket.startTime && (
                        <div className="text-center mt-2">
                          <span className="text-gray-400 text-xs flex items-center justify-center">
                            <Clock size={12} className="mr-1" />
                            {formatDate(bracket.startTime)}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>

        {/* Participants List */}
        <div className="mt-8 bg-gray-800/30 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
          <h3 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center">
            <Users className="mr-2" size={24} />
            Classement des Participants
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...currentTournament.participants]
              .sort((a, b) => b.currentScore - a.currentScore)
              .map((participant, index) => (
                <div
                  key={participant.userId}
                  className={`flex items-center space-x-3 p-4 rounded-xl border transition-all duration-300 ${
                    participant.userId === user?.id
                      ? 'border-purple-400 bg-purple-500/10'
                      : participant.status === 'winner'
                      ? 'border-yellow-400 bg-yellow-500/10'
                      : participant.status === 'eliminated'
                      ? 'border-gray-600 bg-gray-800/30 opacity-60'
                      : 'border-gray-600 bg-gray-800/50'
                  }`}
                >
                  <div className={`text-lg font-bold ${
                    index === 0 ? 'text-yellow-400' :
                    index === 1 ? 'text-gray-300' :
                    index === 2 ? 'text-orange-400' :
                    'text-gray-400'
                  }`}>
                    #{index + 1}
                  </div>
                  
                  <img
                    src={participant.userAvatar}
                    alt={participant.userName}
                    className="w-10 h-10 rounded-full"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-semibold">{participant.userName}</span>
                      {participant.status === 'winner' && (
                        <Crown className="text-yellow-400" size={16} />
                      )}
                    </div>
                    <div className="text-gray-400 text-sm">
                      Niveau {participant.userLevel} • {participant.totalWins}V/{participant.totalLosses}D
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-white font-bold">{participant.currentScore} pts</div>
                    <div className={`text-xs font-semibold ${
                      participant.status === 'winner' ? 'text-yellow-400' :
                      participant.status === 'eliminated' ? 'text-red-400' :
                      participant.status === 'active' ? 'text-green-400' :
                      'text-gray-400'
                    }`}>
                      {participant.status === 'winner' ? 'Gagnant' :
                       participant.status === 'eliminated' ? 'Éliminé' :
                       participant.status === 'active' ? 'Actif' :
                       'Inscrit'}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-8">
          <Button onClick={onBack} variant="secondary" size="lg">
            Retour aux Tournois
          </Button>
        </div>
      </div>
    </div>
  );
}