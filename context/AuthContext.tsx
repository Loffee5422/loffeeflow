import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';

type SubscriptionTier = 'FREE' | 'PRO';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  subscriptionTier: SubscriptionTier;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  signInAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  upgradeSubscription: () => Promise<void>; // Mock function for UI demo
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>('FREE');

  useEffect(() => {
    if (!auth) {
        setLoading(false);
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // In a real app, we would fetch the custom claim or firestore document here
      // to check if the user has an active Stripe subscription.
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const clearError = () => setError(null);

  const handleError = (err: any) => {
      console.error("Auth Error:", err);
      let msg = err.message;
      
      if (err.code === 'auth/unauthorized-domain') {
          msg = `Domain Unauthorized: Please add "${window.location.hostname}" to Firebase Console > Authentication > Settings > Authorized Domains.`;
      } else if (err.code === 'auth/operation-not-allowed') {
          msg = `This sign-in method is disabled. Enable it in Firebase Console.`;
      } else if (err.code === 'auth/popup-closed-by-user') {
          msg = "Sign-in cancelled by user.";
      } else if (err.code === 'auth/popup-blocked') {
          msg = "Sign-in popup was blocked by your browser.";
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
          msg = "Invalid email or password.";
      }
      
      setError(msg);
  };

  const signInWithGoogle = async () => {
    setError(null);
    if (!auth || !googleProvider) {
        setError("Firebase configuration is missing.");
        return;
    }
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      handleError(err);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setError(null);
    if (!auth) return;
    try {
        await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
        handleError(err);
    }
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    setError(null);
    if (!auth) return;
    try {
        await createUserWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
        handleError(err);
    }
  };

  const signInAsGuest = async () => {
    setError(null);
    if (!auth) return;
    try {
        await signInAnonymously(auth);
    } catch (err: any) {
        handleError(err);
    }
  };

  const logout = async () => {
    setError(null);
    if (!auth) return;
    try {
      await signOut(auth);
      setSubscriptionTier('FREE'); // Reset on logout
    } catch (err: any) {
      handleError(err);
    }
  };

  // Mock Payment Flow
  const upgradeSubscription = async () => {
      setLoading(true);
      // Simulate API call to Stripe
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSubscriptionTier('PRO');
      setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ 
        user, 
        loading, 
        error, 
        subscriptionTier,
        signInWithGoogle, 
        signInWithEmail, 
        signUpWithEmail, 
        signInAsGuest, 
        logout, 
        clearError,
        upgradeSubscription
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};