"use client";

import { ChangeEvent, useEffect, useState } from "react";
import Image from "next/image";
import { API_BASE_URL } from "../api";

type MealAnalysis = {
  name: string;
  description: string;
  serving: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  healthScore: number;
  confidence: "low" | "medium" | "high";
};

export default function NutritionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [analysis, setAnalysis] = useState<MealAnalysis | null>(null);
  const [error, setError] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [waterGlasses, setWaterGlasses] = useState(0);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const saved = window.localStorage.getItem("workout-water-glasses");
      if (!saved) return;
      try {
        const value = JSON.parse(saved) as { date?: string; count?: number };
        const today = new Date().toLocaleDateString();
        if (value.date === today) setWaterGlasses(Math.min(20, Math.max(0, Number(value.count) || 0)));
      } catch {
        window.localStorage.removeItem("workout-water-glasses");
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const chooseImage = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
    setAnalysis(null);
    setError("");
    setPreview(selected ? URL.createObjectURL(selected) : "");
  };

  const analyze = async () => {
    if (!file) return;
    setAnalyzing(true);
    setError("");
    setAnalysis(null);
    const form = new FormData();
    form.append("image", file);
    try {
      const response = await fetch(`${API_BASE_URL}/nutrition/analyze`, { method: "POST", body: form });
      const result = await response.json() as MealAnalysis & { error?: string; message?: string };
      if (!response.ok) throw new Error(result.error === "no_food" ? "We could not find food in that photo. Try another image." : result.message || "Meal analysis is unavailable.");
      setAnalysis(result);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to analyze this meal.");
    } finally {
      setAnalyzing(false);
    }
  };

  const updateWater = (value: number) => {
    const next = Math.min(20, Math.max(0, value));
    setWaterGlasses(next);
    window.localStorage.setItem("workout-water-glasses", JSON.stringify({ date: new Date().toLocaleDateString(), count: next }));
  };

  return (
    <main className="page-content feature-page">
      <section className="page-intro">
        <span className="eyebrow">FUEL YOUR EVERYDAY MOVEMENT</span>
        <h1>Care for your body<br /><em>in every way.</em></h1>
        <p>Explore a simple meal photo estimate and keep a lightweight hydration check-in alongside your movement routine.</p>
      </section>
      <section className="nutrition-layout">
        <article className="feature-panel nutrition-analyzer">
          <div className="section-heading"><div><span className="eyebrow">MEAL SNAPSHOT</span><h2>Get a nutrition estimate.</h2></div></div>
          <p className="feature-description">Choose a meal photo to estimate its nutrition. Estimates are a guide, not medical advice.</p>
          <label className="upload-control">Choose a meal photo<input type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseImage} /></label>
          {preview && <Image className="meal-preview" src={preview} alt="Selected meal preview" width={640} height={400} unoptimized />}
          {file && <p className="file-name">{file.name}</p>}
          <button className="button button-primary" type="button" onClick={analyze} disabled={!file || analyzing}>{analyzing ? "Estimating nutrition…" : "Analyze meal"}</button>
          {error && <p className="notice notice-error" role="alert">{error}</p>}
          {analysis && <section className="meal-result" aria-live="polite">
            <div><span className="eyebrow">PHOTO ESTIMATE · {analysis.confidence.toUpperCase()} CONFIDENCE</span><h3>{analysis.name}</h3><p>{analysis.serving} · {analysis.description}</p></div>
            <strong>{analysis.kcal.toLocaleString()} <small>kcal</small></strong>
            <div className="meal-macros"><span>Protein <b>{analysis.protein} g</b></span><span>Carbs <b>{analysis.carbs} g</b></span><span>Fat <b>{analysis.fat} g</b></span></div>
          </section>}
        </article>
        <article className="feature-panel water-panel">
          <span className="eyebrow">A GENTLE HYDRATION CHECK-IN</span><h2>Water, one glass at a time.</h2><p>Track glasses in this browser for today. Your count stays on this device.</p>
          <div className="water-count"><strong>{waterGlasses}</strong><span>glasses today</span></div>
          <div className="water-actions"><button className="button button-outline" type="button" onClick={() => updateWater(waterGlasses - 1)} disabled={waterGlasses === 0}>−</button><button className="button button-primary" type="button" onClick={() => updateWater(waterGlasses + 1)} disabled={waterGlasses === 20}>Add a glass +</button></div>
        </article>
      </section>
    </main>
  );
}
