import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, ArrowDown, Target, Trophy, RotateCcw, AlertTriangle, X } from 'lucide-react';
import { CircularTimer } from '../ui/CircularTimer';
import { ParticleEffect } from '../ui/ParticleEffect';
import { Button } from '../ui/Button';
import type { CampaignGameState } from '../../types/campaign';

interface CampaignGameInterfaceProps {
  gameState: CampaignGameState;
  onGuess: (guess: number) => void;
  onRestart: () => void;
  onBackToCampaign: () => void;
}

export function CampaignGameInterface({ 
  gameState, 
  onGuess, 
  onRestart, 
  onBackToCampaign 
}: CampaignGameInterfaceProps) {
  const [currentGuess, setCurrentGuess] = useState('');
  const [showParticles, setShowParticles] = useState(false);
  const [showRuleViolation, setShowRuleViolation] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { level } = gameState;
  const lastAttempt = gameState.attempts[gameState.attempts.length - 1];

  useEffect(() => {
    if (gameState.gameStatus === 'won') {
      setShowParticles(true);
      setTimeout(() => setShowParticles(false), 3000);
    }
  }, [gameState.gameStatus]);

  useEffect(() => {
    if (lastAttempt?.result === 'invalid' && lastAttempt.violatesRule) {
      setShowRuleViolation(lastAttempt.violatesRule);
      setTimeout(() => setShowRuleViolation(null), 3000);
    }
  }, [lastAttempt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const guess = parseInt(currentGuess);
    if (!isNaN(guess) && guess >= level.range.min && guess <= level.range.max) {
      onGuess(guess);
      setCurrentGuess('');
    }
  };

  const getResultIcon = (result: 'higher' | 'lower' | 'correct' | 'invalid') => {
    switch (result) {
      case 'higher': return <ArrowUp className="text-red-400" size={20} />;
      case 'lower': return <ArrowDown className="text-blue-400" size={20} />;
      case 'correct': return <Target className="text-green-400" size={20} />;
      case 'invalid': return <X className="text-red-400" size={20} />;
    }
  };

  const getResultMessage = (result: 'higher' | 'lower' | 'correct' | 'invalid', violatesRule?: string) => {
    switch (result) {
      case 'higher': return 'Trop bas ! Montez';
      case 'lower': return 'Trop haut ! Descendez';
      case 'correct': return 'Parfait ! Vous avez trouvé !';
      case 'invalid': return violatesRule || 'Tentative invalide';
    }
  };

  if (gameState.gameStatus === 'waiting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white mb-8">Sélectionnez un niveau pour commencer !</h2>
          <Button onClick={onBackToCampaign}>Retour à la Campagne</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${level.theme.background} relative overflow-hidden`}>
      {/* Particle Effects */}
      <ParticleEffect 
        active={showParticles} 
        color={level.theme.particleColor}
        particleCount={30}
      />

      {/* Rule Violation Alert */}
      {showRuleViolation && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500/90 backdrop-blur-lg text-white px-6 py-3 rounded-xl border border-red-400 flex items-center space-x-2 animate-pulse">
          <AlertTriangle size={20} />
          <span className="font-semibold">{showRuleViolation}</span>
        </div>
      )}

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
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 font-['Orbitron']">
            {level.name}
          </h1>
          <p className="text-white/80 text-base md:text-lg mb-2">
            {level.description}
          </p>
          <div className="bg-black/30 backdrop-blur-lg rounded-xl p-4 max-w-2xl mx-auto">
            <p className="text-white/90 italic">"{level.story}"</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Timer Section */}
          <div className="lg:order-1 flex flex-col items-center">
            <h3 className="text-white text-xl font-semibold mb-4">Temps Restant</h3>
            <CircularTimer 
              timeLeft={gameState.timeLeft} 
              maxTime={gameState.maxTime}
              size={150}
            />
            
            {/* Attempts Counter */}
            {gameState.maxAttempts && (
              <div className="mt-4 bg-white/10 backdrop-blur-lg rounded-xl p-3 text-center">
                <div className="text-white text-sm">Tentatives</div>
                <div className="text-2xl font-bold text-cyan-400">
                  {gameState.attempts.filter(a => a.result !== 'invalid').length}/{gameState.maxAttempts}
                </div>
              </div>
            )}
          </div>

          {/* Main Game Area */}
          <div className="lg:order-2 flex flex-col items-center space-y-6">
            {/* Special Rules Display */}
            {level.specialRules && (
              <div className="bg-purple-500/20 backdrop-blur-lg rounded-xl p-4 border border-purple-400/30 w-full max-w-sm">
                <h4 className="text-purple-300 font-semibold mb-2 text-center">Règles Spéciales</h4>
                <div className="text-purple-200 text-sm text-center">
                  {level.specialRules.evenOnly && "Nombres pairs uniquement"}
                  {level.specialRules.oddOnly && "Nombres impairs uniquement"}
                  {level.specialRules.multiplesOf && `Multiples de ${level.specialRules.multiplesOf}`}
                  {level.specialRules.noRepeats && "Pas de répétition autorisée"}
                  {level.specialRules.blindMode && "Mode aveugle - Pas d'indices !"}
                </div>
              </div>
            )}

            {gameState.gameStatus === 'playing' && (
              <form onSubmit={handleSubmit} className="w-full max-w-sm">
                <div className="text-center mb-4">
                  <p className="text-white/80 text-lg">
                    Devinez le nombre entre {level.range.min} et {level.range.max}
                  </p>
                </div>
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="number"
                    value={currentGuess}
                    onChange={(e) => setCurrentGuess(e.target.value)}
                    placeholder="Votre estimation"
                    min={level.range.min}
                    max={level.range.max}
                    className="w-full px-6 py-4 text-2xl font-mono text-center bg-white/10 backdrop-blur-lg border-2 border-white/20 rounded-2xl focus:border-white/40 focus:ring-4 focus:ring-white/20 outline-none transition-all duration-300 text-white placeholder-white/60"
                    autoFocus
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-2xl pointer-events-none" />
                </div>
                <Button
                  type="submit"
                  className="w-full mt-4"
                  variant="primary"
                  size="lg"
                  disabled={!currentGuess || gameState.gameStatus !== 'playing'}
                >
                  Faire une Estimation
                </Button>
              </form>
            )}

            {/* Game Over States */}
            {gameState.gameStatus === 'won' && (
              <div className="text-center space-y-6">
                <div className="text-6xl">🎉</div>
                <h2 className="text-4xl font-bold text-white">Niveau Complété !</h2>
                <p className="text-white/80 text-lg">
                  Vous avez trouvé le nombre en {gameState.attempts.filter(a => a.result !== 'invalid').length} tentatives !
                </p>
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Trophy className="text-yellow-400" size={24} />
                    <span className="text-white font-semibold">XP Gagnés</span>
                  </div>
                  <div className="text-3xl font-bold text-yellow-400">+{gameState.xpGained}</div>
                </div>
                <div className="flex space-x-4">
                  <Button onClick={onRestart} icon={RotateCcw}>Rejouer</Button>
                  <Button onClick={onBackToCampaign} variant="secondary">Campagne</Button>
                </div>
              </div>
            )}

            {gameState.gameStatus === 'lost' && (
              <div className="text-center space-y-6">
                <div className="text-6xl">💔</div>
                <h2 className="text-4xl font-bold text-white">Niveau Échoué</h2>
                <p className="text-white/80 text-lg">
                  {gameState.timeLeft === 0 ? "Temps écoulé !" : "Tentatives épuisées !"}
                </p>
                <p className="text-white/80 text-lg">
                  Le nombre était : <span className="font-bold text-2xl">{gameState.targetNumber}</span>
                </p>
                <div className="flex space-x-4">
                  <Button onClick={onRestart} icon={RotateCcw}>Réessayer</Button>
                  <Button onClick={onBackToCampaign} variant="secondary">Campagne</Button>
                </div>
              </div>
            )}
          </div>

          {/* Attempts History */}
          <div className="lg:order-3">
            <h3 className="text-white text-xl font-semibold mb-4">Historique</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {gameState.attempts.slice(-8).reverse().map((attempt, index) => (
                <div
                  key={attempt.timestamp}
                  className={`backdrop-blur-lg rounded-xl p-4 transform transition-all duration-300 hover:scale-105 ${
                    attempt.result === 'invalid' 
                      ? 'bg-red-500/20 border border-red-500/30'
                      : 'bg-white/10 border border-white/20'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-mono text-lg">{attempt.number}</span>
                    <div className="flex items-center space-x-2">
                      {getResultIcon(attempt.result)}
                      <span className="text-white/80 text-sm">
                        {getResultMessage(attempt.result, attempt.violatesRule)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {gameState.attempts.length === 0 && (
                <div className="text-white/60 text-center py-8">
                  Aucune tentative encore. Commencez à deviner !
                </div>
              )}
            </div>

            {/* Used Numbers (for no-repeat rule) */}
            {level.specialRules?.noRepeats && gameState.usedNumbers.length > 0 && (
              <div className="mt-4 bg-red-500/20 backdrop-blur-lg rounded-xl p-3 border border-red-500/30">
                <h4 className="text-red-300 font-semibold mb-2 text-sm">Nombres Utilisés</h4>
                <div className="flex flex-wrap gap-1">
                  {gameState.usedNumbers.map(num => (
                    <span key={num} className="bg-red-500/30 text-red-200 px-2 py-1 rounded text-xs">
                      {num}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Current Feedback */}
        {gameState.gameStatus === 'playing' && lastAttempt && lastAttempt.result !== 'invalid' && !level.specialRules?.blindMode && (
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
              <h4 className="text-white text-center mb-4">Votre dernière estimation : <span className="font-bold">{lastAttempt.number}</span></h4>
              <div className="text-center text-white/80">
                {lastAttempt.result === 'higher' && '↗️ Le nombre est plus élevé !'}
                {lastAttempt.result === 'lower' && '↙️ Le nombre est plus bas !'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}