"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest, ProgressData } from "../api";
import { useWebsiteAuth } from "../website-auth";
import { useWebsiteHydrationSignal } from "../website-motion";

export default function ProfilePage() {
  useWebsiteHydrationSignal();
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
        <section className="profile-auth-layout">
          <div className="page-intro profile-auth-intro">
            <Link className="back-link" href="/">← Home</Link>
            <span className="eyebrow">YOUR WORKOUT ACCOUNT</span>
            <h1>Make your progress<br /><em>personal.</em></h1>
            <p>Sign in with the same WorkOut app account to see your progress and keep your calendar in sync.</p>
            <ul className="profile-auth-benefits">
              <li><span aria-hidden="true">✓</span> Keep your workout history in one place</li>
              <li><span aria-hidden="true">✓</span> See your goals and training progress</li>
              <li><span aria-hidden="true">✓</span> Plan your workouts across devices</li>
            </ul>
          </div>
          <section className="auth-card">
            <div className="auth-card-heading"><span className="eyebrow">{mode === "login" ? "WELCOME BACK" : "GET STARTED"}</span><h2>{mode === "login" ? "Sign in to your account" : "Create your account"}</h2><p>{mode === "login" ? "Use your WorkOut app account details." : "Your progress starts with a WorkOut account."}</p></div>
            <div className="auth-tabs"><button className={mode === "login" ? "active" : ""} type="button" onClick={() => { setMode("login"); setError(""); }}>Sign in</button><button className={mode === "register" ? "active" : ""} type="button" onClick={() => { setMode("register"); setError(""); }}>Create account</button></div>
            {error && <p className="notice notice-error" role="alert">{error}</p>}
            <form className="account-form" onSubmit={submit}>
              {mode === "register" && <label>Your name<input required minLength={2} maxLength={100} value={name} onChange={event => setName(event.target.value)} autoComplete="name" /></label>}
              <label>Email address<input required type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" /></label>
              <label>Password<input required minLength={mode === "register" ? 6 : 1} type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete={mode === "register" ? "new-password" : "current-password"} /></label>
              <button className="button button-primary" disabled={submitting} type="submit">{submitting ? "Please wait…" : mode === "login" ? "Sign in to WorkOut" : "Create your account"}</button>
            </form>
            <p className="auth-note">Your account is shared with the WorkOut mobile app.</p>
          </section>
        </section>
      </main>
    );
  }

  const initials = user.name.trim().split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase()).join("");
  const visibleProgress = loadedToken === token ? progress : null;
  const visibleProgressError = progressError?.token === token ? progressError.message : "";
  const sessions = visibleProgress?.sessions ?? [];
  const weeklyGoal = Math.max(0, visibleProgress?.goals?.weeklySessions ?? 0);
  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  const sessionsThisWeek = sessions.filter(session => new Date(session.startedAt) >= weekStart).length;
  const totalMinutes = sessions.reduce((total, session) => total + Math.max(0, session.seconds), 0) / 60;
  const totalCalories = sessions.reduce((total, session) => total + Math.max(0, session.calories), 0);
  const sortedSessions = [...sessions].sort((first, second) => (
    new Date(second.startedAt).getTime() - new Date(first.startedAt).getTime()
  ));
  const formatTrainingTime = (minutes: number) => {
    const roundedMinutes = Math.round(minutes);
    const hours = Math.floor(roundedMinutes / 60);
    const remainingMinutes = roundedMinutes % 60;
    return hours ? `${hours}h ${remainingMinutes}m` : `${remainingMinutes} min`;
  };

  return (
    <main className="page-content profile-page">
      <section className="profile-hero">
        <div className="profile-person"><span className="profile-avatar">{initials || "W"}</span><div><span className="eyebrow">YOUR WORKOUT ACCOUNT</span><h1>{user.name}</h1><p>{user.email}</p>{user.createdAt && <span className="profile-member-since">Member since {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>}</div></div>
        <button className="button button-light" type="button" onClick={logout}>Sign out</button>
      </section>
      <nav className="profile-shortcuts" aria-label="Quick links">
        <Link href="/workouts"><span aria-hidden="true">↗</span><strong>Explore workouts</strong><small>Find your next session</small></Link>
        <Link href="/collections"><span aria-hidden="true">✦</span><strong>Collections</strong><small>Browse focus areas</small></Link>
        <Link href="/calendar"><span aria-hidden="true">◷</span><strong>My calendar</strong><small>Plan your week</small></Link>
      </nav>
      <section className="profile-stats">
        <article><span className="eyebrow">WORKOUTS COMPLETED</span><strong>{visibleProgress ? sessions.length : "—"}</strong><span>sessions saved to your account</span></article>
        <article><span className="eyebrow">TIME MOVING</span><strong>{visibleProgress ? formatTrainingTime(totalMinutes) : "—"}</strong><span>across your completed sessions</span></article>
        <article><span className="eyebrow">THIS WEEK</span><strong>{visibleProgress && weeklyGoal > 0 ? `${sessionsThisWeek} / ${weeklyGoal}` : "—"}</strong><span>{weeklyGoal > 0 ? "sessions toward your weekly goal" : "set a weekly goal in the app"}</span></article>
      </section>
      {visibleProgressError && <p className="notice notice-error" role="alert">{visibleProgressError}</p>}
      {visibleProgress && weeklyGoal > 0 ? (
        <section className="profile-goal" aria-label="Weekly workout goal progress">
          <div><span className="eyebrow">WEEKLY CONSISTENCY</span><strong>{Math.min(100, Math.round((sessionsThisWeek / weeklyGoal) * 100))}%</strong></div>
          <div className="profile-goal-track" role="progressbar" aria-label="Weekly workout goal" aria-valuemin={0} aria-valuemax={weeklyGoal} aria-valuenow={Math.min(sessionsThisWeek, weeklyGoal)}><span style={{ width: `${Math.min(100, (sessionsThisWeek / weeklyGoal) * 100)}%` }} /></div>
          <p>{sessionsThisWeek >= weeklyGoal ? "You reached your weekly workout goal. Keep that momentum going." : `${weeklyGoal - sessionsThisWeek} ${weeklyGoal - sessionsThisWeek === 1 ? "session" : "sessions"} to reach your weekly goal.`}</p>
        </section>
      ) : null}
      <section className="profile-panel">
        <div className="section-heading"><div><span className="eyebrow">ACCOUNT DETAILS</span><h2>Your profile</h2></div><Link className="text-link" href="/calendar">View calendar →</Link></div>
        <dl className="profile-details"><div><dt>Name</dt><dd>{user.name}</dd></div><div><dt>Email</dt><dd>{user.email}</dd></div><div><dt>Fitness goal</dt><dd>{user.goal || "Not set"}</dd></div><div><dt>Phone</dt><dd>{user.phone || "Not set"}</dd></div><div><dt>Age</dt><dd>{user.age ? `${user.age} years` : "Not set"}</dd></div><div><dt>Gender</dt><dd>{user.gender || "Not set"}</dd></div><div><dt>Height</dt><dd>{user.height ? `${user.height} cm` : "Not set"}</dd></div><div><dt>Weight</dt><dd>{user.weight ? `${user.weight} kg` : "Not set"}</dd></div><div><dt>Target weight</dt><dd>{visibleProgress?.goals?.targetWeightKg ? `${visibleProgress.goals.targetWeightKg} kg` : "Not set"}</dd></div><div><dt>Calories burned</dt><dd>{visibleProgress ? `${totalCalories.toLocaleString("en-US")} kcal` : "—"}</dd></div></dl>
      </section>
      <section className="profile-panel">
        <div className="section-heading"><div><span className="eyebrow">RECENT ACTIVITY</span><h2>Workout history</h2></div><span className="activity-count">{visibleProgress ? `${sessions.length} ${sessions.length === 1 ? "session" : "sessions"}` : ""}</span></div>
        {!visibleProgress
          ? <p className="notice" role="status">{visibleProgressError ? "Progress could not be loaded." : "Syncing your recent activity…"}</p>
          : !visibleProgress.sessions.length
            ? <p className="notice">Completed workout sessions will appear here.</p>
            : <div className="activity-list">{sortedSessions.slice(0, 8).map(session => <article key={session.id}><span className="activity-icon">✓</span><div><strong>{session.title}</strong><span>{new Date(session.startedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · {Math.round(session.seconds / 60)} min</span></div><b>{session.calories.toLocaleString("en-US")} kcal</b></article>)}</div>}
      </section>
    </main>
  );
}
