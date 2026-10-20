"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest, PlannedWorkout } from "../api";
import { useWebsiteAuth } from "../website-auth";

export default function NotificationsPage() {
  const { user, token, ready } = useWebsiteAuth();
  const [planned, setPlanned] = useState<PlannedWorkout[]>([]);
  const [loadedToken, setLoadedToken] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [todayKey, setTodayKey] = useState("");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const today = new Date();
      setTodayKey(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!token) return;
    let active = true;
    const offset = new Date().getTimezoneOffset();
    apiRequest<{ items: PlannedWorkout[] }>(`/app/schedule?timezoneOffsetMinutes=${offset}`, {}, token)
      .then(result => {
        if (!active) return;
        setPlanned(result.items);
        setLoadedToken(token);
        setError("");
      })
      .catch(loadError => active && setError(loadError instanceof Error ? loadError.message : "Unable to load your reminders."));
    return () => { active = false; };
  }, [token]);

  const upcoming = planned.filter(item => item.date >= todayKey).sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  const reminderCount = upcoming.filter(item => item.reminderEnabled).length;

  return (
    <main className="page-content feature-page">
      <section className="page-intro">
        <span className="eyebrow">A LITTLE NUDGE FOR YOUR NEXT MOVE</span>
        <h1>Your plans,<br /><em>all in one place.</em></h1>
        <p>Review upcoming workouts and the reminders saved with your schedule.</p>
      </section>
      {!ready ? <p className="notice">Checking your account…</p> : !user ? (
        <section className="feature-callout"><div><span className="eyebrow">YOUR WORKOUT ACCOUNT</span><h2>Sign in to see your reminders.</h2><p>Your scheduled workouts are available across devices when you use the same account.</p></div><Link className="button button-primary" href="/profile">Sign in</Link></section>
      ) : (
        <>
          {error && <p className="notice notice-error" role="alert">{error}</p>}
          {loadedToken !== token && !error && <p className="notice">Loading your upcoming plans…</p>}
          {loadedToken === token && <>
            <section className="feature-metrics feature-metrics-three">
              <article><span className="eyebrow">UPCOMING PLANS</span><strong>{upcoming.length}</strong><span>on your calendar</span></article>
              <article><span className="eyebrow">REMINDERS ON</span><strong>{reminderCount}</strong><span>for scheduled workouts</span></article>
              <article><span className="eyebrow">NEXT WORKOUT</span><strong className="metric-date">{upcoming[0] ? new Date(`${upcoming[0].date}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "—"}</strong><span>{upcoming[0]?.title ?? "Nothing scheduled yet"}</span></article>
            </section>
            <section className="feature-panel">
              <div className="section-heading"><div><span className="eyebrow">YOUR SCHEDULE</span><h2>Coming up</h2></div><Link className="text-link" href="/calendar">Open calendar →</Link></div>
              {upcoming.length ? <div className="reminder-list">{upcoming.map(item => (
                <article key={item.id}><span className="reminder-date">{new Date(`${item.date}T12:00:00`).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</span><div><strong>{item.title}</strong><span>{item.time} · {item.durationMinutes} min{item.bodyPart ? ` · ${item.bodyPart}` : ""}</span></div><b className={item.reminderEnabled ? "reminder-enabled" : ""}>{item.reminderEnabled ? "Reminder on" : "No reminder"}</b></article>
              ))}</div> : <p className="notice">No upcoming workouts yet. Add one to your calendar to see it here.</p>}
            </section>
          </>}
        </>
      )}
      <p className="feature-note">This page shows reminders saved with your workout schedule. Browser push notifications are not enabled on this website.</p>
    </main>
  );
}
