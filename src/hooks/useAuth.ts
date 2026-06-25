import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { create } from "zustand";

import { auth, googleProvider, isFirebaseConfigured } from "../firebase";

interface AuthStore {
  user: User | null;
  // než proběhne první onAuthStateChanged, nevíme, zda je uživatel přihlášený
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

const useAuth = create<AuthStore>(() => ({
  user: null,
  loading: isFirebaseConfigured,

  signInWithGoogle: async () => {
    if (!isFirebaseConfigured) return;
    await signInWithPopup(auth, googleProvider);
  },

  signOutUser: async () => {
    if (!isFirebaseConfigured) return;
    await signOut(auth);
  },
}));

// Jediný odběr stavu přihlášení – udržuje store v souladu s Firebase Auth.
if (isFirebaseConfigured) {
  onAuthStateChanged(auth, user => useAuth.setState({ user, loading: false }));
}

export default useAuth;
