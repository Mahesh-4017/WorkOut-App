"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiRequest, BodyPart, Exercise, mediaUrl } from "./api";

function ContentImage({ src, alt, className }: { src?: string; alt: string; className: string }) {
  const [failed, setFailed] = useState(false);
  const url = mediaUrl(src);
  return url && !failed
    ? <img className={className} src={url} alt={alt} loading="lazy" onError={() => setFailed(true)} />
    : <div className={`${className} image-placeholder`} aria-hidden="true">✳</div>;
}

function videoEmbedUrl(value: string) {
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return undefined;
    if (url.hostname === "youtu.be" || url.hostname.endsWith(".youtu.be")) {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` : undefined;
    }
    if (url.hostname === "youtube.com" || url.hostname.endsWith(".youtube.com")) {
      const id = url.searchParams.get("v") || url.pathname.split("/").filter(Boolean).pop();
      return id ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` : undefined;
    }
    if (url.hostname === "vimeo.com" || url.hostname.endsWith(".vimeo.com")) {
      const id = url.pathname.split("/").filter(Boolean).pop();
      return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : undefined;
    }
  } catch { return undefined; }
  return undefined;
}

export default function WorkoutsBrowser({ collections = false }: { collections?: boolean }) {
  const [bodyParts, setBodyParts] = useState<BodyPart[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBodyPart, setSelectedBodyPart] = useState<BodyPart | null>(null);
  const [collectionSearch, setCollectionSearch] = useState("");
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exerciseLoading, setExerciseLoading] = useState(false);
  const [exerciseError, setExerciseError] = useState("");
  const [detail, setDetail] = useState<Exercise | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  useEffect(() => {
    let active = true;
    apiRequest<BodyPart[]>("/public/exercises/body-parts")
      .then(data => active && setBodyParts(data))
      .catch(loadError => active && setError(loadError instanceof Error ? loadError.message : "Unable to load workout categories."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!selectedBodyPart) return;
    let active = true;
    const timer = window.setTimeout(async () => {
      setExerciseLoading(true);
      setExerciseError("");
      try {
        const params = new URLSearchParams({ bodyPart: selectedBodyPart.name, limit: "100" });
        if (category) params.set("category", category);
        if (search.trim()) params.set("search", search.trim());
        const items: Exercise[] = [];
        let page = 1;
        let pages = 1;
        do {
          params.set("page", String(page));
          const result = await apiRequest<{ items: Exercise[]; pagination: { pages: number } }>(`/public/exercises?${params.toString()}`);
          items.push(...result.items);
          pages = result.pagination.pages;
          page += 1;
        } while (page <= pages && active);
        if (active) setExercises(items);
      } catch (loadError) {
        if (active) setExerciseError(loadError instanceof Error ? loadError.message : "Unable to load exercises.");
      } finally {
        if (active) setExerciseLoading(false);
      }
    }, search ? 200 : 0);
    return () => { active = false; window.clearTimeout(timer); };
  }, [selectedBodyPart, category, search]);

  useEffect(() => {
    if (!detail && !detailLoading && !detailError) return;
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { setDetail(null); setDetailError(""); setDetailLoading(false); } };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [detail, detailLoading, detailError]);

  const count = useMemo(() => bodyParts.reduce((sum, part) => sum + part.count, 0), [bodyParts]);
  const visibleBodyParts = useMemo(() => {
    const query = collectionSearch.trim().toLocaleLowerCase();
    if (!query) return bodyParts;
    return bodyParts.filter(part =>
      part.name.toLocaleLowerCase().includes(query)
      || part.categories.some(item => item.name.toLocaleLowerCase().includes(query)),
    );
  }, [bodyParts, collectionSearch]);

  const chooseBodyPart = (part: BodyPart, selectedCategory = "") => {
    setSelectedBodyPart(part);
    setCategory(selectedCategory);
    setSearch("");
    window.setTimeout(() => document.getElementById("exercise-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };

  const showExercise = async (id: string) => {
    setDetail(null);
    setDetailError("");
    setDetailLoading(true);
    try {
      setDetail(await apiRequest<Exercise>(`/public/exercises/${encodeURIComponent(id)}`));
    } catch (loadError) {
      setDetailError(loadError instanceof Error ? loadError.message : "Unable to load this exercise.");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeExercise = () => { setDetail(null); setDetailError(""); setDetailLoading(false); };

  return (
    <main className={collections ? "collections-page" : ""}>
      <section className="page-intro">
        <Link className="back-link" href="/">← Home</Link>
        <span className="eyebrow">{collections ? "BUILT FROM YOUR WORKOUT LIBRARY" : "WORKOUT LIBRARY"}</span>
        <h1>{collections ? <>A collection for<br /><em>every kind of strong.</em></> : <>What do you want<br /><em>to train today?</em></>}</h1>
        <p>{collections ? "Explore workouts by body part, find the right focus, and open a collection to see its published exercises." : "Choose a body part to find focused exercises, coaching details, and videos."}</p>
      </section>
      <section className="browse-section" id="body-parts">
        <div className="section-heading">
          <div><span className="eyebrow">{collections ? "CHOOSE YOUR NEXT FOCUS" : "START WITH A FOCUS AREA"}</span><h2>{collections ? "Explore collections" : "Choose a body part"}</h2></div>
          <span className="library-count">{loading ? "Loading…" : `${bodyParts.length} collections · ${count} exercises`}</span>
        </div>
        {error && <div className="notice notice-error" role="alert"><span>{error}</span><button className="text-button" onClick={() => window.location.reload()}>Try again</button></div>}
        {collections && <label className="search-field collection-search"><span aria-hidden="true">⌕</span><input type="search" value={collectionSearch} onChange={event => setCollectionSearch(event.target.value)} placeholder="Search body parts or categories" aria-label="Search collections" />{collectionSearch && <button className="clear-search" type="button" aria-label="Clear search" onClick={() => setCollectionSearch("")}>×</button>}</label>}
        {!loading && !error && bodyParts.length === 0 && <p className="notice">Published workout collections will appear here when they are added to the library.</p>}
        {collections ? (
          <>
            {!loading && !error && bodyParts.length > 0 && visibleBodyParts.length === 0 && <p className="notice">No collections match “{collectionSearch}”. Try another focus area or category.</p>}
            <div className="collection-grid">
              {visibleBodyParts.map((part, index) => (
                <article className="collection-card" key={part.name}>
                  <button className="collection-main" type="button" onClick={() => chooseBodyPart(part)} aria-label={`Explore ${part.name}, ${part.count} exercises`}>
                    <span className="collection-copy">
                      <span className="collection-index">{String(index + 1).padStart(2, "0")} / {String(visibleBodyParts.length).padStart(2, "0")}</span>
                      <strong>{part.name}</strong>
                      <span className="collection-count">{part.count} published exercise{part.count === 1 ? "" : "s"}</span>
                      <span className="explore-link">Explore collection <span aria-hidden="true">→</span></span>
                    </span>
                    <ContentImage src={part.imageUrl} alt={`${part.name} workout collection`} className="collection-image" />
                  </button>
                  <div className="collection-categories">
                    <span className="eyebrow">FOCUS</span>
                    {part.categories.map(item => <button className="category-chip" key={item.name} type="button" onClick={() => chooseBodyPart(part, item.name)}>{item.name}<span>{item.count}</span></button>)}
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="body-part-grid">
            {bodyParts.map(part => (
              <article className="body-part-card" key={part.name}>
                <button className="body-part-main" type="button" onClick={() => chooseBodyPart(part)} aria-label={`Browse ${part.name}, ${part.count} exercises`}>
                  <span className="body-part-copy"><span className="eyebrow">{String(part.count).padStart(2, "0")} EXERCISES</span><strong>{part.name}</strong><span>Browse {part.name.toLowerCase()} workouts</span><span className="explore-link">Explore <span aria-hidden="true">→</span></span></span>
                  <ContentImage src={part.imageUrl} alt={`${part.name} workout`} className="body-part-image" />
                </button>
                <div className="category-chips">
                  {part.categories.map(item => <button className="category-chip" key={item.name} type="button" onClick={() => chooseBodyPart(part, item.name)}>{item.name}<span>{item.count}</span></button>)}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {selectedBodyPart && (
        <section className="exercise-section" id="exercise-results">
          <div className="section-heading">
            <div><span className="eyebrow">{selectedBodyPart.name.toUpperCase()} · PUBLISHED EXERCISES</span><h2>{category || selectedBodyPart.name}</h2></div>
            <button className="text-button" onClick={() => { setSelectedBodyPart(null); setCategory(""); setSearch(""); }}>All body parts ×</button>
          </div>
          <label className="search-field"><span aria-hidden="true">⌕</span><input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search exercises" aria-label="Search exercises" /></label>
          <div className="category-chips filter-chips">
            <button className={`category-chip${category ? "" : " active"}`} onClick={() => setCategory("")}>All</button>
            {selectedBodyPart.categories.map(item => <button className={`category-chip${category === item.name ? " active" : ""}`} key={item.name} onClick={() => setCategory(item.name)}>{item.name}<span>{item.count}</span></button>)}
          </div>
          {exerciseLoading && <p className="notice" role="status">Loading exercises…</p>}
          {exerciseError && <p className="notice notice-error" role="alert">{exerciseError}</p>}
          {!exerciseLoading && !exerciseError && !exercises.length && <p className="notice">No published exercises match this selection.</p>}
          <div className="exercise-grid">
            {exercises.map(exercise => (
              <button className="exercise-card" key={exercise._id} type="button" onClick={() => void showExercise(exercise._id)}>
                <ContentImage src={exercise.imageUrl} alt={exercise.title} className="exercise-image" />
                <span className="exercise-copy"><span className="exercise-meta"><span>{exercise.level}</span><span>{exercise.durationMinutes} min</span></span><strong>{exercise.title}</strong><span className="exercise-category">{exercise.category}</span></span>
                <span className="exercise-arrow" aria-hidden="true">↗</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {(detail || detailLoading || detailError) && (
        <div className="dialog-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) closeExercise(); }}>
          <section className="exercise-dialog" role="dialog" aria-modal="true" aria-label="Exercise details">
            <button className="dialog-close" type="button" aria-label="Close exercise details" onClick={closeExercise}>×</button>
            {detailLoading && <p className="notice">Loading exercise details…</p>}
            {detailError && <p className="notice notice-error" role="alert">{detailError}</p>}
            {detail && <><ContentImage src={detail.imageUrl} alt={detail.title} className="dialog-image" /><div className="dialog-copy"><span className="eyebrow">{detail.bodyPart} / {detail.category}</span><h2>{detail.title}</h2><p className="dialog-description">{detail.description}</p><div className="detail-pills"><span>{detail.level}</span><span>{detail.durationMinutes} min</span><span>{detail.equipment.length ? detail.equipment.join(", ") : "No equipment"}</span></div>{videoEmbedUrl(detail.videoUrl) ? <div className="video-frame"><iframe src={videoEmbedUrl(detail.videoUrl)} title={`${detail.title} video`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div> : <a className="button button-primary" href={detail.videoUrl} target="_blank" rel="noopener noreferrer">Open exercise video ↗</a>}{detail.instructions.length > 0 && <><h3>How to do it</h3><ol className="instruction-list">{detail.instructions.map((step, index) => <li key={`${index}-${step}`}>{step}</li>)}</ol></>}<p className="muscles"><strong>Muscles</strong><span>{detail.muscles.join(", ") || "Not listed"}</span></p></div></>}
          </section>
        </div>
      )}
    </main>
  );
}
