import { useState, useEffect, createContext, useContext } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { AuthService } from '../services/authService';
import { UserService } from '../services/userService';
import type { User } from '../types/game';

interface AuthContextType {
  user: User | null;
  login: (pseudo: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  register: (pseudo: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Observer les changements d'état d'authentification Firebase
    const unsubscribe = AuthService.onAuthStateChanged(async (firebaseUser: FirebaseUser | null) => {
      setIsLoading(true);
      setError(null);
      
      console.log('🔍 [useAuth] Firebase User changed:', firebaseUser);
      
      if (firebaseUser) {
        try {
          console.log('🔍 [useAuth] Fetching user data for UID:', firebaseUser.uid);
          // Récupérer les données complètes de l'utilisateur depuis Firestore
          const userData = await UserService.getUser(firebaseUser.uid);
          console.log('🔍 [useAuth] User data received:', userData);
          setUser(userData);
        } catch (error) {
          console.error('Erreur lors de la récupération des données utilisateur:', error);
          setError('Erreur lors du chargement du profil');
          setUser(null);
        }
      } else {
        console.log('🔍 [useAuth] No Firebase user, setting user to null');
        setUser(null);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (pseudo: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const userData = await AuthService.signInWithEmail(pseudo, email, password);
      setUser(userData);
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const userData = await AuthService.signInWithGoogle();
      setUser(userData);
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithFacebook = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const userData = await AuthService.signInWithFacebook();
      setUser(userData);
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (pseudo: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const userData = await AuthService.signUpWithEmail(pseudo, email, password);
      setUser(userData);
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AuthService.signOut();
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      loginWithGoogle,
      loginWithFacebook,
      register,
      logout,
      isLoading,
      error,
    }}>
      {children}
    </AuthContext.Provider>
  );
}