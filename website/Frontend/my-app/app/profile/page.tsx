"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest, ProgressData } from "../api";
import { useWebsiteAuth } from "../website-auth";

export default function ProfilePage() {
  const { user, token, ready, error, login, register, logout, setError } = useWebsiteAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loadedToken, setLoadedToken] = useState<string | null>(null);
  const [progressError, setProgressError] = useState<{ token: string; message: string } | null>(null);

  useEffect(() => {
    if (!token) return;
    let active = true;
    apiRequest<ProgressData>("/app/progress", {}, token)
      .then(data => {
        if (!active) return;
        setProgress(data);
        setLoadedToken(token);
      })
      .catch(loadError => active && setProgressError({ token, message: loadError instanceof Error ? loadError.message : "Unable to load your progress." }));
    return () => { active = false; };
  }, [token]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      if (mode === "login") await login(email, password);
      else await register(name, email, password);
      setPassword("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!ready) return <main className="page-content"><p className="notice">Loading your account…</p></main>;

  if (!user) {
    return (
      <main className="page-content profile-page">
        <section className="page-intro"><Link className="back-link" href="/">← Home</Link><span className="eyebrow">YOUR WORKOUT ACCOUNT</span><h1>Make your progress<br /><em>personal.</em></h1><p>Sign in with the same WorkOut app account to see your profile and sync your calendar between devices.</p></section>
        <section className="auth-card">
          <div className="auth-tabs"><button className={mode === "login" ? "active" : ""} type="button" onClick={() => { setMode("login"); setError(""); }}>Sign in</button><button className={mode === "register" ? "active" : ""} type="button" onClick={() => { setMode("register"); setError(""); }}>Create account</button></div>
          {error && <p className="notice notice-error" role="alert">{error}</p>}
          <form className="account-form" onSubmit={submit}>
            {mode === "register" && <label>Your name<input required minLength={2} maxLength={100} value={name} onChange={event => setName(event.target.value)} autoComplete="name" /></label>}
            <label>Email address<input required type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" /></label>
            <label>Password<input required minLength={mode === "register" ? 6 : 1} type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete={mode === "register" ? "new-password" : "current-password"} /></label>
            <button className="button button-primary" disabled={submitting} type="submit">{submitting ? "Please wait…" : mode === "login" ? "Sign in to WorkOut" : "Create your account"}</button>
          </form>
          <p className="auth-note">Use your existing mobile app email and password to access your account data.</p>
        </section>
      </main>
    );
  }

  const initials = user.name.trim().split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase()).join("");
  const visibleProgress = loadedToken === token ? progress : null;
  const visibleProgressError = progressError?.token === token ? progressError.message : "";
  return (
    <main className="page-content profile-page">
      <section className="profile-hero">
        <div className="profile-person"><span className="profile-avatar">{initials || "W"}</span><div><span className="eyebrow">WORKOUT MEMBER</span><h1>{user.name}</h1><p>{user.email}</p></div></div>
        <button className="button button-light" type="button" onClick={logout}>Sign out</button>
      </section>
      <section className="profile-stats">
        <article><span className="eyebrow">COMPLETED SESSIONS</span><strong>{visibleProgress?.sessions.length ?? "—"}</strong><span>saved to your account</span></article>
        <article><span className="eyebrow">WEEKLY GOAL</span><strong>{visibleProgress?.goals?.weeklySessions ?? "—"}</strong><span>sessions per week</span></article>
        <article><span className="eyebrow">TARGET WEIGHT</span><strong>{visibleProgress?.goals?.targetWeightKg ? `${visibleProgress.goals.targetWeightKg} kg` : "—"}</strong><span>personal goal</span></article>
      </section>
      {visibleProgressError && <p className="notice notice-error" role="alert">{visibleProgressError}</p>}
      <section className="profile-panel">
        <div className="section-heading"><div><span className="eyebrow">ACCOUNT DETAILS</span><h2>Your profile</h2></div><Link className="text-link" href="/calendar">View calendar →</Link></div>
        <dl className="profile-details"><div><dt>Name</dt><dd>{user.name}</dd></div><div><dt>Email</dt><dd>{user.email}</dd></div><div><dt>Fitness goal</dt><dd>{user.goal || "Not set"}</dd></div><div><dt>Age</dt><dd>{user.age ? `${user.age} years` : "Not set"}</dd></div><div><dt>Height</dt><dd>{user.height ? `${user.height} cm` : "Not set"}</dd></div><div><dt>Weight</dt><dd>{user.weight ? `${user.weight} kg` : "Not set"}</dd></div></dl>
      </section>
      <section className="profile-panel">
        <div className="section-heading"><div><span className="eyebrow">RECENT ACTIVITY</span><h2>Workout history</h2></div></div>
        {!visibleProgress?.sessions.length ? <p className="notice">Completed workout sessions will appear here.</p> : <div className="activity-list">{visibleProgress.sessions.slice(0, 8).map(session => <article key={session.id}><span className="activity-icon">✓</span><div><strong>{session.title}</strong><span>{new Date(session.startedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })} · {Math.round(session.seconds / 60)} min</span></div><b>{session.calories} kcal</b></article>)}</div>}
      </section>
    </main>
  );
}
