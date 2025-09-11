import React from 'react';
import { useState, useEffect, createContext, useContext } from 'react';

interface AudioSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  soundVolume: number;
  musicVolume: number;
}

interface AudioContextType extends AudioSettings {
  setSoundEnabled: (enabled: boolean) => void;
  setMusicEnabled: (enabled: boolean) => void;
  setSoundVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  playSound: (soundKey: string) => void;
  playMusic: (trackKey: string) => void;
  stopMusic: () => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

export function useAudioSettings() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudioSettings must be used within AudioProvider');
  }
  return context;
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AudioSettings>({
    soundEnabled: true,
    musicEnabled: true,
    soundVolume: 0.7,
    musicVolume: 0.3,
  });

  useEffect(() => {
    // Charger les paramètres sauvegardés
    const savedSettings = localStorage.getItem('magicguess-audio-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.warn('Failed to parse audio settings:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Sauvegarder les paramètres
    localStorage.setItem('magicguess-audio-settings', JSON.stringify(settings));
  }, [settings]);

  const setSoundEnabled = (enabled: boolean) => {
    setSettings(prev => ({ ...prev, soundEnabled: enabled }));
  };

  const setMusicEnabled = (enabled: boolean) => {
    setSettings(prev => ({ ...prev, musicEnabled: enabled }));
  };

  const setSoundVolume = (volume: number) => {
    setSettings(prev => ({ ...prev, soundVolume: Math.max(0, Math.min(1, volume)) }));
  };

  const setMusicVolume = (volume: number) => {
    setSettings(prev => ({ ...prev, musicVolume: Math.max(0, Math.min(1, volume)) }));
  };

  // Fonctions audio désactivées (stubs)
  const playSound = (soundKey: string) => {
    // Audio désactivé temporairement
  };

  const playMusic = (trackKey: string) => {
    // Audio désactivé temporairement
  };

  const stopMusic = () => {
    // Audio désactivé temporairement
  };

  return (
    <AudioContext.Provider value={{
      ...settings,
      setSoundEnabled,
      setMusicEnabled,
      setSoundVolume,
      setMusicVolume,
      playSound,
      playMusic,
      stopMusic,
    }}>
      {children}
    </AudioContext.Provider>
  );
}