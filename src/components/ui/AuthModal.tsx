import React, { useState } from 'react';
import { X, Mail, Lock, User, Chrome } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLocale } from '../../hooks/useLocale';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const { t } = useLocale();
  const [formData, setFormData] = useState({
    pseudo: '',
    email: '',
    password: '',
  });
  const { login, loginWithGoogle, loginWithFacebook, register, isLoading, error } = useAuth();
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    
    try {
      if (isLogin) {
        await login(formData.pseudo, formData.email, formData.password);
      } else {
        await register(formData.pseudo, formData.email, formData.password);
      }
      onClose();
    } catch (error) {
      // L'erreur est déjà gérée par le hook useAuth
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setLocalError(null);
    
    try {
      if (provider === 'google') {
        await loginWithGoogle();
      } else {
        await loginWithFacebook();
      }
      onClose();
    } catch (error) {
      // L'erreur est déjà gérée par le hook useAuth
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-gray-900/95 backdrop-blur-xl rounded-3xl p-8 mx-4 max-w-md w-full border border-gray-700/50 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 font-['Orbitron']">
            {isLogin ? t.auth.welcomeBack : t.auth.joinMagicGuess}
          </h2>
          <p className="text-gray-400 mt-2">
            {isLogin ? t.auth.signInToContinue : t.auth.createAccount}
          </p>
        </div>

        {/* Error Message */}
        {(error || localError) && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400 text-sm text-center">
              {error || localError}
            </p>
          </div>
        )}

        {/* Social Login */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => handleSocialLogin('google')}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-3 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl transition-all duration-200 border border-gray-600 hover:border-gray-500"
          >
            <Chrome size={20} />
            <span>{t.auth.continueWithGoogle}</span>
          </button>
          <button
            onClick={() => handleSocialLogin('facebook')}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-3 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition-all duration-200"
          >
            <div className="w-5 h-5 bg-white rounded text-blue-600 flex items-center justify-center text-sm font-bold">f</div>
            <span>{t.auth.continueWithFacebook}</span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-600"></div>
          <span className="px-4 text-gray-400 text-sm">{t.auth.or}</span>
          <div className="flex-1 border-t border-gray-600"></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={isLogin ? t.auth.pseudo : t.auth.pseudo}
              value={formData.pseudo}
              onChange={(e) => setFormData(prev => ({ ...prev, pseudo: e.target.value }))}
              className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 outline-none transition-all duration-200 text-white"
              required
              maxLength={20}
            />
          </div>
          
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="email"
              placeholder={t.auth.emailAddress}
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 outline-none transition-all duration-200 text-white"
              required
            />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="password"
              placeholder={t.auth.password}
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 outline-none transition-all duration-200 text-white"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? t.auth.pleaseWait : (isLogin ? t.auth.signIn : t.auth.createAccount)}
          </button>
        </form>

        {/* Toggle */}
        <div className="text-center mt-6">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-gray-400 hover:text-cyan-400 transition-colors"
          >
            {isLogin ? t.auth.dontHaveAccount : t.auth.alreadyHaveAccount}
          </button>
        </div>
      </div>
    </div>
  );
}