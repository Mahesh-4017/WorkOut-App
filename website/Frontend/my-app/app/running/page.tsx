"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export default function RunningPage() {
  const [distance, setDistance] = useState("5");
  const [minutes, setMinutes] = useState("30");
  const pace = useMemo(() => {
    const km = Number(distance);
    const totalMinutes = Number(minutes);
    if (!Number.isFinite(km) || !Number.isFinite(totalMinutes) || km <= 0 || totalMinutes <= 0) return null;
    const paceSecondsTotal = Math.round(totalMinutes / km * 60);
    const paceMinutes = Math.floor(paceSecondsTotal / 60);
    const paceSeconds = paceSecondsTotal % 60;
    return `${paceMinutes}:${String(paceSeconds).padStart(2, "0")}`;
  }, [distance, minutes]);

  return (
    <main className="page-content feature-page">
      <section className="feature-hero feature-hero-run">
        <div><span className="eyebrow">FIND YOUR OWN PACE</span><h1>One step at a time.<br /><em>Then another.</em></h1><p>Make room for a run that works for you, whether you are heading out for the first time or building your weekly rhythm.</p><div className="hero-actions"><Link className="button button-primary" href="/workouts">Find a workout <span aria-hidden="true">→</span></Link><Link className="button button-light" href="/calendar">Plan a run <span aria-hidden="true">→</span></Link></div></div>
        <div className="run-orbit" aria-hidden="true"><span>MOVE<br />AT YOUR<br />OWN PACE</span></div>
      </section>
      <section className="feature-panel pace-panel">
        <div><span className="eyebrow">PACE CALCULATOR</span><h2>Make your next run tangible.</h2><p>Estimate your average pace using a distance and finish time.</p></div>
        <div className="pace-fields">
          <label>Distance (km)<input type="number" min="0.1" step="0.1" value={distance} onChange={event => setDistance(event.target.value)} /></label>
          <label>Time (minutes)<input type="number" min="1" step="1" value={minutes} onChange={event => setMinutes(event.target.value)} /></label>
          <div className="pace-result"><span>AVERAGE PACE</span><strong>{pace ? <>{pace} <small>min / km</small></> : "—"}</strong></div>
        </div>
      </section>
      <section className="feature-grid">
        <article className="feature-card"><span className="feature-card-icon">01</span><span className="eyebrow">START EASY</span><h2>Keep the first run simple.</h2><p>Try short intervals of comfortable jogging and walking. Finish feeling like you could do a little more.</p></article>
        <article className="feature-card"><span className="feature-card-icon">02</span><span className="eyebrow">BUILD A ROUTINE</span><h2>Let consistency lead.</h2><p>Choose a couple of days that fit your week and use the calendar to keep your plan visible.</p></article>
        <article className="feature-card"><span className="feature-card-icon">03</span><span className="eyebrow">RECOVER WELL</span><h2>Rest is part of training.</h2><p>Alternate effort with recovery and explore mobility sessions when your body needs a gentler day.</p></article>
      </section>
      <p className="feature-note">This page is a planning companion; it does not record GPS routes or track runs in the browser.</p>
    </main>
  );
}
