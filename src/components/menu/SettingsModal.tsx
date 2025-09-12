import React, { useState } from 'react';
import { X, Volume2, VolumeX, Monitor, Smartphone, Palette } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAudioSettings } from '../../hooks/useAudioSettings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const {
    soundEnabled,
    musicEnabled,
    soundVolume,
    musicVolume,
    setSoundEnabled,
    setMusicEnabled,
    setSoundVolume,
    setMusicVolume,
    playSound
  } = useAudioSettings();
  
  const [displaySettings, setDisplaySettings] = useState({
    theme: 'auto',
    animations: true,
    notifications: true,
  });

  if (!isOpen) return null;

  const updateDisplaySetting = (key: string, value: boolean | string) => {
    setDisplaySettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-gray-900/95 backdrop-blur-xl rounded-3xl p-8 max-w-lg w-full border border-gray-700/50 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white">Settings</h2>
          <p className="text-gray-400 mt-2">Customize your game experience</p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Audio Settings */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
              {soundEnabled ? <Volume2 className="mr-2" size={20} /> : <VolumeX className="mr-2" size={20} />}
              Audio
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl">
                <span className="text-gray-300">Sound Effects</span>
                <button
                  onClick={() => {
                    setSoundEnabled(!soundEnabled);
                    if (!soundEnabled) playSound('click');
                  }}
                  className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                    soundEnabled ? 'bg-purple-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                    soundEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              
              {/* Volume du son */}
              {soundEnabled && (
                <div className="p-3 bg-gray-800/50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 text-sm">Volume des effets</span>
                    <span className="text-white text-sm">{Math.round(soundVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={soundVolume}
                    onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl">
                <span className="text-gray-300">Background Music</span>
                <button
                  onClick={() => setMusicEnabled(!musicEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                    musicEnabled ? 'bg-purple-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                    musicEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              
              {/* Volume de la musique */}
              {musicEnabled && (
                <div className="p-3 bg-gray-800/50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 text-sm">Volume de la musique</span>
                    <span className="text-white text-sm">{Math.round(musicVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={musicVolume}
                    onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Display Settings */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
              <Monitor className="mr-2" size={20} />
              Display
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-gray-800/50 rounded-xl">
                <label className="text-gray-300 block mb-2">Theme</label>
                <div className="grid grid-cols-3 gap-2">
                  {['auto', 'dark', 'light'].map((theme) => (
                    <button
                      key={theme}
                      onClick={() => updateDisplaySetting('theme', theme)}
                      className={`p-2 rounded-lg text-sm capitalize transition-all duration-200 ${
                        displaySettings.theme === theme
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {theme === 'auto' && <Smartphone size={16} className="inline mr-1" />}
                      {theme === 'dark' && <Monitor size={16} className="inline mr-1" />}
                      {theme === 'light' && <Palette size={16} className="inline mr-1" />}
                      {theme}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl">
                <span className="text-gray-300">Animations</span>
                <button
                  onClick={() => updateDisplaySetting('animations', !displaySettings.animations)}
                  className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                    displaySettings.animations ? 'bg-purple-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                    displaySettings.animations ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Gameplay Settings */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Gameplay</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl">
                <span className="text-gray-300">Push Notifications</span>
                <button
                  onClick={() => updateDisplaySetting('notifications', !displaySettings.notifications)}
                  className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                    displaySettings.notifications ? 'bg-purple-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                    displaySettings.notifications ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 mt-8">
          <Button
            onClick={() => {
              // Reset to defaults
              setSoundEnabled(true);
              setMusicEnabled(true);
              setSoundVolume(0.7);
              setMusicVolume(0.3);
              setDisplaySettings({
                theme: 'auto',
                animations: true,
                notifications: true,
              });
            }}
            variant="secondary"
            className="flex-1"
          >
            Reset to Defaults
          </Button>
          <Button
            onClick={onClose}
            variant="primary"
            className="flex-1"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}