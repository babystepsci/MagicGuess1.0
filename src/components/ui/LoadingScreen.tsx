import React, { useState, useEffect } from 'react';
import { useLocale } from '../../hooks/useLocale';

interface LoadingScreenProps {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [showLogo, setShowLogo] = useState(false);
  const { t } = useLocale();

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        const next = prev + Math.random() * 15;
        if (next >= 100) {
          setTimeout(() => onComplete(), 500);
          return 100;
        }
        return next;
      });
    }, 200);

    setTimeout(() => setShowLogo(true), 500);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center overflow-hidden">
      {/* Animated background particles */}
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
      
      {/* Game elements in background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 border-4 border-purple-400 rounded-full animate-spin" style={{ animationDuration: '20s' }} />
        <div className="absolute bottom-20 right-20 w-24 h-24 border-4 border-cyan-400 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
        <div className="absolute top-1/2 left-10 w-16 h-16 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-lg animate-pulse" />
        <div className="absolute top-1/3 right-10 w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-bounce" style={{ animationDuration: '2s' }} />
      </div>

      <div className="text-center z-10">
        {/* Logo Animation */}
        <div className={`mb-8 transform transition-all duration-1000 ${
          showLogo ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }`}>
          <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 font-['Orbitron'] animate-pulse">
            magic<span className="text-yellow-400">Guess</span>
          </h1>
          <p className="text-xl text-gray-300 mt-4 font-light">
            {t.menu.ultimateExperience}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-80 max-w-md mx-auto">
          <div className="bg-gray-800 rounded-full h-3 overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full transition-all duration-300 ease-out shadow-lg"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-gray-400 mt-3 text-sm">
            {t.loading.loading} {Math.round(progress)}%
          </p>
        </div>

        {/* Loading Animation */}
        <div className="mt-8 flex justify-center space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full animate-bounce"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '0.8s',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}