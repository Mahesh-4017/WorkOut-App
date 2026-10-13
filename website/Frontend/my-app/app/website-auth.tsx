"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { apiRequest, AppUser } from "./api";
import { WebsiteMotion, WebsiteSplash } from "./website-motion";

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
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [
    { href: "/", label: "Home" },
    { href: "/workouts", label: "Explore" },
    { href: "/collections", label: "Collections" },
    { href: "/yoga", label: "Yoga" },
    { href: "/calendar#planner", label: "Plan" },
    { href: "/calendar", label: "Calendar" },
    { href: "/profile", label: "Profile" },
  ];

  const isCurrentPage = (href: string) => {
    if (href.includes("#")) return false;
    const route = href.split("#")[0];
    return route === "/" ? pathname === route : pathname === route || pathname.startsWith(`${route}/`);
  };

  return (
    <WebsiteAuthProvider>
      <WebsiteMotion>
        <WebsiteSplash />
        <header className="site-nav">
          <Link className="brand" href="/" aria-label="WorkOut home">
            <span className="brand-wordmark">WorkOut</span>
          </Link>
          <button
            className={`nav-toggle${menuOpen ? " is-open" : ""}`}
            type="button"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="main-navigation"
            onClick={() => setMenuOpen(open => !open)}
          >
            <span />
            <span />
            <span />
          </button>
          <nav
            id="main-navigation"
            className={`nav-links${menuOpen ? " is-open" : ""}`}
            aria-label="Main navigation"
          >
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isCurrentPage(link.href) ? "page" : undefined}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <a
              className="button button-outline nav-download"
              href="https://github.com/Mahesh-4017/WorkOut-App/releases/latest/download/WorkOut-App.apk"
              onClick={() => setMenuOpen(false)}
            >
              Download APK <span aria-hidden="true">↓</span>
            </a>
          </nav>
        </header>
        {children}
        <footer className="site-footer">
          <div className="footer-brand">
            <span className="footer-kicker"><span /> MOVE WITH INTENTION</span>
            <Link className="brand" href="/" aria-label="WorkOut home">
              <span className="brand-wordmark">WorkOut</span>
            </Link>
            <p>Make space for movement, build a routine that fits your life, and keep showing up for yourself.</p>
          </div>
          <nav className="footer-links" aria-label="Footer navigation">
            <div><strong>Explore</strong><Link href="/workouts">Workout library</Link><Link href="/collections">Collections</Link><Link href="/yoga">Yoga &amp; mobility</Link></div>
            <div><strong>Your plan</strong><Link href="/calendar">Calendar</Link><Link href="/calendar#planner">Plan your day</Link><Link href="/profile">Your profile</Link></div>
          </nav>
          <div className="footer-download">
            <span className="footer-download-title">Keep moving on the go</span>
            <p>Take your workouts with you wherever the day goes.</p>
            <a className="button button-primary" href="https://github.com/Mahesh-4017/WorkOut-App/releases/latest/download/WorkOut-App.apk">Get the Android app <span aria-hidden="true">↓</span></a>
          </div>
          <div className="footer-bottom"><span>© WorkOut</span><span>Made for your everyday movement.</span><Link href="/">Back to top ↑</Link></div>
        </footer>
      </WebsiteMotion>
    </WebsiteAuthProvider>
  );
}
