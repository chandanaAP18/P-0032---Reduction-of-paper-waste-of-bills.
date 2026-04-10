// lib/AuthContext.js
// Global authentication context - wraps the entire app to provide user state everywhere

import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth } from './firebase';

// Create the context
const AuthContext = createContext({});

// Custom hook to access auth context easily
export const useAuth = () => useContext(AuthContext);

// Provider component that wraps _app.js
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while checking auth state

  // Sign up new user with name, email, password
  const signup = async (name, email, password) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    // Update display name after account creation
    await updateProfile(result.user, { displayName: name });
    return result;
  };

  // Log in existing user
  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  // Log out current user
  const logout = () => signOut(auth);

  // Listen for auth state changes (runs on mount and cleans up on unmount)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // Done checking
    });
    return unsubscribe; // Cleanup listener on unmount
  }, []);

  const value = { user, loading, signup, login, logout };

  // Don't render children until auth state is determined
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
