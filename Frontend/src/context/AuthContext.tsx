import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AppUser, getCurrentUser, loginUser, logoutUser, registerUser } from "../api/auth";
import { signInWithGoogle } from "../services/googleAuth";
import { signInWithApple } from "../services/appleAuth";
import { OnboardingData } from "../utils/onboarding";

type AuthContextValue = {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AppUser>;
  loginWithGoogle: () => Promise<AppUser | null>;
  loginWithApple: () => Promise<AppUser | null>;
  register: (payload: { name: string; email: string; password: string; phone?: string } & OnboardingData) => Promise<AppUser>;
  restore: () => Promise<AppUser | null>;
  logout: () => Promise<void>;
  setUser: (user: AppUser | null) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(false);
  const login = useCallback(async (email: string, password: string) => { setLoading(true); try { const nextUser = await loginUser(email, password); setUser(nextUser); return nextUser; } finally { setLoading(false); } }, []);
  const loginWithGoogle = useCallback(async () => { setLoading(true); try { const nextUser = await signInWithGoogle(); if (nextUser) setUser(nextUser); return nextUser; } finally { setLoading(false); } }, []);
  const loginWithApple = useCallback(async () => { setLoading(true); try { const nextUser = await signInWithApple(); if (nextUser) setUser(nextUser); return nextUser; } finally { setLoading(false); } }, []);
  const register = useCallback(async (payload: { name: string; email: string; password: string; phone?: string } & OnboardingData) => { setLoading(true); try { const nextUser = await registerUser(payload); setUser(nextUser); return nextUser; } finally { setLoading(false); } }, []);
  const restore = useCallback(async () => { setLoading(true); try { const restored = await getCurrentUser(); setUser(restored); return restored; } catch { setUser(null); return null; } finally { setLoading(false); } }, []);
  const logout = useCallback(async () => { await logoutUser(); setUser(null); }, []);
  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    setUser,
    login,
    loginWithGoogle,
    loginWithApple,
    register,
    restore,
    logout,
  }), [loading, login, loginWithApple, loginWithGoogle, logout, register, restore, user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}