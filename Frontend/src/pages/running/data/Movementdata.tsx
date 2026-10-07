// PLACEHOLDER DATA matching the design. Replace with your real step / health source
// (Health Connect, HealthKit, your API, or the step tracker + utils/highScore).

export const METRICS = {
  move: { value: 42, goal: 60, unit: "min", caption: "of 60 active min" },
  steps: { value: 8432, goal: 10000, unit: "", caption: "of 10,000 steps" },
  energy: { value: 2450, goal: 2800, unit: "kcal", caption: "of 2,800 kcal" },
} as const;

export const RECENT_ACTIVITY = [
  { id: "1", title: "Evening Run", meta: "Yesterday · 5.2 km", icon: "arrow-up", tint: "#B6F23A" },
  { id: "2", title: "Yoga Flow", meta: "Today · 6:00 AM", icon: "body-outline", tint: "#F6B04A" },
];

export type Range = "day" | "week" | "month";

export const TRENDS: Record<Range, { labels: string[]; values: number[]; selected: number }> = {
  day: { labels: ["6a", "9a", "12p", "3p", "6p", "9p"], values: [800, 2100, 1500, 1900, 1700, 432], selected: 3 },
  week: { labels: ["M", "T", "W", "T", "F", "S", "S"], values: [4200, 6800, 3500, 8200, 6100, 9400, 7000], selected: 4 },
  month: { labels: ["W1", "W2", "W3", "W4"], values: [41200, 48800, 36400, 52100], selected: 3 },
};

export const HIGHLIGHTS = [
  { id: "cal", label: "Calories burned", value: "2,450 kcal", icon: "flame-outline", color: "#F59E2B" },
  { id: "dist", label: "Total distance", value: "35.2 km", icon: "location-outline", color: "#7B4EF0" },
  { id: "goal", label: "Weekly goal", value: "10,000 steps", icon: "footsteps-outline", color: "#6BB300" },
];

export const MONTH_SUMMARY = { daysActive: 26, calories: 82, duration: "0:47:00" };

export const TODAY_SESSIONS = [
  { id: "1", title: "Resistance Day 8", coach: "Lauren Mitchell" },
  { id: "2", title: "Athletic Log Day LIFT", coach: "Mike Rodriguez" },
];