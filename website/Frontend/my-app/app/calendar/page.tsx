"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiRequest, BodyPart, Exercise, PlannedWorkout } from "../api";
import { useWebsiteAuth } from "../website-auth";

const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export default function CalendarPage() {
  const { user, token } = useWebsiteAuth();
  const [month, setMonth] = useState(() => new Date(2000, 0, 1));
  const [selectedDate, setSelectedDate] = useState(() => dateKey(new Date(2000, 0, 1)));
  const [plans, setPlans] = useState<PlannedWorkout[]>([]);
  const [parts, setParts] = useState<BodyPart[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedPart, setSelectedPart] = useState("");
  const [time, setTime] = useState("09:00");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const today = new Date();
      setMonth(new Date(today.getFullYear(), today.getMonth(), 1));
      setSelectedDate(dateKey(today));
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const result = await apiRequest<{ items: PlannedWorkout[] }>("/app/schedule", {}, token);
      setPlans(result.items);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load your calendar.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { void apiRequest<BodyPart[]>("/public/exercises/body-parts").then(setParts).catch(loadError => setError(loadError instanceof Error ? loadError.message : "Unable to load workout categories.")); }, []);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => { void refresh(); });
    return () => window.cancelAnimationFrame(frame);
  }, [refresh]);

  useEffect(() => {
    if (!selectedPart) return;
    let active = true;
    apiRequest<{ items: Exercise[] }>("/public/exercises?bodyPart=" + encodeURIComponent(selectedPart) + "&limit=100")
      .then(result => active && setExercises(result.items))
      .catch(loadError => active && setError(loadError instanceof Error ? loadError.message : "Unable to load exercises."));
    return () => { active = false; };
  }, [selectedPart]);

  const days = useMemo(() => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const leading = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
    const length = new Date(year, monthIndex + 1, 0).getDate();
    const cells: (number | null)[] = [...Array.from({ length: leading }, () => null), ...Array.from({ length }, (_, index) => index + 1)];
    while (cells.length % 7) cells.push(null);
    return cells;
  }, [month]);
  const planDates = useMemo(() => new Set(plans.map(plan => plan.date)), [plans]);
  const selectedPlans = plans.filter(plan => plan.date === selectedDate);

  const scheduleExercise = async (exercise: Exercise) => {
    if (!token) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await apiRequest<{ item: PlannedWorkout }>("/app/schedule", {
        method: "POST",
        body: JSON.stringify({
          exerciseId: exercise._id,
          title: exercise.title,
          bodyPart: exercise.bodyPart,
          category: exercise.category,
          date: selectedDate,
          time,
          durationMinutes: exercise.durationMinutes,
        }),
      }, token);
      setNotice(`${exercise.title} scheduled for ${new Date(`${selectedDate}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" })}.`);
      await refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to schedule this workout.");
    } finally {
      setSaving(false);
    }
  };

  const removePlan = async (id: string) => {
    if (!token) return;
    setError("");
    try {
      await apiRequest<{ id: string }>(`/app/schedule/${encodeURIComponent(id)}`, { method: "DELETE" }, token);
      setPlans(current => current.filter(plan => plan.id !== id));
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Unable to remove this workout.");
    }
  };

  return (
    <main className="page-content calendar-page">
      <section className="page-intro"><Link className="back-link" href="/">← Home</Link><span className="eyebrow">YOUR WORKOUT PLAN</span><h1>Make time<br /><em>for movement.</em></h1><p>Your account calendar syncs planned workouts with the WorkOut app.</p></section>
      {!user && <div className="notice auth-notice">Sign in to save workouts and sync this calendar with the mobile app. <Link className="text-link" href="/profile">Sign in →</Link></div>}
      {error && <div className="notice notice-error" role="alert"><span>{error}</span><button className="text-button" onClick={() => void refresh()}>Try again</button></div>}
      <div className="calendar-layout">
        <section className="calendar-panel">
          <div className="calendar-month"><button type="button" aria-label="Previous month" onClick={() => setMonth(value => new Date(value.getFullYear(), value.getMonth() - 1, 1))}>‹</button><h2>{month.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</h2><button type="button" aria-label="Next month" onClick={() => setMonth(value => new Date(value.getFullYear(), value.getMonth() + 1, 1))}>›</button></div>
          <div className="calendar-grid calendar-weekdays">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => <span key={day}>{day}</span>)}</div>
          <div className="calendar-grid">{days.map((day, index) => {
            if (!day) return <span className="calendar-cell calendar-empty" key={`empty-${index}`} />;
            const key = dateKey(new Date(month.getFullYear(), month.getMonth(), day));
            return <button type="button" key={key} className={`calendar-cell${selectedDate === key ? " selected" : ""}${planDates.has(key) ? " has-plan" : ""}`} onClick={() => setSelectedDate(key)} aria-label={`${key}${planDates.has(key) ? ", scheduled workout" : ""}`}>{day}{planDates.has(key) && <i />}</button>;
          })}</div>
          <div className="calendar-legend"><span><i /> Planned workout</span><span><i className="today-dot" /> Selected date</span></div>
        </section>

        <section className="calendar-day-panel">
          <div className="section-heading"><div><span className="eyebrow">SELECTED DAY</span><h2>{new Date(`${selectedDate}T12:00:00`).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</h2></div>{loading && <span className="eyebrow">SYNCING</span>}</div>
          {!user && <p className="notice">Sign in to view and manage account workouts.</p>}
          {user && !loading && selectedPlans.length === 0 && <p className="notice">Nothing planned yet. Choose an exercise below to schedule it.</p>}
          <div className="scheduled-list">{selectedPlans.map(plan => <article className="scheduled-row" key={plan.id}><span className="schedule-time">{plan.time}</span><div><strong>{plan.title}</strong><span>{[plan.bodyPart, plan.category, `${plan.durationMinutes} min`].filter(Boolean).join(" · ")}</span></div><button type="button" onClick={() => void removePlan(plan.id)} aria-label={`Remove ${plan.title}`}>×</button></article>)}</div>
          {notice && <p className="success-message" role="status">{notice}</p>}
        </section>
      </div>

      <section className="calendar-schedule-panel">
        <div className="section-heading"><div><span className="eyebrow">ADD TO YOUR CALENDAR</span><h2>Plan a workout</h2></div></div>
        <div className="plan-controls">        <label>Focus area<select value={selectedPart} onChange={event => { setSelectedPart(event.target.value); setExercises([]); }}><option value="">Choose a body part</option>{parts.map(part => <option value={part.name} key={part.name}>{part.name}</option>)}</select></label><label>Workout time<input type="time" value={time} onChange={event => setTime(event.target.value)} /></label></div>
        {!token && <p className="notice">Sign in first to save a workout plan.</p>}
        {token && selectedPart && <div className="plan-exercise-list">{exercises.map(exercise => <article key={exercise._id}><div><strong>{exercise.title}</strong><span>{exercise.category} · {exercise.durationMinutes} min · {exercise.level}</span></div><button className="button button-primary" disabled={saving} onClick={() => void scheduleExercise(exercise)}>{saving ? "Saving…" : "Schedule"}</button></article>)}</div>}
      </section>
    </main>
  );
}
