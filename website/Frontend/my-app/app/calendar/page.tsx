"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiRequest, BodyPart, DailyPlan, Exercise, PlannedWorkout } from "../api";
import { useWebsiteAuth } from "../website-auth";
import { useWebsiteHydrationSignal } from "../website-motion";

const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const planOccursOnDate = (start: string, repeatDays: number[] | undefined, date: string) =>
  repeatDays?.length
    ? date >= start && repeatDays.includes(new Date(`${date}T12:00:00`).getDay())
    : date === start;

export default function CalendarPage() {
  useWebsiteHydrationSignal();
  const { user, token } = useWebsiteAuth();
  const [month, setMonth] = useState(() => new Date(2000, 0, 1));
  const [selectedDate, setSelectedDate] = useState(() => dateKey(new Date(2000, 0, 1)));
  const [todayKey, setTodayKey] = useState("");
  const [currentTimestamp, setCurrentTimestamp] = useState(0);
  const [calendarReady, setCalendarReady] = useState(false);
  const [plans, setPlans] = useState<PlannedWorkout[]>([]);
  const [dayPlans, setDayPlans] = useState<DailyPlan[]>([]);
  const [parts, setParts] = useState<BodyPart[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exerciseLoading, setExerciseLoading] = useState(false);
  const [exerciseError, setExerciseError] = useState("");
  const [selectedPart, setSelectedPart] = useState("");
  const [time, setTime] = useState("09:00");
  const [workoutRepeatDays, setWorkoutRepeatDays] = useState<number[]>([]);
  const [workoutReminderEnabled, setWorkoutReminderEnabled] = useState(false);
  const [plannerMode, setPlannerMode] = useState<"workout" | "day">("workout");
  const [dayPlanTitle, setDayPlanTitle] = useState("");
  const [dayPlanDescription, setDayPlanDescription] = useState("");
  const [repeatDays, setRepeatDays] = useState<number[]>([]);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const today = new Date();
      const key = dateKey(today);
      setCurrentTimestamp(today.getTime());
      setTodayKey(key);
      setMonth(new Date(today.getFullYear(), today.getMonth(), 1));
      setSelectedDate(key);
      setCalendarReady(true);
    }, 0);
    const clock = window.setInterval(() => setCurrentTimestamp(new Date().getTime()), 60_000);
    return () => { window.clearTimeout(timer); window.clearInterval(clock); };
  }, []);

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const [workoutResult, dayPlanResult] = await Promise.all([
        apiRequest<{ items: PlannedWorkout[] }>(
        `/app/schedule?timezoneOffsetMinutes=${new Date().getTimezoneOffset()}`,
        {},
        token,
        ),
        apiRequest<{ items: DailyPlan[] }>(
          `/app/daily-plans?timezoneOffsetMinutes=${new Date().getTimezoneOffset()}`,
          {},
          token,
        ),
      ]);
      setPlans(workoutResult.items);
      setDayPlans(dayPlanResult.items);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load your calendar.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { void apiRequest<BodyPart[]>("/public/exercises/body-parts").then(setParts).catch(loadError => setError(loadError instanceof Error ? loadError.message : "Unable to load workout categories.")); }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => { void refresh(); }, 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  useEffect(() => {
    if (!selectedPart) return;
    let active = true;
    const timer = window.setTimeout(() => {
      setExerciseLoading(true);
      setExerciseError("");
      apiRequest<{ items: Exercise[] }>("/public/exercises?bodyPart=" + encodeURIComponent(selectedPart) + "&limit=100")
        .then(result => active && setExercises(result.items))
        .catch(loadError => active && setExerciseError(loadError instanceof Error ? loadError.message : "Unable to load exercises."))
        .finally(() => active && setExerciseLoading(false));
    }, 0);
    return () => { active = false; window.clearTimeout(timer); };
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
  const planDates = useMemo(() => {
    const dates = new Set<string>();
    const length = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    for (const plan of plans) {
      for (let day = 1; day <= length; day += 1) {
        const key = dateKey(new Date(month.getFullYear(), month.getMonth(), day));
        if (planOccursOnDate(plan.date, plan.repeatDays, key)) dates.add(key);
      }
    }
    for (const plan of dayPlans) {
      for (let day = 1; day <= length; day += 1) {
        const key = dateKey(new Date(month.getFullYear(), month.getMonth(), day));
        if (planOccursOnDate(plan.date, plan.repeatDays, key)) dates.add(key);
      }
    }
    return dates;
  }, [dayPlans, month, plans]);
  const selectedPlans = plans.filter(plan => planOccursOnDate(plan.date, plan.repeatDays, selectedDate));
  const selectedDayPlans = dayPlans.filter(plan => planOccursOnDate(plan.date, plan.repeatDays, selectedDate));

  const scheduleExercise = async (exercise: Exercise) => {
    if (!token) return;
    if (workoutReminderEnabled && !workoutRepeatDays.length && selectedDate === todayKey
      && new Date(`${selectedDate}T${time}:00`).getTime() <= currentTimestamp) {
      setError("Choose a future time for today's reminder.");
      return;
    }
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
          repeatDays: workoutRepeatDays,
          reminderEnabled: workoutReminderEnabled,
          durationMinutes: exercise.durationMinutes,
          timezoneOffsetMinutes: new Date().getTimezoneOffset(),
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

  const saveDayPlan = async () => {
    if (!token) return;
    if (!dayPlanTitle.trim()) {
      setError("Add a title so you remember what this plan is for.");
      return;
    }
    if (reminderEnabled && !repeatDays.length && selectedDate === todayKey
      && new Date(`${selectedDate}T${time}:00`).getTime() <= currentTimestamp) {
      setError("Choose a future time for today's reminder.");
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await apiRequest<{ item: DailyPlan }>("/app/daily-plans", {
        method: "POST",
        body: JSON.stringify({
          title: dayPlanTitle.trim(),
          description: dayPlanDescription.trim(),
          date: selectedDate,
          time,
          repeatDays,
          reminderEnabled,
          timezoneOffsetMinutes: new Date().getTimezoneOffset(),
        }),
      }, token);
      setDayPlanTitle("");
      setDayPlanDescription("");
      setRepeatDays([]);
      setReminderEnabled(false);
      setNotice("Your day plan is saved.");
      await refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save your day plan.");
    } finally {
      setSaving(false);
    }
  };

  const removeDayPlan = async (id: string) => {
    if (!token) return;
    setError("");
    try {
      await apiRequest<{ id: string }>(`/app/daily-plans/${encodeURIComponent(id)}`, { method: "DELETE" }, token);
      setDayPlans(current => current.filter(plan => plan.id !== id));
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Unable to remove this plan.");
    }
  };

  return (
    <main className="page-content calendar-page">
      <section className="page-intro"><Link className="back-link" href="/">← Home</Link><span className="eyebrow">YOUR WORKOUT PLAN</span><h1>Make time<br /><em>for movement.</em></h1><p>Your account calendar syncs planned workouts with the WorkOut app.</p></section>
      {!user && <div className="notice auth-notice">Sign in to save workouts and sync this calendar with the mobile app. <Link className="text-link" href="/profile">Sign in →</Link></div>}
      {error && <div className="notice notice-error" role="alert"><span>{error}</span><button className="text-button" onClick={() => void refresh()}>Try again</button></div>}
      <div className="calendar-layout">
        <section className="calendar-panel">
          <div className="calendar-month">
            <button type="button" aria-label="Previous month" disabled={!calendarReady} onClick={() => setMonth(value => new Date(value.getFullYear(), value.getMonth() - 1, 1))}>‹</button>
            <h2>{calendarReady ? month.toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "Your calendar"}</h2>
            <button className="today-action" type="button" disabled={!calendarReady} onClick={() => { const today = new Date(); setMonth(new Date(today.getFullYear(), today.getMonth(), 1)); setSelectedDate(todayKey); }}>Today</button>
            <button type="button" aria-label="Next month" disabled={!calendarReady} onClick={() => setMonth(value => new Date(value.getFullYear(), value.getMonth() + 1, 1))}>›</button>
          </div>
          <div className="calendar-grid calendar-weekdays">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => <span key={day}>{day}</span>)}</div>
          {calendarReady ? <div className="calendar-grid">{days.map((day, index) => {
            if (!day) return <span className="calendar-cell calendar-empty" key={`empty-${index}`} />;
            const key = dateKey(new Date(month.getFullYear(), month.getMonth(), day));
            const isToday = key === todayKey;
            return <button type="button" key={key} className={`calendar-cell${selectedDate === key ? " selected" : ""}${planDates.has(key) ? " has-plan" : ""}${isToday ? " today" : ""}`} onClick={() => { setSelectedDate(key); setNotice(""); }} aria-current={isToday ? "date" : undefined} aria-label={`${key}${isToday ? ", today" : ""}${planDates.has(key) ? ", scheduled workout" : ""}`}>{day}{planDates.has(key) && <i />}</button>;
          })}</div> : <p className="notice calendar-loading" role="status">Preparing your calendar…</p>}
          <div className="calendar-legend"><span><i /> Planned workout</span><span><i className="today-dot" /> Selected date</span></div>
        </section>

        <section className="calendar-day-panel">
          <div className="section-heading"><div><span className="eyebrow">SELECTED DAY</span><h2>{calendarReady ? new Date(`${selectedDate}T12:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) : "Getting today ready…"}</h2></div>{loading && <span className="eyebrow">SYNCING</span>}</div>
          {user && !loading && selectedPlans.length + selectedDayPlans.length === 0 && <p className="notice">Nothing planned yet. Choose an exercise or add an activity below.</p>}
          <div className="scheduled-list">{selectedPlans.map(plan => <article className="scheduled-row" key={plan.id}><span className="schedule-time">{plan.time}</span><div><strong>{plan.title}</strong><span>{[plan.bodyPart, plan.category, `${plan.durationMinutes} min`].filter(Boolean).join(" · ")}</span>{plan.repeatDays?.length ? <span>Every {plan.repeatDays.map(day => weekdays[day]).join(", ")}</span> : null}{plan.reminderEnabled ? <span>Reminder on</span> : null}</div><button type="button" onClick={() => void removePlan(plan.id)} aria-label={`Remove ${plan.title}`}>×</button></article>)}</div>
          <div className="scheduled-list">{selectedDayPlans.map(plan => <article className="scheduled-row day-plan-row" key={plan.id}><span className="schedule-time">{plan.time}</span><div><strong>{plan.title}</strong>{plan.description && <span>{plan.description}</span>}<span>{plan.repeatDays.length ? `Every ${plan.repeatDays.map(day => weekdays[day]).join(", ")}` : "Personal plan"}{plan.reminderEnabled ? " · Reminder on" : ""}</span></div><button type="button" onClick={() => void removeDayPlan(plan.id)} aria-label={`Remove ${plan.title}`}>×</button></article>)}</div>
          {notice && <p className="success-message" role="status">{notice}</p>}
        </section>
      </div>

      <section className="calendar-schedule-panel" id="planner">
        <div className="section-heading"><div><span className="eyebrow">ADD TO YOUR CALENDAR</span><h2>Plan your day</h2></div></div>
        <div className="planner-tabs" role="tablist" aria-label="Choose a plan type">
          <button className={plannerMode === "workout" ? "active" : ""} type="button" role="tab" aria-selected={plannerMode === "workout"} onClick={() => { setPlannerMode("workout"); setNotice(""); }}>Workout</button>
          <button className={plannerMode === "day" ? "active" : ""} type="button" role="tab" aria-selected={plannerMode === "day"} onClick={() => { setPlannerMode("day"); setNotice(""); }}>Full-day plan</button>
        </div>
        <p className="planner-date">Planning for <strong>{calendarReady ? new Date(`${selectedDate}T12:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) : "today"}</strong></p>
        {plannerMode === "workout" ? (
          <>
            <div className="plan-controls">
              <label>Focus area<select value={selectedPart} onChange={event => { setSelectedPart(event.target.value); setExercises([]); setExerciseLoading(false); setExerciseError(""); }}><option value="">Choose a body part</option>{parts.map(part => <option value={part.name} key={part.name}>{part.name}</option>)}</select></label>
              <label>Workout time<input type="time" value={time} onChange={event => setTime(event.target.value)} /></label>
            </div>
            <div className="planner-workout-options">
              <fieldset className="repeat-field">
                <legend>Repeat weekly (optional)</legend>
                <div className="repeat-days">{weekdays.map((day, index) => <button className={workoutRepeatDays.includes(index) ? "active" : ""} key={day} type="button" aria-pressed={workoutRepeatDays.includes(index)} onClick={() => setWorkoutRepeatDays(current => current.includes(index) ? current.filter(value => value !== index) : [...current, index].sort())}>{day}</button>)}</div>
              </fieldset>
              <label className="reminder-toggle"><input type="checkbox" checked={workoutReminderEnabled} onChange={event => setWorkoutReminderEnabled(event.target.checked)} /><span><strong>Set a reminder</strong><small>Save the reminder preference with your workout plan.</small></span></label>
            </div>
            {token && selectedPart && exerciseLoading && <p className="notice" role="status">Loading exercises…</p>}
            {token && selectedPart && exerciseError && <p className="notice notice-error" role="alert">{exerciseError}</p>}
            {token && selectedPart && !exerciseLoading && !exerciseError && <div className="plan-exercise-list">{exercises.map(exercise => <article key={exercise._id}><div><strong>{exercise.title}</strong><span>{exercise.category} · {exercise.durationMinutes} min · {exercise.level}</span></div><button className="button button-primary" disabled={saving} onClick={() => void scheduleExercise(exercise)}>{saving ? "Saving…" : "Schedule"}</button></article>)}</div>}
            {token && selectedPart && !exerciseLoading && !exerciseError && !exercises.length && <p className="notice">No published exercises found for this focus area.</p>}
          </>
        ) : (
          <div className="day-plan-form">
            <label>Activity title<input type="text" value={dayPlanTitle} maxLength={160} onChange={event => setDayPlanTitle(event.target.value)} placeholder="e.g. Stretch, study, or take a walk" /></label>
            <label>Description or reminder note<textarea value={dayPlanDescription} maxLength={500} onChange={event => setDayPlanDescription(event.target.value)} placeholder="Add any detail you want to remember" rows={3} /></label>
            <div className="plan-controls">
              <label>Time<input type="time" value={time} onChange={event => setTime(event.target.value)} /></label>
              <fieldset className="repeat-field">
                <legend>Repeat on</legend>
                <div className="repeat-days">{weekdays.map((day, index) => <button className={repeatDays.includes(index) ? "active" : ""} key={day} type="button" aria-pressed={repeatDays.includes(index)} onClick={() => setRepeatDays(current => current.includes(index) ? current.filter(value => value !== index) : [...current, index].sort())}>{day}</button>)}</div>
              </fieldset>
            </div>
            <label className="reminder-toggle"><input type="checkbox" checked={reminderEnabled} onChange={event => setReminderEnabled(event.target.checked)} /><span><strong>Set a reminder</strong><small>Save this reminder preference with your synced plan.</small></span></label>
            <button className="button button-primary save-day-plan" type="button" disabled={!token || saving || !calendarReady} onClick={() => void saveDayPlan()}>{saving ? "Saving plan…" : "Save full-day plan"}</button>
          </div>
        )}
      </section>
    </main>
  );
}
