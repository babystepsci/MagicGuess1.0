import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { UserService } from './userService';
import type { User } from '../types/game';

export class AuthService {
  private static googleProvider = new GoogleAuthProvider();
  private static facebookProvider = new FacebookAuthProvider();

  // Connexion avec email/mot de passe
  static async signInWithEmail(pseudo: string, email: string, password: string): Promise<User> {
    try {
      console.log('🔍 [AuthService] Signing in with email:', email, 'pseudo:', pseudo);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      console.log('🔍 [AuthService] Firebase user signed in:', firebaseUser.uid);
      
      // Mettre à jour les données utilisateur dans Firestore
      await UserService.createOrUpdateUser(firebaseUser.uid, {
        pseudo: pseudo || firebaseUser.displayName || email.split('@')[0],
        name: pseudo || firebaseUser.displayName || email.split('@')[0], // Assurer que name est aussi défini
        email: firebaseUser.email || email,
        avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      });

      console.log('🔍 [AuthService] User data updated, fetching complete user data');
      // Récupérer les données complètes de l'utilisateur
      const userData = await UserService.getUser(firebaseUser.uid);
      console.log('🔍 [AuthService] Complete user data retrieved:', userData);
      if (!userData) throw new Error('Impossible de récupérer les données utilisateur');

      return userData;
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  // Inscription avec email/mot de passe
  static async signUpWithEmail(pseudo: string, email: string, password: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Mettre à jour le profil Firebase
      await updateProfile(firebaseUser, {
        displayName: pseudo,
        photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${pseudo}`,
      });

      // Créer le profil utilisateur dans Firestore
      await UserService.createOrUpdateUser(firebaseUser.uid, {
        pseudo,
        name: pseudo, // Assurer que name est aussi défini
        email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${pseudo}`,
      });

      // Récupérer les données complètes de l'utilisateur
      const userData = await UserService.getUser(firebaseUser.uid);
      if (!userData) throw new Error('Impossible de créer le profil utilisateur');

      return userData;
    } catch (error: any) {
      console.error('Erreur d\'inscription:', error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  // Connexion avec Google
  static async signInWithGoogle(): Promise<User> {
    try {
      const result = await signInWithPopup(auth, this.googleProvider);
      const firebaseUser = result.user;

      await UserService.createOrUpdateUser(firebaseUser.uid, {
        pseudo: firebaseUser.displayName || 'Utilisateur Google',
        name: firebaseUser.displayName || 'Utilisateur Google', // Assurer que name est aussi défini
        email: firebaseUser.email || '',
        avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.displayName || 'google-user'}`,
      });

      const userData = await UserService.getUser(firebaseUser.uid);
      if (!userData) throw new Error('Impossible de récupérer les données utilisateur');

      return userData;
    } catch (error: any) {
      console.error('Erreur de connexion Google:', error);
      throw new Error('Erreur lors de la connexion avec Google');
    }
  }

  // Connexion avec Facebook
  static async signInWithFacebook(): Promise<User> {
    try {
      const result = await signInWithPopup(auth, this.facebookProvider);
      const firebaseUser = result.user;

      await UserService.createOrUpdateUser(firebaseUser.uid, {
        pseudo: firebaseUser.displayName || 'Utilisateur Facebook',
        name: firebaseUser.displayName || 'Utilisateur Facebook', // Assurer que name est aussi défini
        email: firebaseUser.email || '',
        avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.displayName || 'facebook-user'}`,
      });

      const userData = await UserService.getUser(firebaseUser.uid);
      if (!userData) throw new Error('Impossible de récupérer les données utilisateur');

      return userData;
    } catch (error: any) {
      console.error('Erreur de connexion Facebook:', error);
      throw new Error('Erreur lors de la connexion avec Facebook');
    }
  }

  // Déconnexion
  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
      throw new Error('Erreur lors de la déconnexion');
    }
  }

  // Observer les changements d'état d'authentification
  static onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  // Messages d'erreur traduits
  private static getAuthErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'Aucun utilisateur trouvé avec cette adresse email';
      case 'auth/wrong-password':
        return 'Mot de passe incorrect';
      case 'auth/email-already-in-use':
        return 'Cette adresse email est déjà utilisée';
      case 'auth/weak-password':
        return 'Le mot de passe doit contenir au moins 6 caractères';
      case 'auth/invalid-email':
        return 'Adresse email invalide';
      case 'auth/too-many-requests':
        return 'Trop de tentatives. Veuillez réessayer plus tard';
      case 'auth/operation-not-allowed':
        return 'Cette méthode de connexion n\'est pas activée';
      case 'auth/user-disabled':
        return 'Ce compte utilisateur a été désactivé';
      case 'auth/invalid-credential':
        return 'Identifiants invalides';
      default:
        return 'Une erreur est survenue lors de l\'authentification';
    }
  }
}