"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest, FeaturedCard, mediaUrl } from "../api";
import { useWebsiteAuth } from "../website-auth";

function YogaImage({ src, alt }: { src?: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  const url = mediaUrl(src);
  return url && !failed
    ? <img className="featured-image" src={url} alt={alt} loading="lazy" onError={() => setFailed(true)} />
    : <div className="featured-image image-placeholder" aria-hidden="true">✳</div>;
}

export default function YogaLibrary() {
  const { user } = useWebsiteAuth();
  const [cards, setCards] = useState<FeaturedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const query = new URLSearchParams({ category: "Yoga", limit: "100" });
    if (user?.gender) query.set("gender", user.gender);
    apiRequest<{ items: FeaturedCard[] }>(`/public/cards?${query.toString()}`)
      .then(result => active && setCards(result.items))
      .catch(loadError => active && setError(loadError instanceof Error ? loadError.message : "Unable to load Yoga sessions."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [user?.gender]);

  return (
    <main className="yoga-page">
      <section className="page-intro">
        <Link className="back-link" href="/">← Home</Link>
        <span className="eyebrow">MOVE WITH INTENTION</span>
        <h1>Make room for<br /><em>your next reset.</em></h1>
        <p>Explore published Yoga sessions from your workout library.</p>
      </section>
      <section className="featured-section" aria-labelledby="yoga-heading">
        <div className="section-heading"><div><span className="eyebrow">PUBLISHED YOGA LIBRARY</span><h2 id="yoga-heading">Yoga sessions</h2></div><Link className="text-link" href="/workouts">Browse workouts →</Link></div>
        {loading && <p className="notice" role="status">Loading published Yoga sessions…</p>}
        {error && <p className="notice notice-error" role="alert">{error}</p>}
        {!loading && !error && cards.length === 0 && <p className="notice">No Yoga sessions are published yet. Check back when new sessions are added.</p>}
        <div className="featured-grid">
          {cards.map(card => (
            <article className="featured-card" key={card._id}>
              <YogaImage src={card.thumbnailUrl} alt={card.title} />
              <div className="featured-copy">
                <span className="eyebrow">{card.category || "YOGA"}</span>
                <h3>{card.title}</h3>
                <p>{card.description || "A guided Yoga session from your studio library."}</p>
                <a className="text-link" href={card.videoUrl} target="_blank" rel="noopener noreferrer">Open session ↗</a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
