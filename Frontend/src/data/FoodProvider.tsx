import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type FoodItem = {
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: string;
  description?: string;
  healthScore?: number;
  confidence?: "low" | "medium" | "high";
  items?: { name: string; grams: number; kcal: number }[];
};

export type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snack";
export type FoodEntry = FoodItem & {
  id: string;
  meal: MealType;
  qty: number;
  createdAt: string;
};
export type WaterEntry = { id: string; ml: number; time: string };

export const MEALS: MealType[] = ["Breakfast", "Lunch", "Dinner", "Snack"];
export const GLASS_ML = 250;
export const GOALS = { kcal: 2000, protein: 120, carbs: 250, fat: 70, water: 2000 };

const STORAGE_KEY = "food-diary-v1";

type FoodContextValue = {
  todayEntries: FoodEntry[];
  totals: { kcal: number; protein: number; carbs: number; fat: number };
  goals: typeof GOALS;
  waterMl: number;
  todayWater: WaterEntry[];
  recents: string[];
  addEntry: (entry: Omit<FoodEntry, "id" | "createdAt">) => void;
  removeEntry: (id: string) => void;
  addWater: (ml?: number) => void;
  addRecent: (term: string) => void;
  clearRecents: () => void;
};

const FoodContext = createContext<FoodContextValue | undefined>(undefined);

export function defaultMeal(): MealType {
  const hour = new Date().getHours();
  if (hour < 11) return "Breakfast";
  if (hour < 16) return "Lunch";
  if (hour < 21) return "Dinner";
  return "Snack";
}

export function FoodProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [waterEntries, setWaterEntries] = useState<WaterEntry[]>([]);
  const [recents, setRecents] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(value => {
      if (value) {
        const saved = JSON.parse(value);
        setEntries(Array.isArray(saved.entries) ? saved.entries : []);
        setWaterEntries(Array.isArray(saved.waterEntries) ? saved.waterEntries : []);
        setRecents(Array.isArray(saved.recents) ? saved.recents : []);
      }
    }).catch(() => undefined).finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ entries, waterEntries, recents })).catch(() => undefined);
  }, [entries, loaded, recents, waterEntries]);

  const today = new Date().toDateString();
  const todayEntries = entries.filter(entry => new Date(entry.createdAt).toDateString() === today);
  const todayWater = waterEntries.filter(entry => new Date(entry.time).toDateString() === today);
  const totals = todayEntries.reduce((sum, entry) => ({
    kcal: sum.kcal + entry.kcal,
    protein: sum.protein + entry.protein,
    carbs: sum.carbs + entry.carbs,
    fat: sum.fat + entry.fat,
  }), { kcal: 0, protein: 0, carbs: 0, fat: 0 });
  const waterMl = todayWater.reduce((sum, entry) => sum + entry.ml, 0);

  const value = useMemo<FoodContextValue>(() => ({
    todayEntries,
    totals: {
      kcal: Math.round(totals.kcal),
      protein: Math.round(totals.protein * 10) / 10,
      carbs: Math.round(totals.carbs * 10) / 10,
      fat: Math.round(totals.fat * 10) / 10,
    },
    goals: GOALS,
    waterMl,
    todayWater,
    recents,
    addEntry: entry => setEntries(current => [{
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
    }, ...current]),
    removeEntry: id => setEntries(current => current.filter(entry => entry.id !== id)),
    addWater: (ml = GLASS_ML) => setWaterEntries(current => [{
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ml,
      time: new Date().toISOString(),
    }, ...current]),
    addRecent: term => setRecents(current => [term, ...current.filter(item => item.toLowerCase() !== term.toLowerCase())].slice(0, 8)),
    clearRecents: () => setRecents([]),
  }), [todayEntries, totals, waterMl, todayWater, recents]);

  return <FoodContext.Provider value={value}>{children}</FoodContext.Provider>;
}

export function useFood() {
  const context = useContext(FoodContext);
  if (!context) throw new Error("useFood must be used inside FoodProvider");
  return context;
}