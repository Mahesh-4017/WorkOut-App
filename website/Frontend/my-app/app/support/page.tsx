import Link from "next/link";

const questions = [
  { question: "Can I use the same account as the mobile app?", answer: "Yes. Sign in with your WorkOut app account to see your saved profile, goals, workout history, and schedule." },
  { question: "Where can I find my scheduled workouts?", answer: "Open Calendar to review your plan. The Reminders page also highlights upcoming workouts and whether a reminder is enabled." },
  { question: "Does the website track GPS runs?", answer: "No. The running page includes planning tools, but GPS route tracking is currently available only in the mobile app." },
  { question: "Are meal photo estimates exact?", answer: "No. They are automated estimates that can vary with portion size and ingredients. Use them as a general guide, not as medical or dietary advice." },
];

export default function SupportPage() {
  return (
    <main className="page-content feature-page">
      <section className="page-intro">
        <span className="eyebrow">HERE TO HELP YOU KEEP GOING</span>
        <h1>A few answers<br /><em>for the journey.</em></h1>
        <p>Find quick help for your account, training plans, and the features available on the WorkOut website.</p>
      </section>
      <section className="support-layout">
        <div className="feature-panel support-faq">
          <span className="eyebrow">FREQUENTLY ASKED</span>
          <h2>Good to know.</h2>
          {questions.map(item => <details key={item.question}><summary>{item.question}<span aria-hidden="true">+</span></summary><p>{item.answer}</p></details>)}
        </div>
        <aside className="support-card">
          <span className="eyebrow">NEED A HAND?</span>
          <h2>We’re here to help.</h2>
          <p>For account or website issues, reach out to the WorkOut team through the project repository.</p>
          <a className="button button-primary" href="https://github.com/Mahesh-4017/WorkOut-App/issues" target="_blank" rel="noreferrer">Contact support <span aria-hidden="true">↗</span></a>
          <div className="support-links"><Link href="/profile">Account help →</Link><Link href="/calendar">Planning help →</Link><Link href="/nutrition">Nutrition tools →</Link></div>
        </aside>
      </section>
    </main>
  );
}
