"use client";

import Link from "next/link";
import { APK_DOWNLOAD_URL } from "./api";
import { useWebsiteHydrationSignal } from "./website-motion";

const benefits = [
  {
    number: "01",
    icon: "↗",
    title: "Choose your movement",
    description: "Browse workout exercises and guided Yoga sessions, then pick a focus that fits your day.",
  },
  {
    number: "02",
    icon: "▦",
    title: "Make a plan",
    description: "Schedule workouts, build a weekly routine, and keep planned sessions in your calendar.",
  },
  {
    number: "03",
    icon: "◷",
    title: "Keep your progress",
    description: "Save completed sessions and review your activity and fitness goals over time.",
  },
];

export default function AppPromo() {
  useWebsiteHydrationSignal();

  return (
    <main className="page-content app-promo-page">
      <section className="app-promo-hero">
        <div className="app-promo-copy">
          <span className="eyebrow"><span className="live-dot" />YOUR WORKOUT COMPANION</span>
          <h1>Make movement<br /><em>part of your day.</em></h1>
          <p>Explore workouts, plan your sessions, and keep your progress close with the WorkOut mobile app.</p>
          <div className="hero-actions">
            <a className="button button-primary" href={APK_DOWNLOAD_URL}>Download for Android <span aria-hidden="true">↓</span></a>
            <Link className="button button-light" href="/workouts">Explore the library <span aria-hidden="true">→</span></Link>
          </div>
          <span className="app-promo-availability">Available for Android · Free APK download</span>
        </div>
        <div className="app-promo-art" aria-label="Illustration of the WorkOut app dashboard">
          <span className="app-promo-orbit app-promo-orbit-one" aria-hidden="true" />
          <span className="app-promo-orbit app-promo-orbit-two" aria-hidden="true" />
          <div className="app-promo-device">
            <div className="app-promo-device-top"><span>9:41</span><span>● ● ●</span></div>
            <div className="app-promo-wordmark">WorkOut<span>●</span></div>
            <div className="app-promo-greeting"><small>YOUR MOVEMENT, YOUR PACE</small><strong>Ready to move?</strong></div>
            <div className="app-promo-week"><span>THIS WEEK</span><strong>3 <small>of 5 sessions</small></strong><i><b /></i></div>
            <div className="app-promo-mini-card"><span>↗</span><div><strong>Explore workouts</strong><small>Find your next session</small></div><b>›</b></div>
            <div className="app-promo-mini-card"><span>▦</span><div><strong>Plan your week</strong><small>Keep your routine in view</small></div><b>›</b></div>
            <div className="app-promo-tabbar"><span>⌂</span><span>↗</span><span>▦</span><span>◎</span></div>
          </div>
          <div className="app-promo-sticker"><span>SHOW UP</span><strong>for yourself</strong></div>
        </div>
      </section>

      <section className="app-promo-section" aria-labelledby="app-promo-benefits-title">
        <div className="app-promo-section-heading">
          <span className="eyebrow">BUILT AROUND YOUR ROUTINE</span>
          <h2 id="app-promo-benefits-title">Everything you need to<br /><em>keep showing up.</em></h2>
          <p>Start with a small step. Use the tools that support your goals, and make a routine that feels like your own.</p>
        </div>
        <div className="app-promo-benefits">
          {benefits.map(benefit => (
            <article className="app-promo-benefit" key={benefit.number}>
              <div className="app-promo-benefit-top"><span>{benefit.icon}</span><b>{benefit.number}</b></div>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="app-promo-cta">
        <div><span className="eyebrow">YOUR NEXT MOVE STARTS HERE</span><h2>Ready when you are.</h2><p>Download the Android app, or explore the workout library right here on the website.</p></div>
        <div className="app-promo-cta-actions"><a className="button button-primary" href={APK_DOWNLOAD_URL}>Get the Android app <span aria-hidden="true">↓</span></a><Link className="button button-outline" href="/collections">Browse collections <span aria-hidden="true">→</span></Link></div>
      </section>
      <p className="app-promo-note">The WorkOut website and Android app have different features. Download the app to access mobile-specific tools; availability and compatibility depend on your device.</p>
    </main>
  );
}
