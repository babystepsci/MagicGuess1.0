import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, 
  Crown, 
  MessageCircle, 
  Send, 
  Settings, 
  Play, 
  LogOut,
  Check,
  Clock,
  Trophy
} from 'lucide-react';
import { Button } from '../ui/Button';
import { CircularTimer } from '../ui/CircularTimer';
import { ParticleEffect } from '../ui/ParticleEffect';
import { useMultiplayer } from '../../hooks/MultiplayerProvider'; // Updated import path
import { useAuth } from '../../hooks/useAuth';
import { useLocale } from '../../hooks/useLocale';
import { DIFFICULTIES } from '../../config/difficulties';
import type { Player } from '../../types/multiplayer';

interface MultiplayerRoomProps {
  onLeave: () => void;
}

export function MultiplayerRoom({ onLeave }: MultiplayerRoomProps) {
  const { 
    currentRoom, 
    currentPlayer, 
    chatMessages, 
    error,
    toggleReady, 
    startGame, 
    makeGuess, 
    sendChatMessage,
    leaveRoom 
  } = useMultiplayer();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { t } = useLocale();
  
  const [currentGuess, setCurrentGuess] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [showQuickChat, setShowQuickChat] = useState(false);
  const [turnTimeLeft, setTurnTimeLeft] = useState(15000); // 15000ms = 15 secondes
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Déclarer isMyTurn et activePlayer avant les useEffect
  const isMyTurn = currentRoom?.gameData?.activePlayerId === user?.id;
  const activePlayer = currentRoom?.players.find(p => p.id === currentRoom?.gameData?.activePlayerId);

  // Timer précis avec millièmes
  useEffect(() => {
    if (currentRoom?.status === 'playing' && currentRoom?.gameData) {
      const interval = setInterval(() => {
        const elapsed = Date.now() - (currentRoom.gameData?.turnStartTime || Date.now());
        const remaining = Math.max(0, 15000 - elapsed); // 15 secondes constant
        setTurnTimeLeft(remaining);
        
        // Auto-switch si temps écoulé
        if (remaining <= 0 && isMyTurn && !currentPlayer?.hasGuessed) {
          // Le service gérera le passage automatique
        }
      }, 200); // Mise à jour toutes les 200ms pour optimiser les performances
      
      return () => clearInterval(interval);
    }
  }, [currentRoom?.gameData?.turnStartTime, currentRoom?.gameData?.activePlayerId, isMyTurn, currentPlayer?.hasGuessed]);

  // Fonction de démarrage avec debugging détaillé
  const handleStartGame = async () => {
    console.log('🔍 [MultiplayerRoom] handleStartGame appelé');
    console.log('🔍 [MultiplayerRoom] currentRoom:', currentRoom?.id);
    console.log('🔍 [MultiplayerRoom] currentRoom status:', currentRoom?.status);
    console.log('🔍 [MultiplayerRoom] isHost:', currentPlayer?.isHost);
    console.log('🔍 [MultiplayerRoom] canStart:', canStart);
    console.log('🔍 [MultiplayerRoom] Joueurs:', currentRoom?.players?.map(p => ({
      name: p.name,
      isReady: p.isReady,
      isHost: p.isHost
    })));
    
    try {
      await startGame();
      console.log('🔍 [MultiplayerRoom] Partie démarrée avec succès');
    } catch (error) {
      console.error('❌ [MultiplayerRoom] Erreur démarrage:', error);
    }
  };

  useEffect(() => {
    if (showChat && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [chatMessages]);

  useEffect(() => {
    if (currentRoom?.status === 'playing' && inputRef.current && isMyTurn && !currentPlayer?.hasGuessed) {
      // Focus sans scroll automatique avec délai pour éviter les conflits
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus({ preventScroll: true });
        }
      }, 150); // Délai légèrement augmenté pour la stabilité
    }
  }, [currentRoom?.status, isMyTurn, currentPlayer?.hasGuessed]);

  // Écran de chargement amélioré
  if (isAuthLoading || !user || !currentRoom || !currentPlayer) {
    console.log('🔍 [MultiplayerRoom] Loading state - isAuthLoading:', isAuthLoading, 'user:', !!user, 'currentRoom:', !!currentRoom, 'currentPlayer:', !!currentPlayer);
    if (user) {
      console.log('🔍 [MultiplayerRoom] User details:', { id: user.id, name: user.name, pseudo: user.pseudo });
    }
    if (currentRoom) {
      console.log('🔍 [MultiplayerRoom] CurrentRoom details:', { id: currentRoom.id, name: currentRoom.name, playersCount: currentRoom.players.length });
    }
    if (currentRoom && user) {
      const foundPlayer = currentRoom.players.find(p => p.id === user.id);
      console.log('🔍 [MultiplayerRoom] Player found in room:', !!foundPlayer, foundPlayer);
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          {/* Affichage d'erreur pour le débogage */}
          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <h3 className="text-red-400 font-semibold mb-2">Erreur détectée :</h3>
              <p className="text-red-300 text-sm">{error}</p>
              <div className="mt-4">
                <Button
                  onClick={() => window.location.reload()}
                  variant="danger"
                  size="sm"
                >
                  Recharger la page
                </Button>
              </div>
            </div>
          )}

          {/* Animation de chargement */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-cyan-400 mb-6 animate-pulse">
              <Users size={40} className="text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 font-['Orbitron']">
              {isAuthLoading ? 'Authentification...' : 'Connexion au salon...'}
            </h2>
            <p className="text-gray-400 text-base md:text-lg">
              {isAuthLoading 
                ? 'Vérification de votre identité' 
                : 'Chargement des informations de la partie'}
            </p>
            
            {/* Informations de débogage */}
            <div className="mt-4 text-xs text-gray-500">
              <p>État de débogage :</p>
              <p>• Authentification : {isAuthLoading ? '⏳' : user ? '✅' : '❌'}</p>
              <p>• Utilisateur : {user ? `✅ ${user.pseudo || user.name || 'N/A'}` : '❌'}</p>
              <p>• ID Utilisateur : {user ? `✅ ${user.id}` : '❌'}</p>
              <p>• Email : {user ? `✅ ${user.email || 'N/A'}` : '❌'}</p>
              <p>• Salle actuelle : {currentRoom ? `✅ ${currentRoom.name}` : '❌'}</p>
              <p>• Joueur actuel : {currentPlayer ? `✅ ${currentPlayer.name}` : '❌'}</p>
            </div>
          </div>
          
          {/* Indicateur de progression */}
          <div className="w-64 max-w-full mx-auto">
            <div className="bg-gray-800 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full animate-pulse" 
                   style={{ width: '60%' }} />
            </div>
          </div>
          
          {/* Points d'animation */}
          <div className="mt-6 flex justify-center space-x-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full animate-bounce"
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1s',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const difficulty = DIFFICULTIES[currentRoom.difficulty];
  const isHost = currentPlayer.isHost;
  const canStart = isHost && currentRoom.players.every(p => p.isReady || p.isHost) && currentRoom.players.length >= 2;

  const handleGuessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const guess = parseInt(currentGuess);
    
    if (!isNaN(guess) && guess >= difficulty.range.min && guess <= difficulty.range.max) {
      const result = await makeGuess(guess);
      if (result?.isWinner) {
        setShowParticles(true);
        setTimeout(() => setShowParticles(false), 3000);
      }
      setCurrentGuess('');
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      await sendChatMessage(chatInput);
      setChatInput('');
    }
  };

  const handleQuickChatMessage = async (message: string) => {
    await sendChatMessage(message);
    setShowQuickChat(false);
  };

  const handleLeave = async () => {
    await leaveRoom();
    onLeave();
  };

  const getPlayerStatusIcon = (player: Player) => {
    if (player.isHost) return <Crown className="text-yellow-400" size={16} />;
    if (currentRoom.status === 'playing' && player.hasGuessed) return <Check className="text-green-400" size={16} />;
    if (currentRoom.status === 'waiting' && player.isReady) return <Check className="text-green-400" size={16} />;
    if (currentRoom.status === 'waiting' && !player.isReady) return <Clock className="text-gray-400" size={16} />;
    return null;
  };

  const timeLeft = currentRoom.gameData ? 
    Math.max(0, Math.floor((currentRoom.gameData.startTime + currentRoom.gameData.timeLimit * 1000 - Date.now()) / 1000)) : 
    0;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${difficulty.theme.gradient} to-gray-900 relative overflow-hidden`}>
      {/* Particle Effects */}
      <ParticleEffect 
        active={showParticles} 
        color={difficulty.theme.particleColor}
        particleCount={30}
      />

      {/* Background Animation */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full animate-pulse opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header - Nouvelle disposition */}
        <div className="sticky top-0 z-20 flex items-center justify-between mb-6 bg-black/30 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
          {/* Gauche - Info joueurs et difficulté */}
          <div className="flex items-center space-x-4 text-white/90 text-sm">
            <span className="bg-white/20 px-3 py-1 rounded-full">
              👥 {currentRoom.players.length}/{currentRoom.maxPlayers}
            </span>
            <span className="bg-white/20 px-3 py-1 rounded-full">
              {t.multiplayer.difficulty}: {t.game[currentRoom.difficulty]}
            </span>
            <span className="bg-cyan-500/20 px-3 py-1 rounded-full font-mono">
              Code: {currentRoom.shortCode}
            </span>
          </div>
          
          {/* Centre - Nom du salon */}
          <h1 className="text-xl md:text-2xl font-bold text-white font-['Orbitron'] text-center flex-1">
            {currentRoom.name}
          </h1>
          
          {/* Droite - Bouton quitter */}
          <Button
            onClick={handleLeave}
            variant="danger"
            size="sm"
            icon={LogOut}
          >
            {t.multiplayer.leave}
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-30 p-4 bg-red-500/10 border border-red-500/20 rounded-xl max-w-md">
            <h3 className="text-red-400 font-semibold mb-2">Erreur</h3>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Turn Indicator - Compact */}
        {currentRoom.status === 'playing' && activePlayer && (
          <div className="sticky top-20 z-10 text-center mb-2">
            <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl border ${
              isMyTurn 
                ? 'bg-black/40 border-white text-white shadow-lg' 
                : 'bg-black/30 border-white/60 text-white/90'
            }`}>
              <img src={activePlayer.avatar} alt={activePlayer.name} className="w-6 h-6 rounded-full" />
              <span className="font-bold text-sm" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                {isMyTurn ? "Votre tour" : activePlayer.name}
              </span>
              <div className={`text-sm font-mono font-bold ${
                turnTimeLeft < 1000 ? 'text-red-300 animate-pulse' : 
                turnTimeLeft < 2000 ? 'text-orange-300' : 'text-white'
              }`} style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.9)' }}>
                {(turnTimeLeft / 1000).toFixed(1)}s
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-16 h-[calc(100vh-200px)]">
          {/* Players Panel */}
          <div className="lg:col-span-1 lg:order-1 h-full">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 h-full overflow-y-auto">
              <div className="mb-4">
                <h3 className="text-white text-base font-semibold flex items-center">
                  <Users className="mr-2" size={16} />
                  {t.multiplayer.players}
                </h3>
              </div>

              <div className="space-y-2">
                {currentRoom.players.map((player) => (
                  <div
                    key={player.id}
                    className={`p-2 rounded-lg border transition-all duration-200 ${
                      player.id === currentPlayer.id
                        ? 'border-purple-400 bg-purple-500/20'
                        : 'border-gray-600 bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <img
                        src={player.avatar}
                        alt={player.name}
                        className="w-8 h-8 rounded-full border border-gray-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-white text-sm font-semibold truncate max-w-[100px]">
                            {player.name}
                          </span>
                          {getPlayerStatusIcon(player)}
                          {currentRoom.gameData?.activePlayerId === player.id && (
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                          )}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {t.menu.level} {player.level}
                          {currentRoom.status === 'playing' && (
                            <span className="ml-1">
                              {player.score}pts • {player.attempts}t
                              {player.lastGuess !== null && (
                                <span className="ml-1">• {player.lastGuess}</span>
                              )}
                            </span>
                          )}
                          {!player.isConnected && (
                            <span className="text-red-400 text-xs ml-1">Off</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Ready/Start Button */}
              {currentRoom.status === 'waiting' && (
                <div className="mt-4 space-y-2">
                  {!isHost && (
                    <Button
                      onClick={toggleReady}
                      variant={currentPlayer.isReady ? "success" : "secondary"}
                      size="md"
                      className="w-full"
                      icon={currentPlayer.isReady ? Check : Clock}
                    >
                      {currentPlayer.isReady ? t.multiplayer.ready : t.multiplayer.notReady}
                    </Button>
                  )}
                  
                  {isHost && (
                    <Button
                      onClick={handleStartGame}
                      variant="primary"
                      size="md"
                      className="w-full"
                      disabled={!canStart}
                      icon={Play}
                    >
                      {canStart ? "Démarrer" : "En attente"}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Zone d'affichage d'erreur */}
          {error && (
            <div className="lg:col-span-1">
              <div className="bg-red-500/10 backdrop-blur-lg rounded-2xl p-4 border border-red-500/20">
                <h3 className="text-red-400 font-semibold mb-2">Erreur</h3>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Game Area */}
          <div className="lg:col-span-1 lg:order-2 h-full">
            <div className="h-full flex flex-col justify-center">
            {currentRoom.status === 'waiting' ? (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center">
                <h2 className="text-2xl font-bold text-white mb-3">
                  {t.multiplayer.waitingToStart}
                </h2>
                <p className="text-white/80 text-base mb-4">
                  {isHost 
                    ? t.multiplayer.hostStartInstructions
                    : t.multiplayer.waitingForHost}
                </p>
                
                <div className="bg-white/5 rounded-lg p-3">
                  <h3 className="text-white text-sm font-semibold mb-2">Paramètres</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400">{t.multiplayer.difficulty}:</span>
                      <span className="text-white ml-2 capitalize">{t.game[currentRoom.difficulty]}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">{t.game.range}:</span>
                      <span className="text-white ml-2">{difficulty.range.min}-{difficulty.range.max}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : currentRoom.status === 'playing' ? (
              <div className="space-y-4">
                {/* Timer Section */}
                <div className="flex flex-col items-center">
                  <h3 className="text-white text-lg font-bold mb-3" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                    Temps Restant
                  </h3>
                  <CircularTimer 
                    timeLeft={turnTimeLeft / 1000} 
                    maxTime={15}
                    size={120}
                  />
                  <p className="text-white mt-2 text-center text-sm font-bold" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                    Tour de {activePlayer?.name}
                  </p>
                </div>

                {/* Game Interface */}
                <div className="bg-black/40 backdrop-blur-lg rounded-xl p-4 border border-white/40">
                  <h2 className="text-lg font-bold text-white text-center mb-4" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                    {t.game.guessNumber} {difficulty.range.min} {t.game.and} {difficulty.range.max}
                  </h2>

                  {isMyTurn && !currentPlayer.hasGuessed ? (
                    <form onSubmit={handleGuessSubmit} className="max-w-xs mx-auto">
                      <div className="relative mb-3">
                        <input
                          ref={inputRef}
                          type="number"
                          value={currentGuess}
                          onChange={(e) => setCurrentGuess(e.target.value)}
                          placeholder={t.game.enterGuess}
                          min={difficulty.range.min}
                          max={difficulty.range.max}
                          className="w-full px-4 py-3 text-xl font-mono text-center bg-black/50 backdrop-blur-lg border border-white/50 rounded-xl focus:border-white/80 focus:ring-2 focus:ring-white/30 outline-none transition-all duration-300 text-white placeholder-white/80 font-bold"
                          style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
                          disabled={!isMyTurn}
                          autoFocus={isMyTurn}
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full"
                        variant="primary"
                        size="md"
                        disabled={!currentGuess || !isMyTurn}
                      >
                        {t.game.makeGuess}
                      </Button>
                    </form>
                  ) : currentPlayer.hasGuessed ? (
                    <div className="text-center">
                      <div className="text-3xl mb-3">✅</div>
                      <h3 className="text-lg font-bold text-white mb-2" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                        Tentative validée !
                      </h3>
                      <p className="text-white/90 text-sm font-semibold" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                        En attente des autres joueurs...
                      </p>
                      {currentPlayer.lastGuess !== null && (
                        <div className="mt-3 p-3 bg-black/50 rounded-lg border border-white/30">
                          <p className="text-white font-mono text-base font-bold" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                            Votre tentative: {currentPlayer.lastGuess}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : !isMyTurn ? (
                    <div className="text-center">
                      <div className="text-3xl mb-3">⏳</div>
                      <h3 className="text-lg font-bold text-white mb-2" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                        En attente...
                      </h3>
                      <p className="text-white/90 text-sm font-semibold" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                        C'est le tour de {activePlayer?.name}
                      </p>
                    </div>
                  ) : null}
                </div>

              </div>
            ) : currentRoom.status === 'finished' ? (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center">
                <div className="text-4xl mb-3">🏆</div>
                <h2 className="text-2xl font-bold text-white mb-3" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                  {t.multiplayer.gameFinished}
                </h2>
                
                {/* Final Leaderboard */}
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-white text-sm font-bold mb-3 flex items-center justify-center" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                    <Trophy className="mr-2" size={16} />
                    {t.multiplayer.finalResults}
                  </h3>
                  <div className="space-y-2">
                    {[...currentRoom.players]
                      .sort((a, b) => b.score - a.score)
                      .map((player, index) => (
                        <div
                          key={player.id}
                          className={`flex items-center justify-between p-2 rounded text-sm ${
                            index === 0 ? 'bg-yellow-500/20 border border-yellow-500/30' :
                            index === 1 ? 'bg-gray-400/20 border border-gray-400/30' :
                            index === 2 ? 'bg-orange-500/20 border border-orange-500/30' :
                            'bg-gray-800/50'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className={`text-base font-bold ${
                              index === 0 ? 'text-yellow-400' :
                              index === 1 ? 'text-gray-300' :
                              index === 2 ? 'text-orange-400' :
                              'text-gray-400'
                            }`}>
                              #{index + 1}
                            </span>
                            <img
                              src={player.avatar}
                              alt={player.name}
                              className="w-6 h-6 rounded-full"
                            />
                            <span className="text-white text-sm font-bold" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                              {player.name}
                            </span>
                          </div>
                          <span className="text-cyan-300 text-sm font-bold" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                            {player.score} pts
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
                
                {/* Rematch Button */}
                <div className="mt-4">
                  <Button
                    onClick={() => window.location.reload()} // Simplification pour la démo
                    variant="primary"
                    size="md"
                  >
                    Nouvelle Partie
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-black/40 backdrop-blur-lg rounded-xl p-6 border border-white/40 text-center">
                <h2 className="text-lg font-bold text-white mb-3" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                  Partie en cours...
                </h2>
              </div>
            )}
            </div>
          </div>

          {/* Game History Panel */}
          <div className="lg:col-span-1 lg:order-3 h-full">
            <div className="bg-black/40 backdrop-blur-lg rounded-xl p-3 border border-white/40 h-full overflow-y-auto">
              <h3 className="text-white text-sm font-bold mb-2 text-center" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                📋 Historique des Tentatives
              </h3>
              <div className="space-y-1">
                {chatMessages
                  .filter(msg => msg.type === 'game' && msg.message.includes('→'))
                  .slice(-5)
                  .reverse()
                  .map((msg, index) => {
                    const isCorrect = msg.message.includes('trouvé');
                    const isTooSmall = msg.message.includes('Trop petit');
                    const isTooLarge = msg.message.includes('Trop grand');
                    
                    return (
                      <div key={`${msg.id}-${index}`} className="flex items-center justify-between p-2 bg-black/50 rounded border border-white/30">
                        <div className="flex items-center space-x-1">
                          <span className="text-white font-bold text-xs" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                            👤 {msg.message.split(':')[0]}
                          </span>
                        </div>
                        <span className={`text-xs font-bold ${
                          isCorrect ? 'text-green-300' :
                          isTooSmall ? 'text-red-300' :
                          isTooLarge ? 'text-blue-300' : 'text-white'
                        }`} style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.9)' }}>
                          {isCorrect ? '🎉 Victoire !' :
                           isTooSmall ? '↗️ Trop petit' :
                           isTooLarge ? '↙️ Trop grand' : msg.message}
                        </span>
                      </div>
                    );
                  })}
                {chatMessages.filter(msg => msg.type === 'game' && msg.message.includes('→')).length === 0 && (
                  <div className="text-white/80 text-center py-4 text-xs font-semibold" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                    Aucune tentative encore
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Chat Panel - Collapsible Footer */}
        <div className={`fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-lg border-t border-white/20 transition-all duration-300 ${
          showChat ? 'h-40' : 'h-10'
        }`}>
          {/* Chat Toggle Button */}
          <button
            onClick={() => setShowChat(!showChat)}
            className="w-full p-2 flex items-center justify-center space-x-2 text-white hover:bg-white/10 transition-colors duration-200"
          >
            <MessageCircle size={16} />
            <span className="text-sm font-semibold">{t.multiplayer.chat}</span>
            <span className="text-xs">
              {showChat ? '▼' : '▲'}
            </span>
          </button>

          {/* Chat Content */}
          {showChat && (
            <div className="flex flex-col h-30">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {chatMessages
                  .filter(msg => msg.type === 'message')
                  .slice(-10)
                  .map((message) => (
                    <div
                      key={message.id}
                      className={`${
                        message.playerId === currentPlayer.id ? 'text-right' : 'text-left'
                      }`}
                    >
                      <div className={`inline-block max-w-[80%] p-1 rounded text-xs ${
                        message.playerId === currentPlayer.id
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-700 text-white'
                      }`}>
                        <div className="text-xs opacity-75">
                          {message.playerName}
                        </div>
                        <div>{message.message}</div>
                      </div>
                    </div>
                  ))}
                {chatMessages.filter(msg => msg.type === 'message').length === 0 && (
                  <div className="text-gray-400 text-center py-2 text-xs">
                    Aucun message encore. Commencez la conversation !
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleChatSubmit} className="p-1 border-t border-white/20">
                <div className="flex space-x-1">
                  <button
                    type="button"
                    onClick={() => setShowQuickChat(!showQuickChat)}
                    className="px-1 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs"
                    title={t.multiplayer.quickChat}
                  >
                    😊
                  </button>
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={t.multiplayer.typeMessage}
                    className="flex-1 px-1 py-1 bg-gray-800 border border-gray-600 rounded focus:border-purple-400 outline-none text-white text-xs"
                    maxLength={200}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleChatSubmit(e as any);
                      }
                    }}
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    icon={Send}
                    disabled={!chatInput.trim()}
                    className="px-1 py-1 text-xs"
                  />
                </div>

                {/* Quick Chat Options */}
                {showQuickChat && (
                  <div className="mt-1 p-1 bg-gray-800/50 rounded">
                    <div className="grid grid-cols-4 gap-1">
                      {[
                        t.multiplayer.goodLuck,
                        t.multiplayer.wellPlayed,
                        t.multiplayer.almostThere,
                        t.multiplayer.niceGuess,
                        t.multiplayer.tooSlow,
                        t.multiplayer.impressive,
                        t.multiplayer.rematch,
                        t.multiplayer.thanks,
                      ].map((message) => (
                        <button
                          key={message}
                          onClick={() => handleQuickChatMessage(message)}
                          className="px-1 py-1 text-xs bg-purple-500/20 hover:bg-purple-500/40 text-white rounded transition-colors duration-200"
                        >
                          {message}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}