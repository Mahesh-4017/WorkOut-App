export type Workout = {
  id: string;
  title: string;
  focus: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  minutes: number;
  type: "Strength" | "Cardio" | "Mobility" | "Yoga" | "HIIT";
  equipment: string[];
  muscle: "Full body" | "Upper body" | "Lower body" | "Core";
  tint?: string;
  tag?: string;
  collection?: "outdoor" | "mindful" | "essentials";
};

export const TINTS = {
  peach: "#FBE5C4",
  lavender: "#E6DFF6",
  mint: "#D8EEE0",
  lime: "#DDF58B",
  sage: "#DDE9E2",
};

export const CATALOG: Workout[] = [
  { id: "w1", title: "Ultimate Dumbbell Burn and Build", focus: "Core stability", level: "Beginner", minutes: 30, type: "Strength", equipment: ["Dumbbells"], muscle: "Full body", tag: "Strength", tint: TINTS.sage, collection: "essentials" },
  { id: "w2", title: "Lower Body Power", focus: "Legs & glutes", level: "Intermediate", minutes: 25, type: "Strength", equipment: ["Dumbbells"], muscle: "Lower body", tag: "Power", tint: TINTS.peach, collection: "essentials" },
  { id: "w3", title: "Upper Body Essentials", focus: "Arms & shoulders", level: "Beginner", minutes: 20, type: "Strength", equipment: ["Dumbbells", "Bands"], muscle: "Upper body", tint: TINTS.lavender, collection: "essentials" },
  { id: "w4", title: "Core Stability Circuit", focus: "Core", level: "Beginner", minutes: 20, type: "Strength", equipment: ["Dumbbells", "Bodyweight"], muscle: "Core", tint: TINTS.mint, collection: "essentials" },
  { id: "w5", title: "Evening Mobility Reset", focus: "Full body", level: "Beginner", minutes: 15, type: "Mobility", equipment: ["Bodyweight"], muscle: "Full body", tint: TINTS.mint, collection: "mindful" },
  { id: "w6", title: "Morning Yoga Flow", focus: "Full body", level: "Beginner", minutes: 25, type: "Yoga", equipment: ["Bodyweight"], muscle: "Full body", tint: TINTS.lavender, collection: "outdoor" },
  { id: "w7", title: "HIIT Express", focus: "Full body", level: "Intermediate", minutes: 15, type: "HIIT", equipment: ["Bodyweight"], muscle: "Full body", tint: TINTS.peach },
  { id: "w8", title: "Kettlebell Swing Session", focus: "Full body", level: "Advanced", minutes: 35, type: "Strength", equipment: ["Kettlebell"], muscle: "Full body", collection: "essentials" },
  { id: "w9", title: "Band Pull and Push", focus: "Arms & back", level: "Beginner", minutes: 20, type: "Strength", equipment: ["Bands"], muscle: "Upper body", tint: TINTS.lavender },
  { id: "w10", title: "Cardio Burn 40", focus: "Full body", level: "Intermediate", minutes: 40, type: "Cardio", equipment: ["Bodyweight"], muscle: "Full body", tint: TINTS.peach },
  { id: "w11", title: "Hip Mobility Flow", focus: "Hips & legs", level: "Beginner", minutes: 15, type: "Mobility", equipment: ["Bodyweight", "Bands"], muscle: "Lower body", tint: TINTS.mint, collection: "mindful" },
  { id: "w12", title: "Sun Salutation Outdoors", focus: "Full body", level: "Beginner", minutes: 20, type: "Yoga", equipment: ["Bodyweight"], muscle: "Full body", collection: "outdoor" },
];

export const COLLECTIONS = [
  { id: "outdoor" as const, title: "Outdoor Workout Collection", meta: "Yoga · 8 classes", tint: "#DCE8D8" },
  { id: "mindful" as const, title: "Mindful Fitness Collection", meta: "Meditation · 9 classes", tint: TINTS.peach },
  { id: "essentials" as const, title: "The Velocity Essentials", meta: "Strength · 12 classes", tint: TINTS.sage },
];

export const PROGRAM = {
  sessionsDone: 4,
  sessionsRequired: 6,
  checkInsDone: 2,
  checkInsTotal: 3,
  upcoming: 2,
};

export type Filters = {
  types: string[];
  duration: string | null;
  level: string | null;
  equipment: string[];
  muscle: string | null;
};

export const EMPTY_FILTERS: Filters = {
  types: [],
  duration: null,
  level: null,
  equipment: [],
  muscle: null,
};

export const FILTER_OPTIONS = {
  types: ["Strength", "Cardio", "Mobility", "Yoga", "HIIT"],
  duration: ["10–15 min", "20–30 min", "40+ min"],
  level: ["Beginner", "Intermediate", "Advanced"],
  equipment: ["Dumbbells", "Bodyweight", "Bands", "Kettlebell"],
  muscle: ["Full body", "Upper body", "Lower body", "Core"],
};

export const activeFilterCount = (filters: Filters) =>
  (filters.types.length ? 1 : 0) +
  (filters.duration ? 1 : 0) +
  (filters.level ? 1 : 0) +
  (filters.equipment.length ? 1 : 0) +
  (filters.muscle ? 1 : 0);

const durationBucket = (minutes: number) =>
  minutes <= 15 ? "10–15 min" : minutes >= 40 ? "40+ min" : "20–30 min";

export function filterWorkouts(
  workouts: Workout[],
  filters: Filters,
  query = "",
): Workout[] {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);

  return workouts.filter(workout => {
    if (filters.types.length && !filters.types.includes(workout.type)) return false;
    if (filters.duration && durationBucket(workout.minutes) !== filters.duration) return false;
    if (filters.level && workout.level !== filters.level) return false;
    if (filters.equipment.length && !filters.equipment.some(item => workout.equipment.includes(item))) return false;
    if (filters.muscle && workout.muscle !== filters.muscle) return false;
    if (terms.length) {
      const searchable = [
        workout.title,
        workout.focus,
        workout.type,
        workout.muscle,
        ...workout.equipment,
      ].join(" ").toLowerCase();
      if (!terms.every(term => searchable.includes(term))) return false;
    }
    return true;
  });
}
