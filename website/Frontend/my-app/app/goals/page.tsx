"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest, ProgressData } from "../api";
import { useWebsiteAuth } from "../website-auth";

type GoalFields = {
  weeklySessions: string;
  targetWeightKg: string;
  dailySteps: string;
  dailyCalories: string;
};

const EMPTY_GOALS: GoalFields = { weeklySessions: "5", targetWeightKg: "", dailySteps: "", dailyCalories: "" };

export default function GoalsPage() {
  const { user, token, ready } = useWebsiteAuth();
  const [fields, setFields] = useState<GoalFields>(EMPTY_GOALS);
  const [loadedToken, setLoadedToken] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    let active = true;
    apiRequest<ProgressData>("/app/progress", {}, token)
      .then(data => {
        if (!active) return;
        setFields({
          weeklySessions: String(data.goals?.weeklySessions ?? 5),
          targetWeightKg: data.goals?.targetWeightKg == null ? "" : String(data.goals.targetWeightKg),
          dailySteps: data.goals?.dailySteps == null ? "" : String(data.goals.dailySteps),
          dailyCalories: data.goals?.dailyCalories == null ? "" : String(data.goals.dailyCalories),
        });
        setLoadedToken(token);
      })
      .catch(loadError => active && setError(loadError instanceof Error ? loadError.message : "Unable to load your goals."));
    return () => { active = false; };
  }, [token]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    setSaving(true);
    setMessage("");
    setError("");
    const goals = {
      weeklySessions: Number(fields.weeklySessions),
      targetWeightKg: fields.targetWeightKg ? Number(fields.targetWeightKg) : null,
      dailySteps: fields.dailySteps ? Number(fields.dailySteps) : null,
      dailyCalories: fields.dailyCalories ? Number(fields.dailyCalories) : null,
    };
    try {
      await apiRequest("/app/progress/goals", { method: "PUT", body: JSON.stringify(goals) }, token);
      setMessage("Your goals have been saved to your WorkOut account.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save your goals.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="page-content feature-page">
      <section className="page-intro">
        <span className="eyebrow">SMALL STEPS, STEADY MOMENTUM</span>
        <h1>Set goals that<br /><em>feel like yours.</em></h1>
        <p>Choose realistic targets, check in often, and adjust them as your routine changes.</p>
      </section>
      {!ready ? <p className="notice">Checking your account…</p> : !user ? (
        <section className="feature-callout"><div><span className="eyebrow">YOUR ACCOUNT</span><h2>Sign in to manage your goals.</h2><p>Saved goals sync with your WorkOut app account.</p></div><Link className="button button-primary" href="/profile">Sign in</Link></section>
      ) : (
        <section className="feature-panel goal-editor">
          <div className="section-heading"><div><span className="eyebrow">PERSONAL TARGETS</span><h2>Your weekly rhythm</h2></div></div>
          {loadedToken !== token && !error && <p className="notice">Loading your saved goals…</p>}
          {error && <p className="notice notice-error" role="alert">{error}</p>}
          {message && <p className="notice" role="status">{message}</p>}
          {loadedToken === token && <form className="feature-form" onSubmit={submit}>
            <label>Workouts each week<input required type="number" min="1" max="21" value={fields.weeklySessions} onChange={event => setFields(current => ({ ...current, weeklySessions: event.target.value }))} /><small>Choose between 1 and 21 sessions.</small></label>
            <label>Daily step target<input type="number" min="1" max="100000" value={fields.dailySteps} onChange={event => setFields(current => ({ ...current, dailySteps: event.target.value }))} placeholder="e.g. 8000" /><small>Leave empty if you do not want a step target.</small></label>
            <label>Target weight (kg)<input type="number" min="20" max="500" step="0.1" value={fields.targetWeightKg} onChange={event => setFields(current => ({ ...current, targetWeightKg: event.target.value }))} placeholder="Optional" /></label>
            <label>Daily calorie target<input type="number" min="1" max="100000" value={fields.dailyCalories} onChange={event => setFields(current => ({ ...current, dailyCalories: event.target.value }))} placeholder="Optional" /></label>
            <div className="feature-form-actions"><button className="button button-primary" type="submit" disabled={saving}>{saving ? "Saving…" : "Save my goals"}</button><Link className="text-link" href="/progress">View your progress →</Link></div>
          </form>}
        </section>
      )}
    </main>
  );
}
