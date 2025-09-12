import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, ArrowDown, Target, Trophy, RotateCcw } from 'lucide-react';
import { CircularTimer } from '../ui/CircularTimer';
import { ParticleEffect } from '../ui/ParticleEffect';
import { Button } from '../ui/Button';
import type { GameState } from '../../types/game';
import { DIFFICULTIES } from '../../config/difficulties';

interface GameInterfaceProps {
  gameState: GameState;
  onGuess: (guess: number) => void;
  onRestart: () => void;
  onBackToMenu: () => void;
}

export function GameInterface({ gameState, onGuess, onRestart, onBackToMenu }: GameInterfaceProps) {
  const [currentGuess, setCurrentGuess] = useState('');
  const [showParticles, setShowParticles] = useState(false);
  const [showRoundWinFeedback, setShowRoundWinFeedback] = useState(false);
  const [lastRoundXp, setLastRoundXp] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const difficulty = DIFFICULTIES[gameState.difficulty];
  const lastAttempt = gameState.attempts[gameState.attempts.length - 1];

  useEffect(() => {
    // Detect when a round is won (XP gained but still playing)
    if (gameState.gameStatus === 'playing' && gameState.xpGained > 0 && gameState.xpGained !== lastRoundXp) {
      setShowParticles(true);
      setShowRoundWinFeedback(true);
      setLastRoundXp(gameState.xpGained);
      setTimeout(() => setShowParticles(false), 3000);
      setTimeout(() => setShowRoundWinFeedback(false), 2000);
    }
  }, [gameState.gameStatus, gameState.xpGained, lastRoundXp]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const guess = parseInt(currentGuess);
    if (!isNaN(guess) && guess >= difficulty.range.min && guess <= difficulty.range.max) {
      onGuess(guess);
      setCurrentGuess('');
    }
  };

  const getResultIcon = (result: 'higher' | 'lower' | 'correct') => {
    switch (result) {
      case 'higher': return <ArrowUp className="text-red-400" size={20} />;
      case 'lower': return <ArrowDown className="text-blue-400" size={20} />;
      case 'correct': return <Target className="text-green-400" size={20} />;
    }
  };

  const getResultMessage = (result: 'higher' | 'lower' | 'correct') => {
    switch (result) {
      case 'higher': return 'Too low! Go higher';
      case 'lower': return 'Too high! Go lower';
      case 'correct': return 'Perfect! You got it!';
    }
  };

  if (gameState.gameStatus === 'waiting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white mb-8">Select a difficulty to start!</h2>
          <Button onClick={onBackToMenu}>Back to Menu</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${difficulty.theme.gradient} to-gray-900 relative overflow-hidden`}>
      {/* Particle Effects */}
      <ParticleEffect 
        active={showParticles} 
        color={difficulty.theme.particleColor}
        particleCount={30}
      />

      {/* Round Win Feedback */}
      {showRoundWinFeedback && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500/90 backdrop-blur-lg text-white px-6 py-3 rounded-xl border border-green-400 flex items-center space-x-2 animate-bounce">
          <Trophy size={20} />
          <span className="font-bold">Round Gagné ! +{gameState.xpGained} XP</span>
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
            {difficulty.name} Mode
          </h1>
          <p className="text-white/80 text-base md:text-lg">
            Guess the number between {difficulty.range.min} and {difficulty.range.max}
          </p>
          
          {/* Session Stats */}
          {gameState.gameStatus === 'playing' && gameState.roundsWon > 0 && (
            <div className="mt-4 flex justify-center space-x-4">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl px-4 py-2">
                <span className="text-white/80 text-sm">Rounds Won: </span>
                <span className="text-yellow-400 font-bold">{gameState.roundsWon}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl px-4 py-2">
                <span className="text-white/80 text-sm">Total XP: </span>
                <span className="text-cyan-400 font-bold">{gameState.accumulatedXp}</span>
              </div>
            </div>
          )}
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Timer Section */}
          <div className="lg:order-1 flex flex-col items-center">
            <h3 className="text-white text-xl font-semibold mb-4">Time Remaining</h3>
            <CircularTimer 
              timeLeft={gameState.timeLeft} 
              maxTime={gameState.maxTime}
              size={150}
            />
          </div>

          {/* Main Game Area */}
          <div className="lg:order-2 flex flex-col items-center space-y-6">
            {gameState.gameStatus === 'playing' && (
              <form onSubmit={handleSubmit} className="w-full max-w-sm">
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="number"
                    value={currentGuess}
                    onChange={(e) => setCurrentGuess(e.target.value)}
                    placeholder="Enter your guess"
                    min={difficulty.range.min}
                    max={difficulty.range.max}
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
                  Make Guess
                </Button>
              </form>
            )}


            {/* Game Over State */}
            {gameState.gameStatus === 'lost' && (
              <div className="text-center space-y-6">
                <div className="text-6xl">⏰</div>
                <h2 className="text-4xl font-bold text-white">Session Ended!</h2>
                <p className="text-white/80 text-lg">
                  The number was: <span className="font-bold text-2xl">{gameState.targetNumber}</span>
                </p>
                
                {/* Session Summary */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 space-y-4">
                  <h3 className="text-white text-xl font-semibold">Session Summary</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">{gameState.roundsWon}</div>
                      <div className="text-gray-300 text-sm">Rounds Won</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-cyan-400">{gameState.accumulatedXp}</div>
                      <div className="text-gray-300 text-sm">Total XP Earned</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">{gameState.totalAttempts}</div>
                      <div className="text-gray-300 text-sm">Total Attempts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">{Math.floor(gameState.totalTimePlayed / 60)}:{(gameState.totalTimePlayed % 60).toString().padStart(2, '0')}</div>
                      <div className="text-gray-300 text-sm">Time Played</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <Button onClick={onRestart} icon={RotateCcw}>Try Again</Button>
                  <Button onClick={onBackToMenu} variant="secondary">Main Menu</Button>
                </div>
              </div>
            )}
          </div>

          {/* Attempts History */}
          <div className="lg:order-3">
            <h3 className="text-white text-xl font-semibold mb-4">Recent Attempts</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {gameState.attempts.slice(-5).reverse().map((attempt, index) => (
                <div
                  key={attempt.timestamp}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-4 transform transition-all duration-300 hover:scale-105"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-mono text-lg">{attempt.number}</span>
                    <div className="flex items-center space-x-2">
                      {getResultIcon(attempt.result)}
                      <span className="text-white/80 text-sm">
                        {getResultMessage(attempt.result)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {gameState.attempts.length === 0 && (
                <div className="text-white/60 text-center py-8">
                  No attempts yet. Start guessing!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Range Indicator */}
        {gameState.gameStatus === 'playing' && lastAttempt && (
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
              <h4 className="text-white text-center mb-4">Your last guess: <span className="font-bold">{lastAttempt.number}</span></h4>
              <div className="text-center text-white/80">
                {lastAttempt.result === 'higher' && '↗️ The number is higher!'}
                {lastAttempt.result === 'lower' && '↙️ The number is lower!'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}