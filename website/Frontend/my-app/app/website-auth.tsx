"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiRequest, AppUser } from "./api";

const TOKEN_KEY = "workout-app-token";
type WebsiteAuthValue = {
  user: AppUser | null;
  token: string | null;
  ready: boolean;
  error: string;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setError: (message: string) => void;
};
const WebsiteAuthContext = createContext<WebsiteAuthValue | null>(null);

export function WebsiteAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const frame = window.requestAnimationFrame(() => {
      const stored = window.localStorage.getItem(TOKEN_KEY);
      if (!stored) {
        setReady(true);
        return;
      }
      setToken(stored);
      apiRequest<{ user: AppUser }>("/app/auth/me", {}, stored)
        .then(result => active && setUser(result.user))
        .catch(() => {
          if (!active) return;
          window.localStorage.removeItem(TOKEN_KEY);
          setToken(null);
        })
        .finally(() => active && setReady(true));
    });
    return () => { active = false; window.cancelAnimationFrame(frame); };
  }, []);

  const saveAuth = useCallback((result: { token: string; user: AppUser }) => {
    window.localStorage.setItem(TOKEN_KEY, result.token);
    setToken(result.token);
    setUser(result.user);
    setError("");
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await apiRequest<{ token: string; user: AppUser }>("/app/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    saveAuth(result);
  }, [saveAuth]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const result = await apiRequest<{ token: string; user: AppUser }>("/app/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    saveAuth(result);
  }, [saveAuth]);

  const logout = useCallback(() => {
    window.localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setError("");
  }, []);

  const value = useMemo(() => ({ user, token, ready, error, login, register, logout, setError }), [user, token, ready, error, login, register, logout]);
  return <WebsiteAuthContext.Provider value={value}>{children}</WebsiteAuthContext.Provider>;
}

export function useWebsiteAuth() {
  const context = useContext(WebsiteAuthContext);
  if (!context) throw new Error("useWebsiteAuth must be used inside WebsiteAuthProvider.");
  return context;
}

export function WebsiteShell({ children }: { children: React.ReactNode }) {
  return (
    <WebsiteAuthProvider>
      <div className="site-shell">
        <header className="site-nav">
          <Link className="brand" href="/" aria-label="WorkOut home">
            <span className="brand-mark">W</span>
            <span>WorkOut<small>Move with intention</small></span>
          </Link>
          <nav className="nav-links" aria-label="Main navigation">
            <Link href="/">Home</Link>
            <Link href="/workouts">Explore</Link>
            <Link href="/collections">Collections</Link>
            <Link href="/calendar">Calendar</Link>
            <Link href="/profile">Profile</Link>
            <a className="button button-outline nav-download" href="https://github.com/Mahesh-4017/WorkOut-App/releases/latest/download/WorkOut-App.apk">Download APK <span aria-hidden="true">↓</span></a>
          </nav>
        </header>
        {children}
        <footer className="site-footer">
          <Link className="brand" href="/"><span className="brand-mark">W</span><span>WorkOut<small>Move with intention</small></span></Link>
          <span>Made for your everyday movement.</span>
        </footer>
      </div>
    </WebsiteAuthProvider>
  );
}
