import Image from "next/image";
import Link from "next/link";

const appFeatures = [
  {
    icon: "↗",
    title: "Find a workout",
    description: "Browse exercise collections and guided Yoga sessions for the kind of movement you want today.",
  },
  {
    icon: "◎",
    title: "Keep track of steps",
    description: "Add step entries, follow your daily goal, and look back at the steps you have saved.",
  },
  {
    icon: "◷",
    title: "Time a walk or run",
    description: "Use the activity timer to save how long you moved. It records duration only.",
  },
  {
    icon: "▥",
    title: "See your progress",
    description: "Review saved sessions and step history, set goals, and keep building a routine.",
  },
];

export function AppFeatures() {
  return (
    <section className="app-features" aria-labelledby="app-features-title">
      <div className="app-features-visual">
        <Image
          className="app-features-image"
          src="/Blue-Gold.png"
          alt="Athlete training with a push-up in a gym"
          fill
          sizes="(max-width: 900px) 100vw, 48vw"
        />
        <div className="app-features-image-shade" aria-hidden="true" />
        <div className="app-features-image-caption">
          <span>MOVE AT YOUR PACE</span>
          <strong>Make room for your next move.</strong>
          <Link href="/workouts">Explore workouts <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="app-features-step-note" aria-label="Illustrative example: 6,240 steps logged">
          <span className="app-features-step-icon" aria-hidden="true">◎</span>
          <span><small>STEP TRACKING</small><strong>6,240 <small>sample</small></strong></span>
        </div>
      </div>

      <div className="app-features-copy">
        <span className="eyebrow"><span className="live-dot" />MOVEMENT THAT ADDS UP</span>
        <h2 id="app-features-title">Training that fits real life.</h2>
        <p className="app-features-lede">
          Find a workout, make time to move, and keep your progress in one place.
        </p>
        <div className="app-feature-list">
          {appFeatures.map((feature, index) => (
            <article className="app-feature-item" key={feature.title}>
              <span className="app-feature-icon" aria-hidden="true">{feature.icon}</span>
              <div className="app-feature-item-copy">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
              <span className="app-feature-number" aria-hidden="true">0{index + 1}</span>
            </article>
          ))}
        </div>
        <a
          className="button button-primary app-features-download"
          href="https://github.com/Mahesh-4017/WorkOut-App/releases/latest/download/WorkOut-App.apk"
        >
          Get the Android app <span aria-hidden="true">↓</span>
        </a>
      </div>
    </section>
  );
}
