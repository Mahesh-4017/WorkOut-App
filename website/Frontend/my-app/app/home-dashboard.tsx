"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiRequest, FeaturedCard, mediaUrl, PlannedWorkout, ProgressData } from "./api";
import { useWebsiteAuth } from "./website-auth";

function HomeImage({ src, alt }: { src?: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  const url = mediaUrl(src);
  return url && !failed
    ? <img className="featured-image" src={url} alt={alt} loading="lazy" onError={() => setFailed(true)} />
    : <div className="featured-image image-placeholder" aria-hidden="true">✳</div>;
}

export default function HomeDashboard() {
  const { user, token, ready } = useWebsiteAuth();
  const [cards, setCards] = useState<FeaturedCard[]>([]);
  const [cardsError, setCardsError] = useState("");
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [progressToken, setProgressToken] = useState<string | null>(null);
  const [planned, setPlanned] = useState<PlannedWorkout[]>([]);
  const [plannedToken, setPlannedToken] = useState<string | null>(null);
  const [accountMessage, setAccountMessage] = useState<{ token: string; message: string } | null>(null);
  const [now, setNow] = useState<Date | null>(null);
  const todayKey = now ? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}` : "";

  const loadCards = useCallback(async () => {
    setCardsError("");
    try {
      const result = await apiRequest<{ items: FeaturedCard[] }>("/public/cards?featured=true&limit=6");
      setCards(result.items);
    } catch (error) {
      setCardsError(error instanceof Error ? error.message : "Unable to load featured workouts.");
    }
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => { void loadCards(); });
    return () => window.cancelAnimationFrame(frame);
  }, [loadCards]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setNow(new Date()));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!token) return;
    let active = true;
    apiRequest<ProgressData>("/app/progress", {}, token)
      .then(data => {
        if (!active) return;
        setProgress(data);
        setProgressToken(token);
      })
      .catch(error => active && setAccountMessage({ token, message: error instanceof Error ? error.message : "Unable to load your progress." }));
    apiRequest<{ items: PlannedWorkout[] }>("/app/schedule", {}, token)
      .then(data => {
        if (!active) return;
        setPlanned(data.items);
        setPlannedToken(token);
      })
      .catch(error => active && setAccountMessage({ token, message: error instanceof Error ? error.message : "Unable to load your schedule." }));
    return () => { active = false; };
  }, [token]);

  const accountProgress = progressToken === token ? progress : null;
  const accountPlanned = plannedToken === token ? planned : [];
  const currentAccountMessage = accountMessage?.token === token ? accountMessage.message : "";
  const completedThisWeek = useMemo(() => {
    if (!now) return 0;
    const start = new Date(now);
    start.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    start.setHours(0, 0, 0, 0);
    return accountProgress?.sessions.filter(session => new Date(session.startedAt) >= start).length ?? 0;
  }, [now, accountProgress]);
  const upcoming = now ? accountPlanned.filter(item => item.date >= todayKey).slice(0, 3) : [];
  const greeting = !now ? "Welcome" : now.getHours() < 12 ? "Good morning" : now.getHours() < 18 ? "Good afternoon" : "Good evening";

  return (
    <main>
      <section className="home-welcome">
        <div className="welcome-copy">
          <span className="eyebrow"><span className="live-dot" />YOUR MOVEMENT, YOUR PACE</span>
          <h1>{greeting}{user ? `, ${user.name.split(" ")[0]}` : ""}.<br /><em>Ready to move?</em></h1>
          <p>Find a workout that fits today, build consistency, and keep your progress moving forward.</p>
          <div className="hero-actions"><Link className="button button-primary" href="/workouts">Explore workouts <span aria-hidden="true">→</span></Link><Link className="button button-light" href="/calendar">Open calendar <span aria-hidden="true">→</span></Link></div>
        </div>
        <div className="welcome-art" aria-hidden="true"><div className="welcome-sun" /><span className="welcome-art-label">SHOW UP<br />FOR YOURSELF</span></div>
      </section>

      <section className="dashboard-section">
        <div className="dashboard-heading"><div><span className="eyebrow">YOUR DASHBOARD</span><h2>Keep your momentum.</h2></div><Link className="text-link" href="/profile">View profile →</Link></div>
        {!ready && <p className="notice">Checking your account…</p>}
        {currentAccountMessage && <p className="notice notice-error" role="alert">{currentAccountMessage}</p>}
        <div className="dashboard-grid">
          <article className="dashboard-card week-card">
            <div className="dashboard-card-heading"><span className="dashboard-icon">◷</span><span className="eyebrow">THIS WEEK</span></div>
            <strong>{user ? `${completedThisWeek} / ${accountProgress?.goals?.weeklySessions ?? 5}` : "Sign in"}</strong>
            <p>{user ? "workouts completed this week" : "to see your workout progress"}</p>
            <div className="progress-track"><span style={{ width: `${user ? Math.min(100, (completedThisWeek / (accountProgress?.goals?.weeklySessions ?? 5)) * 100) : 0}%` }} /></div>
          </article>
          <article className="dashboard-card plan-card">
            <div className="dashboard-card-heading"><span className="dashboard-icon">▦</span><span className="eyebrow">UP NEXT</span></div>
            {upcoming[0] ? <><strong className="plan-title">{upcoming[0].title}</strong><p>{new Date(`${upcoming[0].date}T12:00:00`).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })} · {upcoming[0].time}</p></> : <><strong className="plan-title">Plan your next workout</strong><p>Choose a date and schedule it in your calendar.</p></>}
            <Link className="text-link" href="/calendar">Open calendar →</Link>
          </article>
          <article className="dashboard-card profile-card">
            <div className="dashboard-card-heading"><span className="dashboard-icon">◎</span><span className="eyebrow">YOUR ACCOUNT</span></div>
            <strong className="plan-title">{user?.name || "Make it personal"}</strong>
            <p>{user ? user.email : "Sign in to track workouts and sync your calendar."}</p>
            <Link className="text-link" href="/profile">{user ? "View your profile →" : "Sign in or create account →"}</Link>
          </article>
        </div>
      </section>

      <section className="featured-section">
        <div className="section-heading"><div><span className="eyebrow">FROM YOUR LIBRARY</span><h2>A little stronger today.</h2></div><Link className="text-link" href="/workouts">All exercises →</Link></div>
        {cardsError && <div className="notice notice-error" role="alert"><span>{cardsError}</span><button className="text-button" onClick={() => void loadCards()}>Try again</button></div>}
        {!cardsError && cards.length === 0 && <p className="notice">Featured sessions will appear here when published.</p>}
        <div className="featured-grid">
          {cards.map(card => <article className="featured-card" key={card._id}><HomeImage src={card.thumbnailUrl} alt={card.title} /><div className="featured-copy"><span className="eyebrow">{card.category || "WORKOUT"}</span><h3>{card.title}</h3><p>{card.description || "A guided session from your workout library."}</p><a className="text-link" href={card.videoUrl} target="_blank" rel="noopener noreferrer">Watch session ↗</a></div></article>)}
        </div>
      </section>
      <section className="download-section"><div><span className="eyebrow">MOVE WITH YOU</span><h2>Take your workout library anywhere.</h2><p>Download the latest Android app and keep going from your phone.</p></div><a className="button button-primary" href="https://github.com/Mahesh-4017/WorkOut-App/releases/latest/download/WorkOut-App.apk">Download latest APK ↓</a></section>
    </main>
  );
}
