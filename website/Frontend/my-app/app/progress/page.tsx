"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiRequest, ProgressData } from "../api";
import { useWebsiteAuth } from "../website-auth";

export default function ProgressPage() {
  const { user, token, ready } = useWebsiteAuth();
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loadedToken, setLoadedToken] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [today, setToday] = useState<Date | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setToday(new Date()));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!token) return;
    let active = true;
    apiRequest<ProgressData>("/app/progress", {}, token)
      .then(data => {
        if (!active) return;
        setProgress(data);
        setLoadedToken(token);
        setError("");
      })
      .catch(loadError => active && setError(loadError instanceof Error ? loadError.message : "Unable to load your progress."));
    return () => { active = false; };
  }, [token]);

  const visibleProgress = loadedToken === token ? progress : null;
  const sessions = useMemo(() => visibleProgress?.sessions ?? [], [visibleProgress]);
  const totals = useMemo(() => ({
    minutes: Math.round(sessions.reduce((sum, session) => sum + session.seconds, 0) / 60),
    calories: sessions.reduce((sum, session) => sum + session.calories, 0),
  }), [sessions]);
  const weeklyGoal = visibleProgress?.goals?.weeklySessions ?? 5;
  const monday = today ? new Date(today) : null;
  monday?.setHours(0, 0, 0, 0);
  monday?.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const weekSessions = monday ? sessions.filter(session => new Date(session.startedAt) >= monday).length : 0;
  const recent = [...sessions].sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()).slice(0, 8);

  return (
    <main className="page-content feature-page">
      <section className="page-intro">
        <span className="eyebrow">YOUR TRAINING, IN PERSPECTIVE</span>
        <h1>Progress that<br /><em>keeps you moving.</em></h1>
        <p>See the sessions you have saved in your WorkOut account and celebrate the consistency you are building.</p>
      </section>
      {!ready ? <p className="notice">Checking your account…</p> : !user ? (
        <section className="feature-callout"><div><span className="eyebrow">MAKE IT PERSONAL</span><h2>Sign in to see your progress.</h2><p>Your workout history and goals sync with your WorkOut account.</p></div><Link className="button button-primary" href="/profile">Sign in</Link></section>
      ) : (
        <>
          {error && <p className="notice notice-error" role="alert">{error}</p>}
          {!visibleProgress && !error && <p className="notice">Loading your saved activity…</p>}
          {visibleProgress && (
            <>
              <section className="feature-metrics" aria-label="Workout summary">
                <article><span className="eyebrow">SESSIONS SAVED</span><strong>{sessions.length}</strong><span>completed workouts</span></article>
                <article><span className="eyebrow">TIME MOVING</span><strong>{totals.minutes.toLocaleString()}<small> min</small></strong><span>across all sessions</span></article>
                <article><span className="eyebrow">CALORIES BURNED</span><strong>{totals.calories.toLocaleString()}</strong><span>estimated total kcal</span></article>
                <article><span className="eyebrow">THIS WEEK</span><strong>{weekSessions}<small> / {weeklyGoal}</small></strong><span>workouts toward your goal</span></article>
              </section>
              <section className="feature-panel">
                <div className="section-heading"><div><span className="eyebrow">RECENT ACTIVITY</span><h2>Your latest sessions</h2></div><Link className="text-link" href="/goals">Manage goals →</Link></div>
                {recent.length ? <div className="activity-list">{recent.map(session => (
                  <article key={session.id}>
                    <span className="activity-icon">✓</span>
                    <div><strong>{session.title}</strong><span>{new Date(session.startedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })} · {Math.round(session.seconds / 60)} min</span></div>
                    <b>{session.calories.toLocaleString()} kcal</b>
                  </article>
                ))}</div> : <p className="notice">Complete a workout in the WorkOut app and your saved sessions will appear here.</p>}
              </section>
            </>
          )}
        </>
      )}
    </main>
  );
}
