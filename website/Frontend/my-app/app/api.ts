export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://workout-app-g3ag.onrender.com/api").replace(/\/$/, "");
export const APK_DOWNLOAD_URL = "https://github.com/Mahesh-4017/WorkOut-App/releases/latest/download/WorkOut-App.apk";

export type ApiResponse<T> = { success: boolean; message?: string; data: T };

export type WorkoutCategory = { name: string; count: number };
export type BodyPart = { name: string; count: number; imageUrl?: string; categories: WorkoutCategory[] };
export type Exercise = {
  _id: string;
  title: string;
  description: string;
  bodyPart: string;
  category: string;
  muscles: string[];
  level: string;
  durationMinutes: number;
  equipment: string[];
  imageUrl: string;
  videoUrl: string;
  instructions: string[];
};
export type FeaturedCard = {
  _id: string;
  title: string;
  description: string;
  category: string;
  thumbnailUrl?: string;
  videoUrl: string;
};
export type PlannedWorkout = {
  id: string;
  exerciseId?: string;
  classId?: string;
  title: string;
  bodyPart: string;
  category: string;
  date: string;
  time: string;
  durationMinutes: number;
};
export type AppUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  gender?: string;
  age?: number;
  height?: number;
  weight?: number;
  goal?: string;
  createdAt?: string;
};
export type ProgressData = {
  sessions: { id: string; title: string; startedAt: string; seconds: number; calories: number }[];
  goals: { weeklySessions?: number; targetWeightKg?: number; dailySteps?: number; dailyCalories?: number } | null;
};

export function mediaUrl(value?: string) {
  if (!value?.trim()) return undefined;
  try {
    const url = new URL(value, new URL(API_BASE_URL).origin);
    return ["http:", "https:"].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (options.body) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers, cache: "no-store" });
  const payload = await response.json().catch(() => null) as ApiResponse<T> | null;
  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message || `Request failed (${response.status}).`);
  }
  return payload.data;
}
