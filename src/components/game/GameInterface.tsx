import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, ArrowDown, Target, Trophy, RotateCcw } from 'lucide-react';
import { CircularTimer } from '../ui/CircularTimer';
import { ParticleEffect } from '../ui/ParticleEffect';
import { Button } from '../ui/Button';
import type { GameState } from '../../types/game';
import { DIFFICULTIES } from '../../config/difficulties';
import { useLocale } from '../../hooks/useLocale';

interface GameInterfaceProps {
  gameState: GameState;
  onGuess: (guess: number) => void;
  onRestart: () => void;
  onBackToMenu: () => void;
}

// Custom hook for viewport height
const useViewportHeight = () => {
  useEffect(() => {
    const updateVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    updateVh(); // Set initially
    window.addEventListener('resize', updateVh);
    return () => window.removeEventListener('resize', updateVh);
  }, []);
};

export function GameInterface({ gameState, onGuess, onRestart, onBackToMenu }: GameInterfaceProps) {
  const [currentGuess, setCurrentGuess] = useState('');
  const [showParticles, setShowParticles] = useState(false);
  const [showRoundWinFeedback, setShowRoundWinFeedback] = useState(false);
  const [lastRoundXp, setLastRoundXp] = useState(0);
  const { t } = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const difficulty = DIFFICULTIES[gameState.difficulty];
  const lastAttempt = gameState.attempts[gameState.attempts.length - 1];

  // Call the custom hook
  useViewportHeight();

  // Keyboard detection effect
  useEffect(() => {
    const handleResize = () => {
      const isKeyboardOpen = window.innerHeight < window.screen.height * 0.75;
      setKeyboardVisible(isKeyboardOpen);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      case 'higher': return t.game.tooLow;
      case 'lower': return t.game.tooHigh;
      case 'correct': return t.game.perfect;
    }
  };

  if (gameState.gameStatus === 'waiting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white mb-8">{t.game.selectDifficultyToStart}</h2>
          <Button onClick={onBackToMenu}>{t.game.backToMainMenu}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`game-container ${keyboardVisible ? 'keyboard-open' : ''} bg-gradient-to-br ${difficulty.theme.gradient} to-gray-900 relative`}>
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
          <span className="font-bold">{t.game.roundWon} ! +{gameState.xpGained} XP</span>
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

      <div className="relative z-10 flex flex-col items-center justify-start h-full p-4 game-content-area">
        {/* Header */}
        <div className="text-center mb-4 header-panel">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 font-['Orbitron']">
            {t.game.mode} {t.game[gameState.difficulty]}
          </h1>
          <p className="text-white/80 text-base md:text-lg mb-2">
            {t.game.guessNumber} {difficulty.range.min} {t.game.and} {difficulty.range.max}
          </p>
          
          {/* Session Stats */}
          {gameState.gameStatus === 'playing' && gameState.roundsWon > 0 && (
            <div className="mt-4 flex justify-center space-x-4">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl px-4 py-2">
                <span className="text-white/80 text-sm">{t.game.roundsWonShort}: </span>
                <span className="text-yellow-400 font-bold">{gameState.roundsWon}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl px-4 py-2 ml-2">
                <span className="text-white/80 text-sm">{t.game.totalXp}: </span>
                <span className="text-cyan-400 font-bold">{gameState.accumulatedXp}</span>
              </div>
            </div>
          )}
        </div>

        {/* Timer Section (Mobile specific positioning via CSS) */}
        <div className="flex flex-col items-center timer-panel">
          <h3 className="text-white text-xl font-semibold mb-4">{t.game.timeRemaining}</h3>
          <CircularTimer 
            timeLeft={gameState.timeLeft} 
            maxTime={gameState.maxTime}
            size={150}
          />
        </div>

        {/* Attempts History (Mobile specific positioning via CSS) */}
        {typeof window !== 'undefined' && window.innerWidth <= 768 && (
          <div className="history-panel">
            <div className="history-header">📋 {t.game.recentAttempts}</div>
            {gameState.attempts.slice(-2).reverse().map((attempt, index) => (
              <div key={attempt.timestamp} className="attempt-compact">
                <span className="font-mono">{attempt.number}</span>
                <div className="flex items-center space-x-1">
                  {getResultIcon(attempt.result)}
                  <span className="text-xs">{getResultMessage(attempt.result)}</span>
                </div>
              </div>
            ))}
            {gameState.attempts.length === 0 && (
              <div className="text-gray-400 text-center text-xs py-2">
                {t.game.noAttemptsYet}
              </div>
            )}
          </div>
        )}

        {/* Main Game Area / Input (Mobile specific positioning via CSS) */}
        <div className="input-panel">
          {gameState.gameStatus === 'playing' && (
            <form onSubmit={handleSubmit} className="w-full max-w-sm">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="number"
                  value={currentGuess}
                  onChange={(e) => setCurrentGuess(e.target.value)}
                  placeholder={t.game.enterGuess}
                  min={difficulty.range.min}
                  max={difficulty.range.max}
                  className="input-field-mobile"
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
                {t.game.makeGuess}
              </Button>
            </form>
          )}

          {/* Game Over State */}
          {gameState.gameStatus === 'lost' && (
            <div className="text-center space-y-6 game-over-panel">
              <div className="text-6xl">⏰</div>
              <h2 className="text-4xl font-bold text-white">{t.game.sessionEnded}</h2>
              <p className="text-white/80 text-lg">
                {t.game.numberWas} <span className="font-bold text-2xl">{gameState.targetNumber}</span>
              </p>
              
              {/* Session Summary */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 space-y-4">
                <h3 className="text-white text-xl font-semibold">{t.game.sessionSummary}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{gameState.roundsWon}</div>
                    <div className="text-gray-300 text-sm">{t.game.roundsWon}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-400">{gameState.accumulatedXp}</div>
                    <div className="text-gray-300 text-sm">{t.game.totalXpEarned}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{gameState.totalAttempts}</div>
                    <div className="text-gray-300 text-sm">{t.game.totalAttempts}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{Math.floor(gameState.totalTimePlayed / 60)}:{(gameState.totalTimePlayed % 60).toString().padStart(2, '0')}</div>
                    <div className="text-gray-300 text-sm">{t.game.timePlayed}</div>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <Button onClick={onRestart} icon={RotateCcw}>{t.game.tryAgain}</Button>
                <Button onClick={onBackToMenu} variant="secondary">{t.game.mainMenu}</Button>
              </div>
            </div>
          )}
        </div>

        {/* Desktop History Panel (Hidden on mobile) */}
        <div className="desktop-history-panel">
          <h3 className="text-white text-xl font-semibold mb-4">{t.game.recentAttempts}</h3>
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
                {t.game.noAttemptsYet}
              </div>
            )}
          </div>
        </div>

        {/* Range Indicator */}
        {gameState.gameStatus === 'playing' && lastAttempt && (
          <div className="mt-8 max-w-2xl mx-auto range-indicator-panel">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
              <h4 className="text-white text-center mb-4">{t.game.yourLastGuess}: <span className="font-bold">{lastAttempt.number}</span></h4>
              <div className="text-center text-white/80">
                {lastAttempt.result === 'higher' && t.game.numberIsHigher}
                {lastAttempt.result === 'lower' && t.game.numberIsLower}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}